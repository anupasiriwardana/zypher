from fastapi import APIRouter, HTTPException
from models.scan_input import FileScanRequest
from customRuleScanner.customeRuleEngine import ScannerEngine
from customRuleScanner.scoreCalculator import PipelineScoreCalculator
import asyncio
from concurrent.futures import ThreadPoolExecutor
from models.customRule import Finding
from typing import List, Optional

router = APIRouter(
    prefix='/custom-rule-scan-single-file',
    tags=['scan for custom rule suggestions in a single file']
)

# Initialize scanner once
scanner = ScannerEngine()
scoreCalculator = PipelineScoreCalculator()

# Thread pool for scanning
executor = ThreadPoolExecutor(max_workers=4)

def sync_scan(content: str, file_path: str, user_id: str) -> List[Finding]:
    """Wrapper for synchronous scanning"""
    return scanner.scan_content(content, file_path, user_id=user_id)

@router.post("/")
async def scan_file(file_request: FileScanRequest):
    try:
        user_id = file_request.user_id
        scanner.user_id = user_id  # Set user_id for rule loading
        # Run scanner in thread pool
        findings = await asyncio.get_event_loop().run_in_executor(
            executor,
            sync_scan,
            file_request.content,  # Raw YAML/JSON string
            file_request.filename,
            user_id
        )
        
        
        score = scoreCalculator.calculate(findings)

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
                "CUST score": score["final_score"],
                "CUST per_severity": score["per_severity"],
                "risk_factor": score["risk_factor"]

            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Scan failed: {str(e)}"
        )