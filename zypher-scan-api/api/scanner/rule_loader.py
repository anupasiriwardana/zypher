import importlib
import inspect
import pkgutil
import os
from .rules.base_rule import BaseRule

def load_rules() -> list:
    """Dynamically load all vulnerability rules from the rules directory"""
    rules = []
    package_dir = os.path.dirname(__file__) + '/rules'
    package_name = 'scanner.rules'

    for _, module_name, _ in pkgutil.iter_modules([package_dir]):
        if module_name.startswith('rule_'):
            module = importlib.import_module(f'{package_name}.{module_name}')
            for name, obj in inspect.getmembers(module, inspect.isclass):
                if issubclass(obj, BaseRule) and obj is not BaseRule:
                    rules.append(obj())
    return rules