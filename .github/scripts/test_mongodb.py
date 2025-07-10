import os
import sys
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

def main():
    try:
        # Use MONGODB_URI instead of MONGO_URI
        uri = os.getenv("MONGODB_URI")
        if not uri:
            print("❌ MONGODB_URI environment variable not set")
            return 1
            
        # Mask credentials in logs
        display_uri = uri
        if "@" in uri:
            user_pass, host = uri.split("@", 1)
            display_uri = f"mongodb://****:****@{host}"
            
        print(f"Connecting to MongoDB at {display_uri}...")
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        client.server_info()  # Test connection
        
        # Get database name from URI
        db_name = uri.split("/")[-1].split("?")[0]
        db = client[db_name]
        
        # Verify expected collections
        required_collections = {"users", "scanhistory", "rules", "knowledgebase"}
        existing_collections = set(db.list_collection_names())
        missing = required_collections - existing_collections
        
        if missing:
            print(f"⚠️ Missing collections: {', '.join(missing)}")
        else:
            print("✅ All required collections exist")
            
        print("✅ MongoDB connection successful")
        return 0
        
    except ConnectionFailure as e:
        print(f"❌ Connection failed: {str(e)}")
        return 1
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())