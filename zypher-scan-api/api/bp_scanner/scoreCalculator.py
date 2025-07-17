from typing import List, Dict
from models.bestPractices import Finding
from config.database import bp_rule_metadata
from collections import defaultdict

class PipelineScoreCalculator:
    def __init__(self):
        metadata = bp_rule_metadata.find({})

    # Count rules by severity
        severity_counts = {
            "CRITICAL": 0,
            "HIGH": 0,
            "MEDIUM": 0,
            "LOW": 0,
            "INFO": 0
        }
        for data in metadata:
            severity = data.get("severity", "").upper()
            if severity:
                severity_counts[severity] += 1

        self.total_rules = {
            "CRITICAL": severity_counts['CRITICAL'],
            "HIGH": severity_counts['HIGH'],
            "MEDIUM": severity_counts['MEDIUM'],
            "LOW": severity_counts['LOW'],
            "INFO": severity_counts['INFO']
        }

        # Weights for computing final score
        self.severity_weights = {
            "CRITICAL": round(10 / 24, 4),
            "HIGH":     round(7 / 24, 4), 
            "MEDIUM":   round(4 / 24, 4), 
            "LOW":      round(2 / 24, 4), 
            "INFO":     round(1 / 24, 4)  
        }

        self.supported_severities = list(self.total_rules.keys())

    def calculate_per_severity_scores(self, severity_counts, results) -> Dict[str, float]:
        failed_counts = {sev: 0 for sev in self.supported_severities}
        # seen_rule_ids = set()

        # # Filter out passed findings and deduplicate by rule_id
        # # for sev in severity_counts:
        # #     # rule_id = getattr(finding, "rule_id", None)
        # #     # if rule_id is None or rule_id in seen_rule_ids:
        # #     #     continue

        # #     # seen_rule_ids.add(rule_id)
        # #     if sev in failed_counts:
        # #         failed_counts[sev] += 1
        for sev, count in severity_counts.items():
            sev = sev.upper()
            if sev in failed_counts:
                failed_counts[sev] += count
        for sev in self.total_rules:
            self.total_rules[sev] = self.total_rules.get(sev, 0) * results


        severity_scores = {}
        for sev in self.supported_severities:
            total = self.total_rules[sev]
            if total == 0:
                severity_scores[sev] = 100.0
                continue
            failed = failed_counts[sev]
            passed = total - failed
            if passed != 0:
                score = (passed / total) * 100 if total > 0 else 100
            else:
                score = 0.0
            severity_scores[sev] = round(score, 2)

        return severity_scores


    def compute_weighted_pipeline_score(self, severity_scores: Dict[str, float]) -> float:
        final_score = 0.0
        for sev, weight in self.severity_weights.items():
            final_score += severity_scores.get(sev, 100) * weight
            
        # Ensure final score is within 0-100 range
        if final_score > 100:
            final_score = 100
        elif final_score < 0:
            final_score = 0
        
        return round(final_score, 2)

    def calculate(self, severity_counts: Dict[str, any],results) -> Dict[str, any]:
        severity_scores = self.calculate_per_severity_scores(severity_counts,results)
        final_score = self.compute_weighted_pipeline_score(severity_scores)
        return {
            "per_severity": severity_scores,
            "final_score": final_score
        }
