from typing import Dict, List, Any
from models.rule_metadata import RuleMetadata
from models.vulnerability import Finding

class BaseRule:
    METADATA: RuleMetadata
    
    def scan(self, 
             pipeline_data: Dict[str, Any], 
             file_lines: List[str], 
             file_path: str) -> List[Finding]:
        """Must be implemented by each vulnerability rule"""
        raise NotImplementedError