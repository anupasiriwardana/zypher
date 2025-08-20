from pydantic import BaseModel

class CustomRuleFile(BaseModel):
    rule_id: str
    rule_name: str
    status: str  # active, disable
    file_content: str
