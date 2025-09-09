# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from typing import List
# from ..models.CustomRuleFile import CustomRuleFile

# router = APIRouter()

# # In-memory store for demo
# custom_rule_files = []

# @router.post("/custom-rule-file", response_model=CustomRuleFile)
# def create_custom_rule_file(rule: CustomRuleFile):
#     custom_rule_files.append(rule)
#     return rule

# @router.get("/custom-rule-file", response_model=List[CustomRuleFile])
# def get_custom_rule_files():
#     return custom_rule_files

# @router.get("/custom-rule-file/{rule_id}", response_model=CustomRuleFile)
# def get_custom_rule_file(rule_id: str):
#     for rule in custom_rule_files:
#         if rule.rule_id == rule_id:
#             return rule
#     raise HTTPException(status_code=404, detail="Rule not found")

# @router.put("/custom-rule-file/{rule_id}", response_model=CustomRuleFile)
# def update_custom_rule_file(rule_id: str, updated_rule: CustomRuleFile):
#     for i, rule in enumerate(custom_rule_files):
#         if rule.rule_id == rule_id:
#             custom_rule_files[i] = updated_rule
#             return updated_rule
#     raise HTTPException(status_code=404, detail="Rule not found")

# @router.delete("/custom-rule-file/{rule_id}")
# def delete_custom_rule_file(rule_id: str):
#     for i, rule in enumerate(custom_rule_files):
#         if rule.rule_id == rule_id:
#             del custom_rule_files[i]
#             return {"detail": "Deleted"}
#     raise HTTPException(status_code=404, detail="Rule not found")
