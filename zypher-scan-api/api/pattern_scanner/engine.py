from .parser import PipelineParser
from .rule_loader import load_rules
from models.pattern import Finding
from typing import List

class ScannerEngine:
    def __init__(self):
        self.parser = PipelineParser()
        self.rules = load_rules()  # Load all vulnerability rules
        print(f"Loaded {len(self.rules)} Security Pattern rules")  # Debug log
        for rule in self.rules:
            print(f" - {rule.__class__.__name__}")  # Debug log
    
    def scan_content(self, content: str, file_path: str) -> List[Finding]:
        """Scan YAML content using all rules"""
        try:
            pipeline_data, file_lines = self.parser.parse_content(content)
            pipeline_type = self.parser.detect_pipeline_type(pipeline_data)
            
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