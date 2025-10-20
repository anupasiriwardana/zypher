from fastapi import APIRouter, HTTPException
from models.scan_input import RepoRequest
from pattern_scanner.engine import ScannerEngine
from pattern_scanner.scoreCalculator import PipelineScoreCalculator
from models.vulnerability import Finding
from typing import List, Dict
import httpx
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor

router = APIRouter(
    prefix='/pattern-scan',
    tags=['scan for patterns']
)

# Initialize scanner and calculator
scanner = ScannerEngine()
scoreCalculator = PipelineScoreCalculator()

# Thread pool for parallel file downloads
executor = ThreadPoolExecutor(max_workers=6)

# GitHub token
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
if not GITHUB_TOKEN:
    raise RuntimeError("Missing GITHUB_TOKEN in environment variables")


async def get_file_content(client: httpx.AsyncClient, download_url: str) -> str:
    """Fetch raw file content from GitHub."""
    try:
        response = await client.get(
            download_url,
            headers={
                "Accept": "application/vnd.github.raw",
                "Authorization": f"Bearer {GITHUB_TOKEN}",
            },
            timeout=10
        )
        response.raise_for_status()
        return response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching file content: {str(e)}")


@router.post("/")
async def scan_repo(repo_request: RepoRequest):
    """
    Scan all YAML files in a GitHub repository for the 7 CI/CD Security Patterns.
    """
    try:
        # === STEP 1: Validate repo URL ===
        repo_url = repo_request.repo_url.strip()
        if not repo_url.startswith("https://github.com/"):
            raise HTTPException(status_code=400, detail="Invalid GitHub URL. Must start with https://github.com/")

        repo_path = repo_url.replace("https://github.com/", "").rstrip("/")
        parts = repo_path.split("/")
        if len(parts) < 2:
            raise HTTPException(status_code=400, detail="Invalid GitHub repository path.")
        owner, repo = parts[0], parts[1]

        async with httpx.AsyncClient() as client:
            async def fetch_files_recursively(path: str = "") -> Dict[str, str]:
                """
                Recursively fetch YAML files and return {path: content}.
                """
                api_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
                try:
                    response = await client.get(
                        api_url,
                        headers={
                            "Accept": "application/vnd.github+json",
                            "Authorization": f"Bearer {GITHUB_TOKEN}",
                            "X-GitHub-Api-Version": "2022-11-28"
                        },
                        timeout=15
                    )
                    response.raise_for_status()
                    items = response.json()
                except httpx.HTTPStatusError as e:
                    raise HTTPException(status_code=e.response.status_code, detail=f"GitHub API error: {e.response.text}")

                all_files = {}

                async def handle_item(item):
                    item_type = item.get("type")
                    item_name = item.get("name", "")
                    item_path = item.get("path", "")

                    if item_type == "file" and item_name.lower().endswith((".yml", ".yaml")):
                        content = await get_file_content(client, item.get("download_url"))
                        if content:
                            all_files[item_path] = content
                    elif item_type == "dir":
                        sub_files = await fetch_files_recursively(item_path)
                        all_files.update(sub_files)

                # Fetch in parallel
                await asyncio.gather(*(handle_item(item) for item in items if isinstance(item, dict)))
                return all_files

            # === STEP 2: Fetch all YAMLs once ===
            all_yaml_files = await fetch_files_recursively()

            if not all_yaml_files:
                raise HTTPException(status_code=404, detail="No YAML configuration files found in this repository.")

            # === STEP 3: Run the optimized scanner on all files together ===
            loop = asyncio.get_event_loop()
            findings = await loop.run_in_executor(executor, lambda: scanner.scan_all_files(all_yaml_files))

            # === STEP 4: Organize results per file ===
            results = []
            for file_path, content in all_yaml_files.items():
                file_findings = [f.dict() for f in findings if f.filepath == file_path]
                results.append({
                    "path": file_path,
                    "findings": file_findings
                })

            # === STEP 5: Compute statistics ===
            total_findings = sum(len(f["findings"]) for f in results)
            all_findings_flat = [Finding(**finding) for f in results for finding in f["findings"]]

            score = scoreCalculator.calculate(all_findings_flat)
            severity_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}

            for f in all_findings_flat:
                if f.severity in severity_counts:
                    severity_counts[f.severity] += 1

            return {
                "status": "success",
                "repo_url": repo_url,
                "stats": {
                    "scanned_files": len(all_yaml_files),
                    "total_findings": total_findings,
                    "critical": severity_counts["CRITICAL"],
                    "high": severity_counts["HIGH"],
                    "medium": severity_counts["MEDIUM"],
                    "low": severity_counts["LOW"],
                    "vuln_score": score["final_score"],
                    "per_severity": score["per_severity"],
                    "risk_factor": score["risk_factor"]
                },
                "results": results
            }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
