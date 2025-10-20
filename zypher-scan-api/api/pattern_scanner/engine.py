from .parser import PipelineParser
from .rule_loader import load_rules
from models.pattern import Finding
from typing import List, Dict
import os

class ScannerEngine:
    def __init__(self):
        self.parser = PipelineParser()
        self.rules = load_rules()

        # Only load the 7 CI/CD pattern rules
        self.rules = [
            rule for rule in self.rules if rule.METADATA["rule_id"].startswith("CICD-PATT-")
        ]

        print(f"Loaded {len(self.rules)} CI/CD Pattern Rules:")
        for rule in self.rules:
            print(f" - {rule.__class__.__name__}")

    def scan_all_files(self, file_dict: Dict[str, str]) -> List[Finding]:
        """
        Optimized scanning for 7 CI/CD Security Pattern rules.
        Scans across all files collectively, skipping redundant checks.
        """
        findings = []
        parsed_files = {}

        # === STEP 1: Pre-parse all YAMLs once ===
        for file_path, content in file_dict.items():
            try:
                pipeline_data, file_lines = self.parser.parse_content(content)
                parsed_files[file_path] = {
                    "data": pipeline_data,
                    "lines": file_lines,
                    "filename": os.path.basename(file_path).lower(),
                }
            except Exception as e:
                findings.append(Finding(
                    rule_id="SCANNER-ERROR",
                    severity="HIGH",
                    description=f"Parsing error in {os.path.basename(file_path)}: {str(e)}",
                    line_number=0,
                    filepath=file_path,
                    snippet="",
                    recommendation="Check YAML syntax and try again",
                    confidence="LOW"
                ))

        # === STEP 2: Context flags ===
        context_flags = {
            "pre_commit_sast": False,
            "build_time_sast": False,
            "lint_pattern": False,
            "secrets_detection": False,
            "artifact_signing": False,
            "credential_hygiene": False,
            "push_branch_sast": False
        }

        # === STEP 3: Optimized scanning logic ===
        for file_path, parsed in parsed_files.items():
            filename = parsed["filename"]
            pipeline_data = parsed["data"]
            file_lines = parsed["lines"]

            is_precommit = filename == ".pre-commit-config.yaml"
            is_ci_cd_file = any(x in filename for x in ["ci", "build", "pipeline", "gitlab", "github", "azure"])

            for rule in self.rules:
                rule_id = rule.METADATA["rule_id"]

                # --- Skip logic based on context ---
                if rule_id == "CICD-PATT-001" and context_flags["pre_commit_sast"]:
                    continue
                if rule_id == "CICD-PATT-002" and context_flags["push_branch_sast"]:
                    continue
                if rule_id == "CICD-PATT-003" and context_flags["build_time_sast"]:
                    continue
                if rule_id == "CICD-PATT-004" and context_flags["lint_pattern"]:
                    continue
                if rule_id == "CICD-PATT-005" and context_flags["artifact_signing"]:
                    continue
                if rule_id == "CICD-PATT-006" and context_flags["credential_hygiene"]:
                    continue
                if rule_id == "CICD-PATT-007" and context_flags["secrets_detection"]:
                    continue

                # --- File relevance filtering ---
                if rule_id == "CICD-PATT-001" and not is_precommit:
                    continue  # Pre-commit SAST should only check .pre-commit-config.yaml
                if rule_id != "CICD-PATT-001" and not is_ci_cd_file:
                    continue  # Other patterns only for CI/CD configs

                # --- Execute rule scan ---
                rule_findings = rule.scan(pipeline_data, file_lines, file_path)
                findings.extend(rule_findings)

                # --- Update context flags if rule triggered ---
                if rule_findings:
                    if rule_id == "CICD-PATT-001":
                        context_flags["pre_commit_sast"] = True
                    elif rule_id == "CICD-PATT-002":
                        context_flags["push_branch_sast"] = True
                    elif rule_id == "CICD-PATT-003":
                        context_flags["build_time_sast"] = True
                    elif rule_id == "CICD-PATT-004":
                        context_flags["lint_pattern"] = True
                    elif rule_id == "CICD-PATT-005":
                        context_flags["artifact_signing"] = True
                    elif rule_id == "CICD-PATT-006":
                        context_flags["credential_hygiene"] = True
                    elif rule_id == "CICD-PATT-007":
                        context_flags["secrets_detection"] = True

        # === STEP 4: Summary ===
        print("\n✅ Scan Summary (7 Pattern Rules):")
        for k, v in context_flags.items():
            print(f" - {k.replace('_', ' ').title()}: {'✔ Found' if v else '❌ Missing'}")

        print(f"\nTotal Findings: {len(findings)}\n")

        return findings
