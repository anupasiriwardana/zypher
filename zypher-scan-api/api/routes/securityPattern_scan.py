import os
import asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import yaml

router = APIRouter(
    prefix="/pattern-scan",
    tags=["scan for vulnerabilities"]
)

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
if not GITHUB_TOKEN:
    raise RuntimeError("Missing GITHUB_TOKEN in environment variables")


class RepoRequest(BaseModel):
    repo_url: str


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


def parse_push_event(yml_content: dict) -> bool:
    """
    Detect if the YAML contains a 'push' event with branch definitions.
    """
    if not isinstance(yml_content, dict):
        return False
    on_section = yml_content.get("on")
    if not on_section:
        return False
    if isinstance(on_section, dict) and "push" in on_section:
        push_section = on_section["push"]
        if isinstance(push_section, dict) and "branches" in push_section:
            return True
        elif push_section is None:
            # push: {} counts as push event
            return True
    elif isinstance(on_section, list) and "push" in on_section:
        return True
    elif isinstance(on_section, str) and on_section.lower() == "push":
        return True
    return False


def check_push_pattern(file_dict: dict):
    results = []

    for fname, content in file_dict.items():
        try:
            yml = yaml.safe_load(content) or {}
        except:
            yml = {}

        found = parse_push_event(yml)
        snippet = content[:200] if found else ""

        results.append({
            "rule_id": "CICD-PATT-002",
            "severity": "CRITICAL",
            "description": "Push-to-Branch SAST Checkpoint",
            "line_number": 0,
            "filepath": fname,
            "snippet": snippet,
            "recommendation": f"{'Found' if found else 'Missing'}: Push-to-Branch SAST Checkpoint",
            "confidence": "HIGH"
        })
    return results


@router.post("/push-check")
async def scan_push_pattern(repo_request: RepoRequest):
    repo_url = repo_request.repo_url.strip()
    if not repo_url.startswith("https://github.com/"):
        raise HTTPException(status_code=400, detail="Invalid GitHub URL format")
    parts = repo_url.replace("https://github.com/", "").rstrip("/").split("/")
    if len(parts) < 2:
        raise HTTPException(status_code=400, detail="Invalid GitHub repo path")
    owner, repo = parts[0], parts[1]

    async with httpx.AsyncClient() as client:
        file_dict = await fetch_all_yaml_files(client, owner, repo)

    findings = check_push_pattern(file_dict)

    return {
        "status": "success",
        "repo_url": repo_url,
        "patterns": findings,
        "stats": {
            "scanned_files": len(file_dict),
            "total_findings": len(findings),
        }
    }
