"""
Authentication Routes
"""

from flask import Blueprint, request, jsonify
from database.models.user import User
from auth.auth_utils import generate_token, token_required
import re

auth_bp = Blueprint('auth', __name__)


def is_valid_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        username = data.get("username", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not username or not email or not password:
            return jsonify({"error": "All fields are required"}), 400

        if not is_valid_email(email):
            return jsonify({"error": "Invalid email format"}), 400

        if not re.match(r'^[a-zA-Z0-9_]{3,30}$', username):
            return jsonify({
                "error": "Username must be 3-30 characters (letters, numbers, underscore only)"
            }), 400

        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400

        result = User.create_user(username, email, password)

        if isinstance(result, dict) and "error" in result:
            return jsonify(result), 400

        token = generate_token(
            result["_id"],
            result["email"],
            result["role"]
        )

        return jsonify({
            "message": "User registered successfully",
            "token": token,
            "user": {
                "id": str(result["_id"]),
                "username": result["username"],
                "email": result["email"],
                "role": result["role"]
            }
        }), 201

    except Exception as e:
        print(f"❌ Registration error: {e}")
        return jsonify({"error": "Registration failed"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400

        user = User.authenticate_user(email, password)

        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        token = generate_token(
            user["_id"],
            user["email"],
            user["role"]
        )

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "username": user["username"],
                "email": user["email"],
                "role": user["role"],
                "profile": user.get("profile", {})
            }
        }), 200

    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({"error": "Login failed"}), 500


@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user(current_user):
    try:
        user = User.get_user_by_id(current_user["user_id"])

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "user": {
                "id": str(user["_id"]),
                "username": user["username"],
                "email": user["email"],
                "role": user["role"],
                "profile": user.get("profile", {}),
                "settings": user.get("settings", {}),
                "created_at": user.get("created_at").isoformat() if user.get("created_at") else None
            }
        }), 200

    except Exception as e:
        print(f"❌ Error getting user: {e}")
        return jsonify({"error": "Failed to get user"}), 500


@auth_bp.route("/update-profile", methods=["PUT"])
@token_required
def update_profile(current_user):
    try:
        data = request.get_json()
        user_id = current_user["user_id"]

        update_data = {}

        if "profile" in data:
            update_data["profile"] = data["profile"]

        if "settings" in data:
            update_data["settings"] = data["settings"]

        success = User.update_user(user_id, update_data)

        if success:
            return jsonify({"message": "Profile updated successfully"}), 200
        else:
            return jsonify({"error": "Failed to update profile"}), 400

    except Exception as e:
        print(f"❌ Error updating profile: {e}")
        return jsonify({"error": "Update failed"}), 500


@auth_bp.route("/change-password", methods=["POST"])
@token_required
def change_password(current_user):
    try:
        data = request.get_json()
        user_id = current_user["user_id"]

        old_password = data.get("old_password", "")
        new_password = data.get("new_password", "")

        if not old_password or not new_password:
            return jsonify({"error": "Both old and new passwords required"}), 400

        if len(new_password) < 6:
            return jsonify({"error": "New password must be at least 6 characters"}), 400

        success = User.change_password(user_id, old_password, new_password)

        if success:
            return jsonify({"message": "Password changed successfully"}), 200
        else:
            return jsonify({"error": "Invalid old password"}), 400

    except Exception as e:
        print(f"❌ Error changing password: {e}")
        return jsonify({"error": "Password change failed"}), 500


@auth_bp.route("/users", methods=["GET"])
@token_required
def get_all_users(current_user):
    """Get all users - Admin only"""
    try:
        from database.db_config import get_db
        db = get_db()
        users = list(db.users.find({}, {"password": 0}))
        for user in users:
            user["_id"] = str(user["_id"])
            if user.get("created_at"):
                user["created_at"] = user["created_at"].isoformat()
        return jsonify({"users": users}), 200
    except Exception as e:
        print(f"❌ Error getting users: {e}")
        return jsonify({"error": "Failed to get users"}), 500
    
@auth_bp.route("/delete-account", methods=["DELETE"])
@token_required
def delete_account(current_user):
    """Delete user account"""
    try:
        from database.db_config import get_db
        from bson import ObjectId
        db = get_db()
        db.users.delete_one({"_id": ObjectId(current_user["user_id"])})
        db.history.delete_many({"user_id": ObjectId(current_user["user_id"])})
        return jsonify({"message": "Account deleted successfully"}), 200
    except Exception as e:
        print(f"❌ Error deleting account: {e}")
        return jsonify({"error": "Failed to delete account"}), 500