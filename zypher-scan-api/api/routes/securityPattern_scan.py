import os
import httpx
import yaml
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Tuple

router = APIRouter(
    prefix="/pattern-scan",
    tags=["scan for vulnerabilities"]
)

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
if not GITHUB_TOKEN:
    raise RuntimeError("Missing GITHUB_TOKEN in environment variables")


class RepoRequest(BaseModel):
    repo_url: str


class PipelineParser:
    SAST_TOOLS = ["semgrep", "codeql", "bandit", "gosec", "checkmarx", "sonar-scanner", "fortify", "veracode"]

    def _fix_on_key(self, data):
        if isinstance(data, dict):
            new_data = {}
            for k, v in data.items():
                if k is True:
                    new_data['on'] = self._fix_on_key(v)
                else:
                    new_data[k] = self._fix_on_key(v)
            return new_data
        elif isinstance(data, list):
            return [self._fix_on_key(item) for item in data]
        else:
            return data

    def parse_content(self, content: str) -> Tuple[Dict, List[str]]:
        try:
            lines = content.splitlines(keepends=True)
            data = yaml.safe_load(content) or {}
            data = self._fix_on_key(data)
            return data, lines
        except yaml.YAMLError as e:
            line_no = e.problem_mark.line + 1 if hasattr(e, 'problem_mark') else 0
            raise ValueError(f"YAML error at line {line_no}: {str(e)}")

    def detect_push_to_branch_sast(self, data: Dict) -> bool:
        """
        Detects push-to-branch SAST:
        - Must have `on: push`
        - At least one job step using a SAST tool
        """
        on_section = data.get("on")
        if not on_section or not isinstance(on_section, dict) or "push" not in on_section:
            return False

        jobs = data.get("jobs", {})
        if not isinstance(jobs, dict):
            return False

        for job_name, job_def in jobs.items():
            steps = job_def.get("steps", [])
            for step in steps:
                run = step.get("run", "").lower()
                uses = step.get("uses", "").lower()
                if any(tool in run or tool in uses for tool in self.SAST_TOOLS):
                    return True
        return False


async def get_file_content(client: httpx.AsyncClient, download_url: str) -> str:
    response = await client.get(download_url, headers={
        "Accept": "application/vnd.github.raw",
        "Authorization": f"Bearer {GITHUB_TOKEN}"
    }, timeout=10)
    response.raise_for_status()
    return response.text


async def fetch_all_yaml_files(client: httpx.AsyncClient, owner: str, repo: str, path: str = "") -> dict:
    api_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    response = await client.get(api_url, headers={
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {GITHUB_TOKEN}"
    }, timeout=15)
    response.raise_for_status()
    items = response.json()
    files = {}
    for item in items:
        if not isinstance(item, dict):
            continue
        item_type = item.get("type")
        item_name = item.get("name", "")
        item_path = item.get("path", "")
        if item_type == "file" and item_name.lower().endswith((".yml", ".yaml")):
            content = await get_file_content(client, item.get("download_url"))
            files[item_path] = content
        elif item_type == "dir":
            sub_files = await fetch_all_yaml_files(client, owner, repo, item_path)
            files.update(sub_files)
    return files


@router.post("/")
async def scan_repo(repo_request: RepoRequest):
    repo_url = repo_request.repo_url.strip()
    if not repo_url.startswith("https://github.com/"):
        raise HTTPException(status_code=400, detail="Invalid GitHub URL format")
    parts = repo_url.replace("https://github.com/", "").rstrip("/").split("/")
    if len(parts) < 2:
        raise HTTPException(status_code=400, detail="Invalid GitHub repo path")
    owner, repo = parts[0], parts[1]

    async with httpx.AsyncClient() as client:
        file_dict = await fetch_all_yaml_files(client, owner, repo)

    parser = PipelineParser()
    findings = []

    for fname, content in file_dict.items():
        try:
            data, _ = parser.parse_content(content)
            found = parser.detect_push_to_branch_sast(data)
            findings.append({
                "file": fname,
                "push_to_branch_sast_detected": found
            })
        except Exception as e:
            findings.append({
                "file": fname,
                "push_to_branch_sast_detected": False,
                "error": str(e)
            })

    return {
        "status": "success",
        "repo_url": repo_url,
        "scanned_files": len(file_dict),
        "findings": findings
    }
