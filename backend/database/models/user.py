"""
User Model - MongoDB Schema and Operations
"""

from datetime import datetime
from bson import ObjectId
import bcrypt
from database.db_config import get_users_collection


class User:
    """User model for authentication and profile management"""
    
    @staticmethod
    def create_user(username, email, password, role="user"):
        """
        Create a new user
        
        Args:
            username (str): Username
            email (str): Email address
            password (str): Plain text password (will be hashed)
            role (str): User role ('user', 'admin')
            
        Returns:
            dict: Created user data or None if failed
        """
        try:
            users = get_users_collection()
            
            # Check if email already exists
            if users.find_one({"email": email}):
                return {"error": "Email already registered"}
            
            # Check if username already exists
            if users.find_one({"username": username}):
                return {"error": "Username already taken"}
            
            # Hash password
            hashed_password = bcrypt.hashpw(
                password.encode('utf-8'),
                bcrypt.gensalt()
            ).decode("utf-8")
            
            # Create user document
            user_doc = {
                "username": username,
                "email": email,
                "password": hashed_password,
                "role": role,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "is_active": True,
                "profile": {
                    "full_name": "",
                    "phone": "",
                    "avatar": ""
                },
                "settings": {
                    "notifications": True,
                    "theme": "light"
                }
            }
            
            # Insert user
            result = users.insert_one(user_doc)
            user_doc["_id"] = result.inserted_id
            
            # Remove password from response
            user_doc.pop("password")
            
            print(f"✅ User created: {email}")
            return user_doc
            
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            return {"error": str(e)}
    
    
    @staticmethod
    def authenticate_user(email, password):
        """
        Authenticate user with email and password
        
        Args:
            email (str): User email
            password (str): Plain text password
            
        Returns:
            dict: User data if authenticated, None otherwise
        """
        try:
            users = get_users_collection()
            
            # Find user by email
            user = users.find_one({"email": email})
            
            if not user:
                return None
            
            # Check if account is active
            if not user.get("is_active", True):
                return None
            
            # Verify password
            stored_password = user["password"]
            # Handle both string and bytes storage
            if isinstance(stored_password, str):
                stored_password = stored_password.encode('utf-8')
            
            if bcrypt.checkpw(password.encode('utf-8'), stored_password):
                # Remove password from response
                user.pop("password")
                return user
            
            return None
            
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return None
    
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID"""
        try:
            users = get_users_collection()
            user = users.find_one({"_id": ObjectId(user_id)})
            
            if user:
                user.pop("password", None)
            
            return user
            
        except Exception as e:
            print(f"❌ Error getting user: {e}")
            return None
    
    
    @staticmethod
    def get_user_by_email(email):
        """Get user by email"""
        try:
            users = get_users_collection()
            user = users.find_one({"email": email})
            
            if user:
                user.pop("password", None)
            
            return user
            
        except Exception as e:
            print(f"❌ Error getting user: {e}")
            return None
    
    
    @staticmethod
    def update_user(user_id, update_data):
        """
        Update user profile
        
        Args:
            user_id (str): User ID
            update_data (dict): Fields to update
            
        Returns:
            bool: True if updated successfully
        """
        try:
            users = get_users_collection()
            
            # Add updated_at timestamp
            update_data["updated_at"] = datetime.utcnow()
            
            # Don't allow direct password update (use change_password instead)
            update_data.pop("password", None)
            
            result = users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            print(f"❌ Error updating user: {e}")
            return False
    
    
    @staticmethod
    def change_password(user_id, old_password, new_password):
        """
        Change user password
        
        Args:
            user_id (str): User ID
            old_password (str): Current password
            new_password (str): New password
            
        Returns:
            bool: True if changed successfully
        """
        try:
            users = get_users_collection()
            
            # Get user
            user = users.find_one({"_id": ObjectId(user_id)})
            
            if not user:
                return False
            
            # Verify old password
            if not bcrypt.checkpw(old_password.encode('utf-8'), user["password"]):
                return False
            
            # Hash new password
            hashed_password = bcrypt.hashpw(
                new_password.encode('utf-8'),
                bcrypt.gensalt()
            )
            
            # Update password
            result = users.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$set": {
                        "password": hashed_password,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            print(f"❌ Error changing password: {e}")
            return False
    
    
    @staticmethod
    def delete_user(user_id):
        """Delete user (soft delete - set is_active to False)"""
        try:
            users = get_users_collection()
            
            result = users.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$set": {
                        "is_active": False,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            print(f"❌ Error deleting user: {e}")
            return False
    
    
    @staticmethod
    def get_all_users(skip=0, limit=50):
        """Get all users (for admin)"""
        try:
            users = get_users_collection()
            
            cursor = users.find(
                {},
                {"password": 0}  # Exclude password field
            ).skip(skip).limit(limit).sort("created_at", -1)
            
            return list(cursor)
            
        except Exception as e:
            print(f"❌ Error getting users: {e}")
            return []
