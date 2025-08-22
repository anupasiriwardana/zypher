import importlib
import inspect
import types
from bson import ObjectId
from config.database import custom_rule_file_collection, custom_rule_metadata
from models.bestPractices import Finding
from .baseRule_class import BaseRule

def load_rules(user_id: str) -> list:
    """
    Load custom vulnerability rules for a specific user from MongoDB 
    and instantiate them dynamically.
    """
    rules = []

    try:
        # Step 1: Fetch rule IDs from metadata for this user
        metadata_docs = custom_rule_metadata.find({"user_id": "6873b783b8f41c7da5fe5fda"})
        rule_ids = [doc["rule_id"] for doc in metadata_docs]

        if not rule_ids:
            print(f"No custom rules found for user {user_id}")
            return rules

        # Step 2: Fetch rules from rule files collection
        active_rules = custom_rule_file_collection.find({
                    "rule_id": {"$in": rule_ids}
})

        for rule_doc in active_rules:
            try:
                # Create a new module in memory
                module_name = f"rule_{rule_doc['rule_name']}"
                module = types.ModuleType(module_name)

                # Provide BaseRule and Finding in the module's globals for exec
                module.__dict__['BaseRule'] = BaseRule
                module.__dict__['Finding'] = Finding

                # Execute the rule code in the module's context
                exec(rule_doc["file_content"], module.__dict__)

                # Find rule classes in the module
                for name, obj in inspect.getmembers(module, inspect.isclass):
                    if issubclass(obj, BaseRule) and obj is not BaseRule:
                        # Instantiate the rule class
                        rules.append(obj())
                        print(f"Loaded rule: {name} for user {user_id}")

            except Exception as e:
                print(f"Error loading rule {rule_doc.get('rule_name', 'unknown')}: {str(e)}")

    except Exception as e:
        print(f"Error fetching rules for user {user_id}: {str(e)}")

    return rules
