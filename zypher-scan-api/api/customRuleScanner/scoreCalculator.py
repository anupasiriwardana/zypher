from typing import List, Dict
from models.customRule import Finding
from collections import defaultdict

class PipelineScoreCalculator:
    def __init__(self):
        # Weight of each severity in final score
        self.severity_weights = {
            "CRITICAL": 100,
            "HIGH": 50,
            "MEDIUM": 25,
            "LOW": 15,
            "INFO": 5
        }

        self.supported_severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW","INFO"]

    def calculate_per_severity_scores(self, failed_findings: List[Finding]) -> Dict[str, float]:
        failed_counts = {sev: 0 for sev in self.supported_severities}

        for finding in failed_findings:
            sev = finding.severity.upper()
            if sev in failed_counts:
                failed_counts[sev] += 1

        
        severity_scores = {}
        for sev in failed_counts:
            failed = failed_counts[sev]
            score = failed * self.severity_weights.get(sev, 100) 
            severity_scores[sev] = round(score, 2)

        return severity_scores

    def compute_weighted_pipeline_score(self, severity_scores: Dict[str, float]) -> float:
        final_score = 0.0
        for sev in severity_scores:
            final_score += severity_scores.get(sev, 100) 
        return final_score
    
    def compute_risk_factor(self, severity_scores: Dict[str, float]) -> str:
        risk = ''
        if(severity_scores["CRITICAL"] > 0):
            risk = "CRITICAL"
        elif(severity_scores["HIGH"] > 0):
            risk = "HIGH"
        elif(severity_scores["MEDIUM"] > 0):
            risk = "MEDIUM"
        elif(severity_scores["LOW"] > 0):
            risk = "LOW"
        elif(severity_scores["INFO"] > 0):
            risk = "INFO"
        else:
            risk = "NONE"
        return risk

    def calculate(self, failed_findings: List[Finding]) -> Dict[str, any]:
        severity_scores = self.calculate_per_severity_scores(failed_findings)
        final_score = self.compute_weighted_pipeline_score(severity_scores)
        risk_factor = self.compute_risk_factor(severity_scores)
        return {
            "per_severity": severity_scores,
            "final_score": final_score,
            "risk_factor": risk_factor
        }
