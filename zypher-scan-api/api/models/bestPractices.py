from pydantic import BaseModel
from typing import Optional

class Vulnerability_Rule_File(BaseModel):
    rule_id : str
    rule_name : str
    status : str  # active, inactive
    file_content : str

class Finding(BaseModel):
    rule_id: str
    severity: str
    action: Optional[str] = "Ignore"
    description: str
    line_number: int
    filepath: str
    snippet: str
    recommendation: str
    confidence: str = "MEDIUM"  # HIGH, MEDIUM, LOW