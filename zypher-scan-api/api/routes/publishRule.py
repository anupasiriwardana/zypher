from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from config.database import (
    vulnerability_rule_file_collection,
    bestPractice_rule_file_collection,
    published_custom_rule_file_collection,
    custom_rule_metadata,             
    custom_rule_file_collection       
)
from datetime import datetime
from bson import ObjectId

router = APIRouter(
    prefix="/publish-custom-rule",
    tags=["publish custom rules"]
)

# Request body schema
class PublishRequest(BaseModel):
    rule_id: str
    collection: Optional[str] = "custom_rule"   # default

# Map frontend value → Mongo collection
COLLECTION_MAP = {
    "vulnerability": vulnerability_rule_file_collection,
    "bestPractise": bestPractice_rule_file_collection,
    "custom_rule": published_custom_rule_file_collection
}

# Helper to recursively convert ObjectId to str
def convert_objectid(data):
    if isinstance(data, ObjectId):
        return str(data)
    if isinstance(data, list):
        return [convert_objectid(i) for i in data]
    if isinstance(data, dict):
        return {k: convert_objectid(v) for k, v in data.items()}
    return data

@router.post("/")
async def publish_custom_rule(request: PublishRequest):
    """
    Publishes a rule into the selected collection.
    Request body should only contain:
      {
        "rule_id": "<RULE_ID>",
        "collection": "vulnerability | bestPractise | custom_rule"
      }
    """
    if request.collection not in COLLECTION_MAP:
        raise HTTPException(status_code=400, detail=f"Invalid collection: {request.collection}")

    target_collection = COLLECTION_MAP[request.collection]

    try:
        # Ensure rule_id is unique inside the target collection
        existing = target_collection.find_one({"rule_id": request.rule_id})
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Rule with rule_id '{request.rule_id}' already exists in {request.collection}"
            )

        # Fetch the rule details from custom_rule_file_collection
        source_rule = custom_rule_file_collection.find_one({"rule_id": request.rule_id})
        if not source_rule:
            raise HTTPException(
                status_code=404,
                detail=f"Rule with rule_id '{request.rule_id}' not found in custom_rule_file_collection"
            )

        # Remove _id to avoid ObjectId issues
        source_rule.pop("_id", None)

        # Prepare rule_doc with always "active" status
        rule_doc = {
            "rule_id": request.rule_id,
            "rule_name": source_rule.get("rule_name"),
            "status": "active",  # always active
            "file_content": source_rule.get("file_content"),
            "created_at": datetime.utcnow()
        }

        # If it's a custom_rule → attach user_id from metadata
        if request.collection == "custom_rule":
            meta = custom_rule_metadata.find_one({"rule_id": request.rule_id})
            if not meta or "rule_owner_id" not in meta:
                raise HTTPException(
                    status_code=404,
                    detail=f"No rule_owner_id found in custom_rule_metadata for rule_id '{request.rule_id}'"
                )
            # Remove _id from meta
            meta.pop("_id", None)
            rule_doc["user_id"] = meta["rule_owner_id"]

        # Insert into the target collection
        result = target_collection.insert_one(rule_doc)

        response = {
            "status": "success",
            "inserted_id": str(result.inserted_id),
            "collection": request.collection,
            "rule_id": request.rule_id,
            "rule_name": rule_doc["rule_name"],
            "status_set": rule_doc["status"],
            "user_id": rule_doc.get("user_id")  # only returned for custom_rule
        }

        # Convert any ObjectIds (just in case) before returning
        return convert_objectid(response)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to publish rule: {str(e)}")
