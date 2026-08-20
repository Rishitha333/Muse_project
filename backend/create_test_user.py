"""
Quick user creation script for testing
Creates a test user directly in MongoDB
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from database.db_config import get_users_collection
from database.models.user import User

def create_test_user():
    """Create a test user for immediate login"""
    print("Creating test user...")
    
    # Test user credentials
    email = "test@muse.com"
    username = "Test User"
    password = "test123"
    
    try:
        # Check if user already exists
        users = get_users_collection()
        existing = users.find_one({"email": email})
        
        if existing:
            print(f"✅ User already exists: {email}")
            print(f"   Email: {email}")
            print(f"   Password: {password}")
            return
        
        # Create new user
        user_id = User.create_user(email, username, password)
        
        if user_id:
            print(f"✅ Test user created successfully!")
            print(f"   Email: {email}")
            print(f"   Password: {password}")
            print(f"   User ID: {user_id}")
            print("\n🚀 You can now login with these credentials!")
        else:
            print("❌ Failed to create user")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    create_test_user()
