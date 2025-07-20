import importlib
import inspect
import pkgutil
import os
import types
from config.database import bestPractice_rule_file_collection
from models.bestPractices import Finding
from .baseRule_class import BaseRule

def load_rules() -> list:
    """Load vulnerability rules from MongoDB and instantiate them dynamically."""
    rules = []
    active_rules = bestPractice_rule_file_collection.find({"status": "active"})
    for rule_doc in active_rules:
        try:
            # Create a new module in memory
            module_name = f"rule_{rule_doc['rule_name']}"
            module = types.ModuleType(module_name)

            # Provide BaseRule and Finding in the module's globals for exec
            # Inject required dependencies into the module
            module.__dict__['BaseRule'] = BaseRule
            module.__dict__['Finding'] = Finding
            exec(rule_doc["file_content"], module.__dict__)  # Execute the rule code in the module's context

            # Find rule classes in the module
            for name, obj in inspect.getmembers(module, inspect.isclass):
                if issubclass(obj, BaseRule) and obj is not BaseRule:
                    # Instantiate the rule class
                    rules.append(obj())
                    print(f"Loaded rule: {name}")
        except Exception as e:
            print(f"Error loading rule {rule_doc.get('rule_name', 'unknown')}: {str(e)}")
    return rules