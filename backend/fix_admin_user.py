"""
Debug and fix admin user
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database.db_config import get_users_collection
from database.models.user import User
import bcrypt

def check_and_fix_admin():
    print("Checking admin user...")
    
    users = get_users_collection()
    admin = users.find_one({"email": "admin@muse.com"})
    
    if not admin:
        print("❌ Admin user not found. Creating...")
        result = User.create_user("Admin", "admin@muse.com", "admin123", role="admin")
        print(f"✅ Admin created: {result}")
        return
    
    print(f"✅ Admin user found: {admin['email']}")
    print(f"   Username: {admin['username']}")
    print(f"   Role: {admin['role']}")
    print(f"   Active: {admin.get('is_active', True)}")
    
    # Test password
    test_password = "admin123"
    stored_password = admin['password']
    
    print(f"\nTesting password...")
    try:
        if isinstance(stored_password, str):
            stored_password = stored_password.encode('utf-8')
        
        if bcrypt.checkpw(test_password.encode('utf-8'), stored_password):
            print("✅ Password is correct!")
        else:
            print("❌ Password check failed. Recreating admin...")
            # Delete and recreate
            users.delete_one({"email": "admin@muse.com"})
            result = User.create_user("Admin", "admin@muse.com", "admin123", role="admin")
            print(f"✅ Admin recreated: {result}")
    except Exception as e:
        print(f"❌ Error checking password: {e}")
        print("Recreating admin...")
        users.delete_one({"email": "admin@muse.com"})
        result = User.create_user("Admin", "admin@muse.com", "admin123", role="admin")
        print(f"✅ Admin recreated")

if __name__ == "__main__":
    check_and_fix_admin()
