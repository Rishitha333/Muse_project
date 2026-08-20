"""
Authentication Utilities - JWT Token Management
"""

import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET is not set. Copy .env.example to .env and set a long random value."
    )
JWT_EXPIRATION = int(os.getenv("JWT_EXPIRATION", 24))  # hours


def generate_token(user_id, email, role="user"):
    """
    Generate JWT token for authenticated user
    
    Args:
        user_id (str): User ID
        email (str): User email
        role (str): User role
        
    Returns:
        str: JWT token
    """
    try:
        payload = {
            "user_id": str(user_id),
            "email": email,
            "role": role,
            "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION),
            "iat": datetime.utcnow()
        }
        
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
        return token
        
    except Exception as e:
        print(f"❌ Error generating token: {e}")
        return None


def decode_token(token):
    """
    Decode and verify JWT token
    
    Args:
        token (str): JWT token
        
    Returns:
        dict: Decoded payload or None if invalid
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
        
    except jwt.ExpiredSignatureError:
        print("❌ Token expired")
        return None
    except jwt.InvalidTokenError:
        print("❌ Invalid token")
        return None
    except Exception as e:
        print(f"❌ Error decoding token: {e}")
        return None


def token_required(f):
    """
    Decorator to protect routes requiring authentication
    
    Usage:
        @app.route('/protected')
        @token_required
        def protected_route(current_user):
            return jsonify({"message": "Access granted"})
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({"error": "Invalid token format"}), 401
        
        if not token:
            return jsonify({"error": "Authentication token required"}), 401
        
        # Decode token
        payload = decode_token(token)
        
        if not payload:
            return jsonify({"error": "Invalid or expired token"}), 401
        
        # Pass user info to the route
        return f(current_user=payload, *args, **kwargs)
    
    return decorated


def admin_required(f):
    """
    Decorator to protect routes requiring admin role
    
    Usage:
        @app.route('/admin/users')
        @admin_required
        def admin_route(current_user):
            return jsonify({"message": "Admin access granted"})
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({"error": "Invalid token format"}), 401
        
        if not token:
            return jsonify({"error": "Authentication token required"}), 401
        
        # Decode token
        payload = decode_token(token)
        
        if not payload:
            return jsonify({"error": "Invalid or expired token"}), 401
        
        # Check if user is admin
        if payload.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403
        
        # Pass user info to the route
        return f(current_user=payload, *args, **kwargs)
    
    return decorated


def optional_auth(f):
    """
    Decorator for routes where authentication is optional
    If token is present and valid, user info is passed; otherwise None
    
    Usage:
        @app.route('/public')
        @optional_auth
        def public_route(current_user=None):
            if current_user:
                return jsonify({"message": f"Hello {current_user['email']}"})
            return jsonify({"message": "Hello guest"})
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        current_user = None
        
        # Get token from Authorization header
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            try:
                token = auth_header.split(" ")[1]
                payload = decode_token(token)
                if payload:
                    current_user = payload
            except:
                pass
        
        return f(current_user=current_user, *args, **kwargs)
    
    return decorated
