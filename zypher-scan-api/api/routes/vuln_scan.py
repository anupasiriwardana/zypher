from fastapi import APIRouter, HTTPException
from models.scan_input import RepoRequest
from vuln_scanner.engine import ScannerEngine
from vuln_scanner.scoreCalculator import PipelineScoreCalculator
import httpx
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
from models.vulnerability import Finding
from typing import List

router = APIRouter(
    prefix='/vulnerability-scan',
    tags=['scan for vulnerabilities']
)

# Initialize scanner once
scanner = ScannerEngine()
scoreCalculator = PipelineScoreCalculator()


# Thread pool for scanning
executor = ThreadPoolExecutor(max_workers=4)

# Load GitHub token from environment
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
if not GITHUB_TOKEN:
    raise RuntimeError("Missing GITHUB_TOKEN in environment variables")

def sync_scan(content: str, file_path: str) -> List[Finding]:
    """Wrapper for synchronous scanning"""
    return scanner.scan_content(content, file_path)

async def get_file_content(client: httpx.AsyncClient, download_url: str) -> str:
    """Fetch raw file content from GitHub"""
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
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"GitHub API error: {e.response.text}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching file content: {str(e)}"
        )

@router.post("/")
async def scan_repo(repo_request: RepoRequest):
    try:
        # Validate and extract owner/repo from URL
        repo_url = repo_request.repo_url.strip()
        if not repo_url.startswith("https://github.com/"):
            raise HTTPException(
                status_code=400,
                detail="Invalid GitHub URL format. Must start with 'https://github.com/'"
            )
        
        repo_path = repo_url.replace("https://github.com/", "").rstrip("/")
        parts = repo_path.split("/")
        if len(parts) < 2:
            raise HTTPException(
                status_code=400,
                detail="Invalid GitHub repository path. Format: https://github.com/owner/repo"
            )
        
        owner, repo = parts[0], parts[1]
        
        async with httpx.AsyncClient() as client:
            async def fetch_and_scan_files(path: str = "") -> List[dict]:
                """Recursively fetch and scan YAML files in a GitHub repo"""
                # Build GitHub API URL for contents
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
                    raise HTTPException(
                        status_code=e.response.status_code,
                        detail=f"GitHub API error: {e.response.text}"
                    )
                
                yaml_files = []
                
                for item in items:
                    if not isinstance(item, dict):
                        continue
                        
                    item_type = item.get("type")
                    item_name = item.get("name", "")
                    item_path = item.get("path", "")

                    if item_type == "file" and item_name.lower().endswith(('.yml', '.yaml')):
                        content = await get_file_content(client, item.get("download_url"))
                        if content:
                            # Run scanner in thread pool
                            findings = await asyncio.get_event_loop().run_in_executor(
                                executor, 
                                sync_scan, 
                                content, 
                                item_path
                            )
                            
                            # Maintain existing fields + add findings
                            yaml_files.append({
                                "path": item_path,
                                "download_url": item.get("download_url"),
                                "html_url": item.get("html_url"),
                                "findings": [f.dict() for f in findings]
                            })
                    elif item_type == "dir":
                        sub_files = await fetch_and_scan_files(item_path)
                        yaml_files.extend(sub_files)
                
                return yaml_files

            # Start scanning from root directory
            results = await fetch_and_scan_files()
            
            # Calculate overall statistics
            total_findings = sum(len(file["findings"]) for file in results)
            score = scoreCalculator.calculate([Finding(**finding) for file in results for finding in file["findings"]])
            severity_counts = {
                "CRITICAL": 0,
                "HIGH": 0,
                "MEDIUM": 0,
                "LOW": 0
            }
            
            for file in results:
                for finding in file["findings"]:
                    severity = finding["severity"]
                    if severity in severity_counts:
                        severity_counts[severity] += 1
            
            return {
                "status": "success",
                "repo_url": repo_url,
                "results": results,
                "stats": {
                    "scanned_files": len(results),
                    "total_findings": total_findings,
                    "critical": severity_counts["CRITICAL"],
                    "high": severity_counts["HIGH"],
                    "medium": severity_counts["MEDIUM"],
                    "low": severity_counts["LOW"],
                    "vuln score": score["final_score"],
                    "vuln per_severity": score["per_severity"],
                    "risk_factor": score["risk_factor"]
                }
            }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )