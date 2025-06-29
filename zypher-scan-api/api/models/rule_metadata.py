from pydantic import BaseModel

class RuleMetadata(BaseModel):
    rule_id: str
    name: str
    description: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    category: str
    remediation: str

class RuleFileMetadata(BaseModel):
    rule_id: str
    rule_name: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW