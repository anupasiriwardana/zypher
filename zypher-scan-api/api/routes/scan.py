from fastapi import APIRouter, HTTPException
from models.scan_input import RepoRequest
import requests

router = APIRouter(
    prefix='/scan',
    tags=['scan_input']
)

@router.post("/")
async def scan_repo(repo_request: RepoRequest):
    try:
        # Validate and extract owner/repo from URL
        repo_url = repo_request.repo_url.strip()
        if not repo_url.startswith("https://github.com/"):
            raise HTTPException(status_code=400, detail="Invalid GitHub URL format")
        
        repo_path = repo_url.replace("https://github.com/", "").rstrip("/")
        parts = repo_path.split("/")
        if len(parts) < 2:
            raise HTTPException(status_code=400, detail="Invalid GitHub repository path")
        
        owner, repo = parts[0], parts[1]
        
        # Recursive scan function
        def fetch_files_recursively(path=""):
            api_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
            response = requests.get(
                api_url,
                headers={
                    "Accept": "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"GitHub API error: {response.text}"
                )

            items = response.json()
            yaml_files = []
            
            for item in items:
                if not isinstance(item, dict):
                    continue
                    
                item_type = item.get("type")
                item_name = item.get("name", "")
                item_path = item.get("path", "")

                if item_type == "file" and item_name.lower().endswith(('.yml', '.yaml')):
                    yaml_files.append({
                        "path": item_path,
                        "download_url": item.get("download_url"),
                        "html_url": item.get("html_url")
                    })
                elif item_type == "dir":
                    yaml_files.extend(fetch_files_recursively(item_path))
            
            return yaml_files

        yaml_files = fetch_files_recursively()
        return {"yaml_files": yaml_files}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")