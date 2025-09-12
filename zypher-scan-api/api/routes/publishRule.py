from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from bson import ObjectId
from config.database import (
    vulnerability_rule_file_collection,
    bestPractice_rule_file_collection,
    published_custom_rule_file_collection,
    custom_rule_metadata,
    custom_rule_file_collection,
    users_collection,
    educator_queue_collection,
    knowledge_base_request_collection
)

router = APIRouter(
    prefix="/publish-custom-rule",
    tags=["publish custom rules"]
)

# --- Request schema ---
class PublishRequest(BaseModel):
    rule_id: str
    collection: Optional[str] = "custom_rule"

# --- Map frontend value → Mongo collection ---
COLLECTION_MAP = {
    "vulnerability": vulnerability_rule_file_collection,
    "bestPractise": bestPractice_rule_file_collection,
    "custom_rule": published_custom_rule_file_collection
}

# --- Helper to convert ObjectId to str recursively ---
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
    if request.collection not in COLLECTION_MAP:
        raise HTTPException(status_code=400, detail=f"Invalid collection: {request.collection}")

    target_collection = COLLECTION_MAP[request.collection]

    try:
        # --- Check uniqueness ---
        existing = target_collection.find_one({"rule_id": request.rule_id})
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Rule with rule_id '{request.rule_id}' already exists in {request.collection}"
            )

        # --- Fetch source rule ---
        source_rule = custom_rule_file_collection.find_one({"rule_id": request.rule_id})
        if not source_rule:
            raise HTTPException(
                status_code=404,
                detail=f"Rule with rule_id '{request.rule_id}' not found in custom_rule_file_collection"
            )

        source_rule.pop("_id", None)

        # --- Prepare rule document ---
        rule_doc = {
            "rule_id": request.rule_id,
            "rule_name": source_rule.get("rule_name"),
            "status": "active",
            "file_content": source_rule.get("file_content"),
            "created_at": datetime.utcnow()
        }

        # Attach user_id for custom_rule
        if request.collection == "custom_rule":
            meta = custom_rule_metadata.find_one({"rule_id": request.rule_id})
            if not meta or "rule_owner_id" not in meta:
                raise HTTPException(
                    status_code=404,
                    detail=f"No rule_owner_id found in custom_rule_metadata for rule_id '{request.rule_id}'"
                )
            meta.pop("_id", None)
            rule_doc["user_id"] = meta["rule_owner_id"]

        # --- Insert rule ---
        result = target_collection.insert_one(rule_doc)

        # --- Educator allocation ---
        educators = list(users_collection.find({"role": "Educator"}, {"_id": 1}))
        
        # Initialize queue if empty
        if educator_queue_collection.count_documents({}) == 0:
            for edu in educators:
                educator_queue_collection.insert_one({
                    "educator_id": edu["_id"],
                    "last_assigned": datetime(1970, 1, 1)
                })

        # Get queue sorted by last_assigned
        queue = list(educator_queue_collection.find().sort("last_assigned", 1))
        allocated_ids = [str(item["educator_id"]) for item in queue]
        free_educators = [e for e in educators if str(e["_id"]) not in allocated_ids]

        # Choose next educator
        if free_educators:
            next_educator = free_educators[0]
        else:
            next_educator = educators[0]

        # Update allocation queue
        educator_queue_collection.update_one(
            {"educator_id": next_educator["_id"]},
            {"$set": {"last_assigned": datetime.utcnow()}},
            upsert=True
        )

        # --- Create knowledge base request ---
        kb_request = {
            "rule_id": request.rule_id,
            "rule_name": source_rule.get("rule_name"),
            "rule_description": source_rule.get("rule_description"),
            "suggested_severity": source_rule.get("suggested_severity"),
            "sample_code": source_rule.get("sample_code"),
            "knowledge_base_status": "Pending",
            "user_id": rule_doc.get("user_id"),
            "assigned_educator": next_educator["_id"],
            "requestedAt": datetime.utcnow(),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }

        kb_result = knowledge_base_request_collection.insert_one(kb_request)

        # --- Prepare response ---
        response = {
            "status": "success",
            "inserted_id": str(result.inserted_id),
            "collection": request.collection,
            "rule_id": request.rule_id,
            "rule_name": rule_doc["rule_name"],
            "status_set": rule_doc["status"],
            "user_id": rule_doc.get("user_id"),
            "knowledge_base_request_id": str(kb_result.inserted_id),
            "assigned_educator": str(next_educator["_id"])
        }

        return convert_objectid(response)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to publish rule: {str(e)}")
