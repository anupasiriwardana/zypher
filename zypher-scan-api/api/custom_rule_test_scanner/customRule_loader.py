# customRule_loader.py
import inspect
import types
from typing import List, Dict, Any, Optional

# Use the same Finding model used by your engine
from models.customRule import Finding
from .baseRule_class import BaseRule


def load_custom_rules_from_test_request(rule_sources: List[Dict[str, Any]]) -> List[BaseRule]:
    """
    rule_sources: list of dicts, each dict should have keys:
      - file_content: str  (python source of rule)
      - rule_name: Optional[str] (used for module naming)
    Returns instantiated rule objects (subclasses of BaseRule)
    """
    rules = []
    for src in rule_sources:
        file_content = src.get("file_content") or ""
        rule_name = src.get("rule_name") or "temp_rule"
        try:
            module_name = f"temp_rule_{rule_name}"
            module = types.ModuleType(module_name)

            # Provide BaseRule and Finding types inside the module globals
            module.__dict__['BaseRule'] = BaseRule
            module.__dict__['Finding'] = Finding

            # If your rules need other safe helpers, inject them here (carefully)
            # e.g. module.__dict__['re'] = re

            exec(file_content, module.__dict__)  # execute rule source

            # Inspect module for classes that subclass BaseRule
            for name, obj in inspect.getmembers(module, inspect.isclass):
                try:
                    if issubclass(obj, BaseRule) and obj is not BaseRule:
                        rules.append(obj())  # instantiate
                except TypeError:
                    # issubclass may fail for non-class objects
                    continue
        except Exception as e:
            # bubble up loader error to caller rather than silently ignore
            raise RuntimeError(f"Failed to load rule '{rule_name}': {e}")
    return rules
