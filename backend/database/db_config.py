"""
MongoDB Database Configuration and Connection
"""

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB Configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "muse_database")

# Global database connection
_client = None
_db = None


def get_db():
    """
    Get MongoDB database connection (singleton pattern)
    Returns the same connection for all requests
    """
    global _client, _db
    
    if _db is not None:
        return _db
    
    try:
        # Create MongoDB client for local database
        _client = MongoClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=5000,  # 5 seconds for local
            connectTimeoutMS=5000,
        )
        
        # Test connection
        _client.admin.command('ping')
        
        # Get database
        _db = _client[DB_NAME]
        
        print(f"✅ MongoDB connected successfully: {DB_NAME}")
        print(f"   Connection: Local Database")
        return _db
        
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("⚠️ Please ensure:")
        print("   1. MongoDB is installed")
        print("   2. MongoDB service is running (net start MongoDB)")
        print("   3. Default port 27017 is available")
        raise Exception("Database connection failed")
    except Exception as e:
        print(f"❌ Unexpected database error: {e}")
        raise


def close_db():
    """Close MongoDB connection"""
    global _client, _db
    
    if _client is not None:
        _client.close()
        _client = None
        _db = None
        print("📴 MongoDB connection closed")


def init_collections():
    """
    Initialize collections and indexes
    Called once when the app starts
    """
    try:
        db = get_db()
        
        # ============================================
        # USERS COLLECTION
        # ============================================
        users = db.users
        
        # Create unique index on email
        users.create_index("email", unique=True)
        
        # Create index on username for faster lookups
        users.create_index("username")
        
        print("✅ Users collection initialized")
        
        # ============================================
        # ANALYSIS HISTORY COLLECTION
        # ============================================
        history = db.analysis_history
        
        # Create index on user_id for faster user history queries
        history.create_index("user_id")
        
        # Create index on timestamp for sorting
        history.create_index("timestamp")
        
        # Compound index for user + timestamp queries
        history.create_index([("user_id", 1), ("timestamp", -1)])
        
        print("✅ Analysis history collection initialized")
        
        # ============================================
        # ADMIN LOGS COLLECTION (Optional)
        # ============================================
        admin_logs = db.admin_logs
        
        # Create index on timestamp
        admin_logs.create_index("timestamp")
        
        print("✅ Admin logs collection initialized")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to initialize collections: {e}")
        return False


# Collection shortcuts for easy access
def get_users_collection():
    """Get users collection"""
    return get_db().users


def get_history_collection():
    """Get analysis history collection"""
    return get_db().analysis_history


def get_admin_logs_collection():
    """Get admin logs collection"""
    return get_db().admin_logs
