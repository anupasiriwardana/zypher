from .parser import PipelineParser
from .rule_loader import load_rules
from models.pattern import Finding
from typing import List, Dict
import os

class ScannerEngine:
    def __init__(self):
        self.parser = PipelineParser()
        self.rules = load_rules()
        print(f"Loaded {len(self.rules)} Security Pattern rules")
        for rule in self.rules:
            print(f" - {rule.__class__.__name__}")

    def scan_all_files(self, file_dict: Dict[str, str]) -> List[Finding]:
        """
        Scans all files collectively, avoiding redundant pattern scans.
        file_dict = { file_path: file_content, ... }
        """
        findings = []
        parsed_files = {}

        # Step 1: Parse all YAMLs first
        for file_path, content in file_dict.items():
            try:
                pipeline_data, file_lines = self.parser.parse_content(content)
                pipeline_type = self.parser.detect_pipeline_type(pipeline_data)
                parsed_files[file_path] = {
                    "data": pipeline_data,
                    "lines": file_lines,
                    "type": pipeline_type
                }
            except Exception as e:
                findings.append(Finding(
                    rule_id="SCANNER-ERROR",
                    severity="HIGH",
                    description=f"Parsing error in {os.path.basename(file_path)}: {str(e)}",
                    line_number=0,
                    filepath=file_path,
                    snippet="",
                    recommendation="Check YAML syntax and try again"
                ))

        # Step 2: Smart rule scanning control flags
        sast_found = False
        precommit_sast_found = False
        lint_found = False

        # Step 3: Intelligent scanning logic
        for file_path, parsed in parsed_files.items():
            pipeline_data = parsed["data"]
            file_lines = parsed["lines"]

            # Recognize special files
            filename = os.path.basename(file_path).lower()
            is_precommit = filename == ".pre-commit-config.yaml"
            is_ci_file = any(x in filename for x in ["ci", "build", "pipeline", "github", "gitlab"])

            for rule in self.rules:
                rule_name = rule.__class__.__name__.lower()

                # Skip redundant scans
                if "precommitsast" in rule_name and precommit_sast_found:
                    continue
                if "buildtimesast" in rule_name and sast_found:
                    continue
                if "linter" in rule_name and lint_found:
                    continue

                rule_findings = rule.scan(pipeline_data, file_lines, file_path)
                if rule_findings:
                    findings.extend(rule_findings)

                    # Update discovery flags if rule was successfully triggered
                    if "precommitsast" in rule_name and any("sast" in f.description.lower() for f in rule_findings):
                        precommit_sast_found = True
                    if "buildtimesast" in rule_name and any("sast" in f.description.lower() for f in rule_findings):
                        sast_found = True
                    if "linter" in rule_name and any("lint" in f.description.lower() for f in rule_findings):
                        lint_found = True

        # Step 4: Post-scan summary (optional)
        print("✅ Scan summary:")
        print(f" - Pre-commit SAST rule triggered: {precommit_sast_found}")
        print(f" - Build-time SAST rule triggered: {sast_found}")
        print(f" - Linter rule triggered: {lint_found}")
        print(f" - Total findings: {len(findings)}")

        return findings
