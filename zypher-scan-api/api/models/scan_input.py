from pydantic import BaseModel
from typing import Optional

class RepoRequest(BaseModel):
    repo_url: str
    user_id: Optional[str] = "unknown"

class FileScanRequest(BaseModel):
    filename: str
    content: str
    user_id: Optional[str] = "6873d0a1b8f41c7da5fe5ffd"

class CustomRuleTestRequest(BaseModel):
    rule_id : str
    rule_name: Optional[str] = None
    content : str
    