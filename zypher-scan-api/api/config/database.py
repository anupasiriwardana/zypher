from dotenv import load_dotenv
import os
from pymongo import MongoClient

# Load environment variables from .env file
load_dotenv()
# Get the MongoDB connection string from environment variables
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)

db = client.zypher_db
collection_name = db["zypher_collection"]

vulnerability_rule_file_collection = db["vulnerability_rule_files"]
custom_rule_file_collection = db["customrulefiles"]
custom_rule_metadata = db["customrulemetadatas"]
bestPractice_rule_file_collection = db["BestPractice_rule_files"]
bp_rule_metadata = db["bestPractices_rule_metadata"]
published_custom_rule_file_collection = db["publishedCustomRules"]
users_collection = db["users"]
educator_queue_collection = db["educator_queue"]
knowledge_base_request_collection = db["knowledgebaserequests"]
custom_rule_request_collection = db["customrulerequests"]