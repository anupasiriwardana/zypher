from .base_rule import BaseRule
from models.vulnerability import Finding
import re
from typing import Dict, List, Any, Optional

class DependencyChainAbuseRule(BaseRule):
    METADATA = {
        "rule_id": "CICD-VULN-003",
        "rule_name": "Dependency Chain Abuse",
        "severity": "HIGH"
    }
    
    def scan(self, pipeline_data: Dict[str, Any], file_lines: List[str], file_path: str) -> List[Finding]:
        """
        Scan for dependency chain vulnerabilities in CI/CD pipelines.
        
        Args:
            pipeline_data: The parsed YAML pipeline configuration
            file_lines: The raw file content as a list of strings
            file_path: Path to the file being scanned
            
        Returns:
            A list of Finding objects for detected vulnerabilities
        """
        findings = []
        
        # Check for job steps
        if "jobs" in pipeline_data:
            for job_name, job_config in pipeline_data["jobs"].items():
                if "steps" in job_config:
                    self._scan_job_steps(job_name, job_config["steps"], file_lines, file_path, findings)
        
        return findings
        
    def _scan_job_steps(self, job_name: str, steps: List[Dict[str, Any]], 
                      file_lines: List[str], file_path: str, findings: List[Finding]) -> None:
        """Scan job steps for dependency chain vulnerabilities"""
        for step_index, step in enumerate(steps):
            # Check for actions that don't have pinned versions (using @ syntax)
            if "uses" in step:
                action_ref = step["uses"]
                line_num = self._find_line_number(file_lines, "uses", action_ref)
                
                # Check for unpinned versions (no @)
                if "@" not in action_ref:
                    findings.append(Finding(
                        rule_id=self.METADATA["rule_id"],
                        severity=self.METADATA["severity"],
                        description=f"Unpinned action version: {action_ref}",
                        line_number=line_num,
                        filepath=file_path,
                        snippet=self._get_snippet(file_lines, line_num),
                        recommendation=f"Pin the action to a specific version hash, e.g., {action_ref}@v2.1.0 " +
                                       f"or even better with a SHA: {action_ref}@a1b2c3d4"
                    ))
                # Check for actions using only major version (@v1, @v2, etc.)
                elif re.search(r"@v\d+$", action_ref):
                    findings.append(Finding(
                        rule_id=self.METADATA["rule_id"],
                        severity=self.METADATA["severity"],
                        description=f"Action only pinned to major version: {action_ref}",
                        line_number=line_num,
                        filepath=file_path,
                        snippet=self._get_snippet(file_lines, line_num),
                        recommendation="Pin to exact version using a commit SHA for better security"
                    ))
            
            # Check for package installation commands
            if "run" in step and isinstance(step["run"], str):
                command = step["run"].lower()
                line_num = self._find_command_line(file_lines, step)
                
                # Check for npm/yarn install without proper lockfile usage
                if ("npm install" in command or "yarn add" in command) and "--no-save" not in command:
                    if not self._verify_lockfile_exists(file_lines):
                        findings.append(Finding(
                            rule_id=self.METADATA["rule_id"],
                            severity=self.METADATA["severity"],
                            description="Dependency installation without lockfile verification",
                            line_number=line_num,
                            filepath=file_path,
                            snippet=self._get_snippet(file_lines, line_num),
                            recommendation="Use package-lock.json or yarn.lock and install with npm ci or yarn install --frozen-lockfile"
                        ))
                
                # Check for pip install without pinned versions
                if "pip install" in command and not re.search(r"pip install .*==[\d\.]+", command):
                    findings.append(Finding(
                        rule_id=self.METADATA["rule_id"],
                        severity=self.METADATA["severity"],
                        description="Python dependencies without pinned versions",
                        line_number=line_num,
                        filepath=file_path,
                        snippet=self._get_snippet(file_lines, line_num),
                        recommendation="Pin dependencies to exact versions using pip install pkg==1.2.3 or requirements.txt with pinned versions"
                    ))
    
    def _find_line_number(self, file_lines: List[str], key: str, value: str) -> int:
        """Find the line number for a key-value pair in the file"""
        for i, line in enumerate(file_lines):
            if key in line and str(value) in line:
                return i + 1  # Convert to 1-based line numbers
        return 1  # Default to line 1 if not found
    
    def _find_command_line(self, file_lines: List[str], step: Dict[str, Any]) -> int:
        """Find the line number for a run command in a step"""
        step_name = step.get("name", "")
        run_command = step.get("run", "")
        
        # Try to find by step name first
        if step_name:
            for i, line in enumerate(file_lines):
                if f"name: {step_name}" in line:
                    # Look for run: in the next few lines
                    for j in range(i+1, min(i+5, len(file_lines))):
                        if "run:" in file_lines[j]:
                            return j + 1
        
        # Try to find by the run command content
        if run_command:
            first_line = run_command.split("\n")[0].strip()
            for i, line in enumerate(file_lines):
                if first_line in line:
                    return i + 1
        
        return 1  # Default to line 1 if not found
    
    def _get_snippet(self, file_lines: List[str], line_num: int) -> str:
        """Get the content of a specific line"""
        if 1 <= line_num <= len(file_lines):
            return file_lines[line_num - 1].strip()
        return ""
    
    def _verify_lockfile_exists(self, file_lines: List[str]) -> bool:
        """Check if the pipeline references or checks for lockfiles"""
        lockfile_indicators = ["package-lock.json", "yarn.lock", "npm ci", "--frozen-lockfile"]
        for line in file_lines:
            if any(indicator in line for indicator in lockfile_indicators):
                return True
        return False