"""
Create admin test user for testing
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from database.db_config import get_users_collection
from database.models.user import User

def create_admin_user():
    """Create an admin user for testing"""
    print("Creating admin user...")
    
    # Admin user credentials
    email = "admin@muse.com"
    username = "Admin"
    password = "admin123"
    role = "admin"
    
    try:
        # Check if user already exists
        users = get_users_collection()
        existing = users.find_one({"email": email})
        
        if existing:
            print(f"✅ Admin user already exists: {email}")
            print(f"   Email: {email}")
            print(f"   Password: {password}")
            print(f"   Role: {role}")
            return
        
        # Create new admin user
        result = User.create_user(username, email, password, role=role)
        
        if result and not isinstance(result, dict) or (isinstance(result, dict) and "error" not in result):
            print(f"✅ Admin user created successfully!")
            print(f"   Email: {email}")
            print(f"   Password: {password}")
            print(f"   Role: {role}")
            print("\n🚀 You can now login as admin with these credentials!")
        else:
            error_msg = result.get("error", "Unknown error") if isinstance(result, dict) else "Failed"
            print(f"❌ Failed to create admin user: {error_msg}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

def create_regular_user():
    """Create a regular test user"""
    print("\nCreating regular test user...")
    
    email = "test@muse.com"
    username = "Rishi"
    password = "test123"
    
    try:
        users = get_users_collection()
        existing = users.find_one({"email": email})
        
        if existing:
            print(f"✅ Test user already exists: {email}")
            print(f"   Email: {email}")
            print(f"   Password: {password}")
            return
        
        result = User.create_user(username, email, password)
        
        if result and not isinstance(result, dict) or (isinstance(result, dict) and "error" not in result):
            print(f"✅ Test user created successfully!")
            print(f"   Email: {email}")
            print(f"   Password: {password}")
        else:
            error_msg = result.get("error", "Unknown error") if isinstance(result, dict) else "Failed"
            print(f"❌ Failed to create test user: {error_msg}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("=" * 50)
    print("CREATING TEST USERS")
    print("=" * 50)
    
    create_regular_user()
    create_admin_user()
    
    print("\n" + "=" * 50)
    print("AVAILABLE LOGIN CREDENTIALS:")
    print("=" * 50)
    print("\n👤 Regular User:")
    print("   Email:    test@muse.com")
    print("   Password: test123")
    print("   Role:     user")
    
    print("\n👨‍💼 Admin User:")
    print("   Email:    admin@muse.com")
    print("   Password: admin123")
    print("   Role:     admin")
    print("\n" + "=" * 50)
