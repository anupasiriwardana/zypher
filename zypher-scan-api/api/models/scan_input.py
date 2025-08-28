from pydantic import BaseModel
from typing import Optional

class RepoRequest(BaseModel):
    repo_url: str

class FileScanRequest(BaseModel):
    filename: str
    content: str

class CustomRuleTestRequest(BaseModel):
    rule_id : str
    rule_name: Optional[str] = None
    content : str
    