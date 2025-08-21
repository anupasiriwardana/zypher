from .parser import PipelineParser
from models.customRule import Finding
from typing import List, Optional

class ScannerEngine:
    def __init__(self):
        self.parser = PipelineParser()
        self.rules = []  
    
    def scan_content(self, content: str, file_path: str, custom_rules : Optional[List[object]] = None) -> List[Finding]:
        """Scan YAML content using custom rule to test"""
        try:
            pipeline_data, file_lines = self.parser.parse_content(content)
            pipeline_type = self.parser.detect_pipeline_type(pipeline_data)
            
            self.rules = list(custom_rules)
            
            findings = []
            for rule in self.rules:
                rule_findings = rule.scan(pipeline_data, file_lines, file_path)
                findings.extend(rule_findings)
                
            return findings
        except Exception as e:
            # Return error finding
            return [Finding(
                rule_id="SCANNER-ERROR",
                severity="HIGH",
                description=f"Scanning error: {str(e)}",
                line_number=0,
                filepath=file_path,
                snippet="",
                recommendation="Check YAML syntax and try again"
            )]