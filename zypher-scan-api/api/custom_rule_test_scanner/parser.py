import yaml
from typing import Dict, List, Tuple

class PipelineParser:
    def _fix_on_key(self, data):
        if isinstance(data, dict):
            new_data = {}
            for k, v in data.items():
                if k is True:
                    new_data['on'] = self._fix_on_key(v)
                else:
                    new_data[k] = self._fix_on_key(v)
            return new_data
        elif isinstance(data, list):
            return [self._fix_on_key(item) for item in data]
        else:
            return data
    def parse_content(self, content: str) -> Tuple[Dict, List[str]]:
        """Parse YAML content with line number awareness"""
        
        try:
            lines = content.splitlines(keepends=True)
            data = yaml.safe_load(content) or {}
            data = self._fix_on_key(data)  # Fix 'on' key if needed
            print(f"Parsed YAML keys: {list(data.keys())}")  # Debug log
            return data, lines
        except yaml.YAMLError as e:
            # Handle parsing errors with line numbers
            line_no = e.problem_mark.line + 1 if hasattr(e, 'problem_mark') else 0
            raise ValueError(f"YAML error at line {line_no}: {str(e)}")
    
    def detect_pipeline_type(self, data: Dict) -> str:
        """Identify CI/CD system type (GitHub, GitLab, etc.)"""
        if 'jobs' in data and ('on' in data or 'name' in data):
            print("Detected GitHub Actions pipeline")
            return 'github'
        elif 'stages' in data:
            return 'gitlab'
        elif 'pool' in data:
            return 'azure'
        elif 'pipeline' in data:
            return 'jenkins'
        return 'unknown'