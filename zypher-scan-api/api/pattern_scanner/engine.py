import os
from typing import Dict, List
from .parser import PipelineParser
from .rule_loader import load_rules
from models.pattern import Finding

class ScannerEngine:
    def __init__(self):
        self.parser = PipelineParser()
        
        # Load rules dynamically from DB
        self.rules = load_rules()

        # Optional: keep only CI/CD pattern rules
        self.rules = [
            rule for rule in self.rules if rule.METADATA["rule_id"].startswith("CICD-PATT-")
        ]
        print(f"Loaded {len(self.rules)} CI/CD Pattern Rules:")
        for rule in self.rules:
            print(f" - {rule.__class__.__name__}")

    def scan_all_files(self, file_dict: Dict[str, str]) -> List[Finding]:
        """
        Scan all files at repo-level.
        Returns one finding per pattern: either found or missing.
        """
        findings = []

        # Pre-parse all YAML files
        parsed_files = {}
        for path, content in file_dict.items():
            try:
                parsed_data, lines = self.parser.parse_content(content)
                parsed_files[path] = {"data": parsed_data, "lines": lines}
            except Exception as e:
                findings.append(Finding(
                    rule_id="SCANNER-ERROR",
                    severity="HIGH",
                    description=f"Parsing error in {os.path.basename(path)}: {str(e)}",
                    line_number=0,
                    filepath=path,
                    snippet="",
                    recommendation="Check YAML syntax and try again",
                    confidence="LOW"
                ))

        # Run each rule across all parsed files
        for rule in self.rules:
            rule_found = False
            for path, parsed in parsed_files.items():
                try:
                    # Rule scan returns a list of Finding objects
                    rule_findings = rule.scan(parsed["data"], parsed["lines"], path)
                    if rule_findings:
                        findings.extend(rule_findings)
                        rule_found = True
                except Exception as e:
                    findings.append(Finding(
                        rule_id=rule.METADATA.get("rule_id", "UNKNOWN"),
                        severity="HIGH",
                        description=f"Error scanning {path} with rule {rule.METADATA.get('rule_name')}: {str(e)}",
                        line_number=0,
                        filepath=path,
                        snippet="",
                        recommendation="Check rule implementation and YAML format",
                        confidence="LOW"
                    ))

            # If rule was never found, append a missing repo-level finding
            if not rule_found:
                findings.append(Finding(
                    rule_id=rule.METADATA["rule_id"],
                    severity="CRITICAL",
                    description=f"{rule.METADATA['rule_name']} missing across repo",
                    line_number=0,
                    filepath="REPO_LEVEL",
                    snippet="",
                    recommendation=f"Ensure {rule.METADATA['rule_name']} is properly implemented in CI/CD configs",
                    confidence="LOW"
                ))

        return findings
