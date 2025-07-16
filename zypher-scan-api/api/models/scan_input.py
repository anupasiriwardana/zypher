from pydantic import BaseModel

class RepoRequest(BaseModel):
    repo_url: str

class FileScanRequest(BaseModel):
    filename: str
    content: str
    