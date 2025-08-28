from pydantic import BaseModel

class CustomRuleFile(BaseModel):
    rule_id: str
    rule_name: str
    status: str  # active, disable
    file_content: str

class Finding(BaseModel):
    rule_id: str
    severity: str
    description: str
    line_number: int
    filepath: str
    snippet: str
    recommendation: str
    confidence: str = "MEDIUM"  # HIGH, MEDIUM, LOW