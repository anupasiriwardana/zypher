import importlib
import inspect
import types
from bson import ObjectId
from config.database import published_custom_rule_file_collection
from models.customRule import Finding
from .baseRule_class import BaseRule

def load_rules(user_id: str) -> list:
    rules = []

    try:
        # Convert user_id string to ObjectId
        obj_user_id = ObjectId(user_id)

        # Fetch rules for this user with status 'active'
        user_rules_cursor = published_custom_rule_file_collection.find({
            "user_id": obj_user_id,
            "status": "active"
        })

        user_rules = list(user_rules_cursor)

        if not user_rules:
            print(f"No custom rules found for user {user_id}")
            return rules

        for rule_doc in user_rules:
            try:
                module_name = f"rule_{rule_doc['rule_name']}"
                module = types.ModuleType(module_name)
                module.__dict__['BaseRule'] = BaseRule
                module.__dict__['Finding'] = Finding

                exec(rule_doc["file_content"], module.__dict__)

                for name, obj in inspect.getmembers(module, inspect.isclass):
                    if issubclass(obj, BaseRule) and obj is not BaseRule:
                        rules.append(obj())
                        print(f"Loaded rule: {name} for user {user_id}")

            except Exception as e:
                print(f"Error loading rule {rule_doc.get('rule_name', 'unknown')}: {str(e)}")

    except Exception as e:
        print(f"Error fetching rules for user {user_id}: {str(e)}")

    return rules
