"""
Test authentication function directly
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database.models.user import User

print("Testing authentication...")
print("\n1. Testing regular user:")
user_result = User.authenticate_user("test@muse.com", "test123")
if user_result:
    print(f"✅ Regular user authenticated: {user_result['email']}, role: {user_result['role']}")
else:
    print("❌ Regular user authentication failed")

print("\n2. Testing admin user:")
admin_result = User.authenticate_user("admin@muse.com", "admin123")
if admin_result:
    print(f"✅ Admin authenticated: {admin_result['email']}, role: {admin_result['role']}")
else:
    print("❌ Admin authentication failed")
