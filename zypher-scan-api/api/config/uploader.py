from database import bestPractice_rule_file_collection

document = {
    "rule_name": "credential_hygiene",
    "status": "active",
    "file_content": "hello",  # Replace with full code if needed
    "rule_id": "CICD-BSTP-001"
}

# Insert the document and get the inserted ID
result = bestPractice_rule_file_collection.insert_one(document)
print("Document inserted with _id:", result.inserted_id)