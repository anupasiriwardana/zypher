from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from bson import ObjectId
from config.database import (
    vulnerability_rule_file_collection,
    bestPractice_rule_file_collection,
    published_custom_rule_file_collection,
    publishedCustomeRuleMetadata_collection,
    bp_rule_metadata,
    vulnerability_rule_metadata,
    past_version_rule_collection,
    custom_rule_metadata,
    custom_rule_file_collection,
    custom_rule_request_collection,
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
    collection: Optional[str] = "custom"


# --- Map frontend value → Mongo collection ---
COLLECTION_MAP = {
    "vulnerability": vulnerability_rule_file_collection,
    "bestpractice": bestPractice_rule_file_collection,
    "custom": published_custom_rule_file_collection
}

# --- Map metadata target collections ---
METADATA_COLLECTION_MAP = {
    "vulnerability": vulnerability_rule_metadata,
    "bestpractice": bp_rule_metadata,
    "custom": publishedCustomeRuleMetadata_collection
}


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
    target_metadata_collection = METADATA_COLLECTION_MAP[request.collection]

    try:
        # --- STEP 1: Update status in custom_rule_file_collection ---
        update_result = custom_rule_file_collection.update_one(
            {"rule_id": request.rule_id},
            {"$set": {"status": "Active", "updated_at": datetime.utcnow()}}
        )

        if update_result.modified_count == 0:
            raise HTTPException(status_code=404, detail=f"No custom rule found with rule_id '{request.rule_id}'")

        # --- STEP 2: Archive any old versions ---
        existing_collections = [
            ("vulnerability", vulnerability_rule_file_collection),
            ("bestpractice", bestPractice_rule_file_collection),
            ("custom", published_custom_rule_file_collection)
        ]

        for col_name, col in existing_collections:
            existing_rule = col.find_one({"rule_id": request.rule_id})
            if existing_rule:
                past_version_rule_collection.update_one(
                    {"rule_id": request.rule_id},
                    {"$push": {"versions": {**existing_rule, "archived_at": datetime.utcnow()}}},
                    upsert=True
                )
                col.delete_one({"rule_id": request.rule_id})
                break

        # --- STEP 3: Fetch updated source rule ---
        source_rule = custom_rule_file_collection.find_one({"rule_id": request.rule_id})
        if not source_rule:
            raise HTTPException(status_code=404, detail=f"Rule not found after update: {request.rule_id}")

        source_rule.pop("_id", None)
        object_id = request.rule_id.split("-")[-1]

        # --- STEP 4: Generate new prefixed rule_id ---
        rule_request_id = ObjectId(request.rule_id.split("-")[-1])
        custom_request_for_upgrade = custom_rule_request_collection.find_one({"_id":  rule_request_id})
        if not custom_request_for_upgrade:
            raise HTTPException(status_code=404, detail=f"No custom rule request found for {request.rule_id}")

        if(custom_request_for_upgrade.get("rule_id")):
            correct_rule_id = custom_request_for_upgrade.get("rule_id")
        else:
            if request.collection == "vulnerability":
                correct_rule_id = "CICD-VULN-" + object_id
            elif request.collection == "bestpractice":
                correct_rule_id = "CICD-BSTP-" + object_id
            else:
                correct_rule_id = "CICD-CUST-" + object_id

        # --- STEP 5: Create new rule file document ---
        rule_doc = {
            "rule_id": correct_rule_id,
            "rule_name": source_rule.get("rule_name"),
            "status": "active",
            "file_content": source_rule.get("file_content"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        # Attach user_id for custom_rule
        meta = custom_rule_metadata.find_one({"rule_id": request.rule_id})
        if not meta:
            raise HTTPException(status_code=404, detail=f"No metadata found for {request.rule_id}")

        rule_doc["user_id"] = meta.get("rule_owner_id")

        # --- STEP 6: Insert rule file into target collection ---
        target_collection.insert_one(rule_doc)

        # --- STEP 7: Upload metadata to correct metadata collection ---
        meta.pop("_id", None)
        meta["rule_id"] = correct_rule_id
        meta["updated_at"] = datetime.utcnow()
        meta["created_at"] = datetime.utcnow()

        # ✅ Remove Mongo versioning field if exists
        if "__v" in meta:
            meta.pop("__v")

        target_metadata_collection.insert_one(meta)

        # --- STEP 8: Educator allocation ---
        educators = list(users_collection.find({"role": "educator"}, {"_id": 1}))
        if educator_queue_collection.count_documents({}) == 0:
            for edu in educators:
                educator_queue_collection.insert_one({
                    "educator_id": edu["_id"],
                    "last_assigned": datetime(1970, 1, 1)
                })

        queue = list(educator_queue_collection.find().sort("last_assigned", 1))
        allocated_ids = [str(item["educator_id"]) for item in queue]
        free_educators = [e for e in educators if str(e["_id"]) not in allocated_ids]
        next_educator = free_educators[0] if free_educators else educators[0]

        educator_queue_collection.update_one(
            {"educator_id": next_educator["_id"]},
            {"$set": {"last_assigned": datetime.utcnow()}},
            upsert=True
        )

        # --- STEP 9: Create / Replace Knowledge Base Entry ---
        rule_request_id = ObjectId(request.rule_id.split("-")[-1])
        custom_request = custom_rule_request_collection.find_one({"_id":  rule_request_id})
        if not custom_request:
            raise HTTPException(status_code=404, detail=f"No custom rule request found for {request.rule_id}")

        kb_request = {
            "rule_id": correct_rule_id,
            "rule_name": source_rule.get("rule_name"),
            "rule_description": custom_request.get("description"),
            "suggested_severity": custom_request.get("suggested_severity"),
            "sample_code": custom_request.get("sample_code"),
            "knowledge_base_status": "Pending",
            "user_id": rule_doc.get("user_id"),
            "assigned_developer": custom_request.get("assigned_developer"),
            "assigned_educator": next_educator["_id"],
            "requestedAt": datetime.utcnow(),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }

        # Replace if exists
        knowledge_base_request_collection.delete_one({"rule_id": correct_rule_id})
        kb_result = knowledge_base_request_collection.insert_one(kb_request)

        # --- STEP 10: Update request status ---
        custom_rule_request_collection.update_one(
            {"_id": rule_request_id},
            {"$set": {"status": "Successfully Published", "updatedAt": datetime.utcnow()}}
        )

        # --- STEP 11: Final Response ---
        response = {
            "status": "success",
            "rule_id": correct_rule_id,
            "collection": request.collection,
            "metadata_inserted_to": target_metadata_collection.name,
            "knowledge_base_request_id": str(kb_result.inserted_id),
            "assigned_educator": str(next_educator["_id"]),
        }

        return convert_objectid(response)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to publish rule: {str(e)}")
