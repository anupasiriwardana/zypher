import os
import sys
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

def test_mongodb_connection(uri):
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        client.server_info()  # Test connection
        
        # Verify expected databases/collections exist
        db = client.get_database()
        if "ScanHistory" not in db.list_collection_names():
            print("⚠️ ScanHistory collection missing")
        
        print("✅ MongoDB connection successful")
        return True
    except ConnectionFailure as e:
        print(f"❌ MongoDB connection failed: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    uri = os.getenv("MONGO_URI")
    if not uri:
        print("❌ MONGO_URI environment variable not set")
        sys.exit(1)
    
    success = test_mongodb_connection(uri)
    sys.exit(0 if success else 1)