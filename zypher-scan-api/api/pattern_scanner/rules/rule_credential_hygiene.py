from .base_rule import BaseRule
from models.vulnerability import Finding
import re
from typing import Dict, List, Any, Optional, Tuple

class CredentialHygieneRule(BaseRule):
    METADATA = {
        "rule_id": "CICD-VULN-006",
        "rule_name": "Insufficient Credential Hygiene",
        "severity": "CRITICAL"
    }
    
    def __init__(self):
        # Regex patterns for detecting potential hardcoded credentials
        self.credential_patterns = [
            r"password[\"\':\s]*=[\"\'\s]*[a-zA-Z0-9_\-\+\.\@\#\$\%\^\&\*\(\)\[\]\{\}\<\>\~\`]{3,}",
            r"pwd[\"\':\s]*=[\"\'\s]*[a-zA-Z0-9_\-\+\.\@\#\$\%\^\&\*\(\)\[\]\{\}\<\>\~\`]{3,}",
            r"passwd[\"\':\s]*=[\"\'\s]*[a-zA-Z0-9_\-\+\.\@\#\$\%\^\&\*\(\)\[\]\{\}\<\>\~\`]{3,}",
            r"apikey[\"\':\s]*=[\"\'\s]*[a-zA-Z0-9_\-\+\.\@\#\$\%\^\&\*\(\)\[\]\{\}\<\>\~\`]{3,}",
            r"api_key[\"\':\s]*=[\"\'\s]*[a-zA-Z0-9_\-\+\.\@\#\$\%\^\&\*\(\)\[\]\{\}\<\>\~\`]{3,}",
            r"secret[\"\':\s]*=[\"\'\s]*[a-zA-Z0-9_\-\+\.\@\#\$\%\^\&\*\(\)\[\]\{\}\<\>\~\`]{3,}",
            r"token[\"\':\s]*=[\"\'\s]*[a-zA-Z0-9_\-\+\.\@\#\$\%\^\&\*\(\)\[\]\{\}\<\>\~\`]{3,}",
            r"credential[\"\':\s]*=[\"\'\s]*[a-zA-Z0-9_\-\+\.\@\#\$\%\^\&\*\(\)\[\]\{\}\<\>\~\`]{3,}",
            r"auth[\"\':\s]*=[\"\'\s]*[a-zA-Z0-9_\-\+\.\@\#\$\%\^\&\*\(\)\[\]\{\}\<\>\~\`]{3,}"
        ]
        
        # AWS credential patterns
        self.aws_key_pattern = r"(?:ACCESS|SECRET)_?KEY(?:_ID)?[\"\':\s]*=[\"\'\s]*(?:AKIA)[a-zA-Z0-9]{16,}"
        
        # General secret patterns
        self.secret_patterns = [
            r"-----BEGIN (RSA|OPENSSH|DSA|EC|PGP) PRIVATE KEY-----",
            r"eyJhbGciOiJ[^\"]{50,}",  # JWT tokens
            r"ghp_[a-zA-Z0-9]{36}",     # GitHub personal access tokens
            r"xoxb-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}"  # Slack tokens
        ]
    
    def scan(self, pipeline_data: Dict[str, Any], file_lines: List[str], file_path: str) -> List[Finding]:
        """Scan for hardcoded credentials and poor credential management"""
        print(f"Starting scan on {file_path}")  # Debug log
        findings = []
        
        # 1. Check for hardcoded credentials in environment variables
        findings.extend(self._check_env_vars(pipeline_data, file_lines, file_path))
        
        # 2. Scan through all lines for credential patterns
        findings.extend(self._scan_lines(file_lines, file_path))
        
        # 3. Check for unprotected uses of secrets
        findings.extend(self._check_secret_exposure(pipeline_data, file_lines, file_path))
        
        print(f"Found {len(findings)} credential hygiene issues")
        return findings
        
    def _check_env_vars(self, pipeline_data: Dict[str, Any], file_lines: List[str], file_path: str) -> List[Finding]:
        """Check environment variables for hardcoded credentials"""
        findings = []
        
        # Recursively find all env sections
        env_sections = self._find_env_sections(pipeline_data)
        
        for env_section in env_sections:
            if isinstance(env_section, dict):
                for key, value in env_section.items():
                    if isinstance(value, str) and self._is_credential_key(key):
                        line_num = self._find_key_line(file_lines, key)
                        if line_num:
                            findings.append(Finding(
                                rule_id=self.METADATA["rule_id"],
                                severity=self.METADATA["severity"],
                                description=f"Hardcoded credential in environment variable '{key}'",
                                line_number=line_num,
                                filepath=file_path,
                                snippet=self._get_line_snippet(file_lines, line_num),
                                recommendation="Use secret management services, avoid hardcoded credentials, and rotate secrets regularly",
                                confidence="HIGH"
                            ))
        return findings
    
    def _scan_lines(self, file_lines: List[str], file_path: str) -> List[Finding]:
        """Scan all lines for credential-like patterns"""
        findings = []
        
        for line_num, line in enumerate(file_lines, 1):
            # Check for credential patterns
            for pattern in self.credential_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    findings.append(Finding(
                        rule_id=self.METADATA["rule_id"],
                        severity=self.METADATA["severity"],
                        description="Potential hardcoded credential found",
                        line_number=line_num,
                        filepath=file_path,
                        snippet=line.strip(),
                        recommendation="Use secret management services, avoid hardcoded credentials, and rotate secrets regularly",
                        confidence="MEDIUM"
                    ))
                    break  # Avoid multiple findings per line
            
            # Check for AWS key patterns
            if re.search(self.aws_key_pattern, line, re.IGNORECASE):
                findings.append(Finding(
                    rule_id=self.METADATA["rule_id"],
                    severity=self.METADATA["severity"],
                    description="AWS access key found in configuration",
                    line_number=line_num,
                    filepath=file_path,
                    snippet=line.strip(),
                    recommendation="Use AWS role-based authentication instead of access keys",
                    confidence="HIGH"
                ))
            
            # Check for known secret patterns
            for pattern in self.secret_patterns:
                if re.search(pattern, line):
                    findings.append(Finding(
                        rule_id=self.METADATA["rule_id"],
                        severity=self.METADATA["severity"],
                        description="Known secret pattern detected",
                        line_number=line_num,
                        filepath=file_path,
                        snippet=line.strip(),
                        recommendation="Immediately rotate this secret and store in a secure vault",
                        confidence="HIGH"
                    ))
        
        return findings
    
    def _check_secret_exposure(self, pipeline_data: Dict[str, Any], file_lines: List[str], file_path: str) -> List[Finding]:
        """Check for unprotected uses of secrets"""
        findings = []
        
        # Check for echo commands that might expose secrets
        if "jobs" in pipeline_data:
            for job_name, job_config in pipeline_data["jobs"].items():
                if "steps" in job_config:
                    for step in job_config["steps"]:
                        if "run" in step and isinstance(step["run"], str):
                            if "echo" in step["run"].lower() and "${{" in step["run"]:
                                line_num = self._find_step_line(file_lines, step)
                                if line_num:
                                    findings.append(Finding(
                                        rule_id=self.METADATA["rule_id"],
                                        severity=self.METADATA["severity"],
                                        description="Potential secret exposure through echo command",
                                        line_number=line_num,
                                        filepath=file_path,
                                        snippet=self._get_line_snippet(file_lines, line_num),
                                        recommendation="Avoid printing secrets in pipeline commands",
                                        confidence="MEDIUM"
                                    ))
        
        # Check for secrets in logs
        if "steps" in pipeline_data:
            for step in pipeline_data["steps"]:
                if "run" in step and "echo" in step["run"].lower() and "secret" in step["run"].lower():
                    line_num = self._find_step_line(file_lines, step)
                    if line_num:
                        findings.append(Finding(
                            rule_id=self.METADATA["rule_id"],
                            severity=self.METADATA["severity"],
                            description="Potential secret exposure in logs",
                            line_number=line_num,
                            filepath=file_path,
                            snippet=self._get_line_snippet(file_lines, line_num),
                            recommendation="Remove secret values from echo commands and logs",
                            confidence="MEDIUM"
                        ))
        
        return findings
    
    def _find_env_sections(self, data: Any, path: str = "") -> List[Any]:
        """Recursively find all env sections in the YAML structure"""
        sections = []
        
        if isinstance(data, dict):
            if "env" in data:
                sections.append(data["env"])
            
            for key, value in data.items():
                sections.extend(self._find_env_sections(value, f"{path}.{key}"))
        
        elif isinstance(data, list):
            for item in data:
                sections.extend(self._find_env_sections(item, path))
        
        return sections
    
    def _is_credential_key(self, key: str) -> bool:
        """Check if a key name suggests it might contain credentials"""
        credential_keywords = ["password", "secret", "token", "key", 
                              "pwd", "auth", "api", "credential", 
                              "access", "private", "cert", "passphrase"]
        key_lower = key.lower()
        return any(keyword in key_lower for keyword in credential_keywords)
    
    def _find_key_line(self, file_lines: List[str], key: str) -> int:
        """Find the line number where a key is defined"""
        for i, line in enumerate(file_lines, 1):
            if key in line and (":" in line or "=" in line):
                return i
        return 0
    
    def _find_step_line(self, file_lines: List[str], step: Dict[str, Any]) -> int:
        """Find the approximate line number for a step"""
        step_name = step.get("name", "")
        step_run = step.get("run", "")
        
        # Search for step by name
        if step_name:
            for i, line in enumerate(file_lines, 1):
                if step_name in line:
                    return i
        
        # Search for step by run command
        if step_run:
            for i, line in enumerate(file_lines, 1):
                if step_run.strip() in line:
                    return i
        
        return 0
    
    def _get_line_snippet(self, file_lines: List[str], line_num: int, context: int = 2) -> str:
        """Get a snippet of code around a specific line"""
        start = max(0, line_num - context - 1)
        end = min(len(file_lines), line_num + context)
        snippet_lines = file_lines[start:end]
        return "".join(snippet_lines)