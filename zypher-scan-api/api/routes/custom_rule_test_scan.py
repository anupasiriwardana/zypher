from fastapi import APIRouter, HTTPException
from models.scan_input import FileScanRequest, CustomRuleTestRequest
from custom_rule_test_scanner.customRule_engine import ScannerEngine
from custom_rule_test_scanner.scoreCalculator import PipelineScoreCalculator
from custom_rule_test_scanner.customRule_loader import load_custom_rules_from_test_request
import asyncio
from concurrent.futures import ThreadPoolExecutor
from models.customRule import Finding
from typing import List, Optional

router = APIRouter(
    prefix='/custom-rule-test-scan',
    tags=['test custom rule']
)

# Initialize scanner once
scanner = ScannerEngine()
scoreCalculator = PipelineScoreCalculator()

# Thread pool for scanning
executor = ThreadPoolExecutor(max_workers=4)

def sync_scan(content: str, file_path: str, custom_rules: Optional[List[object]] = None) -> List[Finding]:
    """Wrapper for synchronous scanning used by run_in_executor"""
    return scanner.scan_content(content, file_path, custom_rules)

@router.post("/")
async def scan_file(file_request: FileScanRequest , custom_rule : CustomRuleTestRequest):
    """
    Expects:
      - file_request: { filename, content }  (pipeline YAML as string)
      - custom_rule: { rule_id, rule_name, content }   (rule Python source as string in content)
    """
    try:
        # First, compile/load the custom rule source code into rule instances
        try:
            # support passing rule_name to help module naming (optional)
            rule_src = {"file_content": custom_rule.content, "rule_name": custom_rule.rule_name}
            custom_rules = load_custom_rules_from_test_request([rule_src])
        except Exception as e:
            # If the custom rule fails to load — return 400 with the loader error
            raise HTTPException(status_code=400, detail=f"Failed to load custom rule: {str(e)}")

        # Run scanner in thread pool
        findings = await asyncio.get_event_loop().run_in_executor(
            executor,
            sync_scan,
            file_request.content,  # Raw YAML/JSON string
            file_request.filename,
            custom_rules # passed as third positional arg to sync_scan
        )

        # Calculate severity counts based on filtered findings
        severity_counts = {
            "CRITICAL": 0,
            "HIGH": 0,
            "MEDIUM": 0,
            "LOW": 0
        }

        for finding in findings:
            severity = finding.severity
            if severity in severity_counts:
                severity_counts[severity] += 1
        
        score = scoreCalculator.calculate(findings)

        return {
            "status": "success",
            "filename": file_request.filename,
            "findings": [f.dict() for f in findings],
            "stats": {
                "total_findings": len(findings),
                "critical": severity_counts["CRITICAL"],
                "high": severity_counts["HIGH"],
                "medium": severity_counts["MEDIUM"],
                "low": severity_counts["LOW"],
                "score": score["final_score"],
                "per_severity": score["per_severity"],
                "risk_factor": score["risk_factor"]

            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Scan failed: {str(e)}"
        )