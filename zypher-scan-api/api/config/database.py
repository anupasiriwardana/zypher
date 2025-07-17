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
bestPractice_rule_file_collection = db["BestPractice_rule_files"]
bp_rule_metadata = db["bestPractices_rule_metadata"]
