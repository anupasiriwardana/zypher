from typing import Dict, List, Any
from models.rule_metadata import RuleFileMetadata
from models.customRule import Finding

class BaseRule:
    METADATA: RuleFileMetadata
    
    def scan(self, 
             pipeline_data: Dict[str, Any], 
             file_lines: List[str], 
             file_path: str) -> List[Finding]:
        """Must be implemented by each vulnerability rule"""
        raise NotImplementedError