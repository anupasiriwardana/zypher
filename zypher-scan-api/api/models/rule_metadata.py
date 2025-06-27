from pydantic import BaseModel

class RuleMetadata(BaseModel):
    id: str
    name: str
    description: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    category: str
    remediation: str