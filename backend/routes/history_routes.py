"""
Analysis History Routes
"""

from flask import Blueprint, request, jsonify
from database.models.analysis_history import AnalysisHistory
from auth.auth_utils import token_required, optional_auth

history_bp = Blueprint('history', __name__)


@history_bp.route("/save", methods=["POST"])
@token_required
def save_analysis(current_user):
    """
    Save analysis result to history
    
    POST /api/history/save
    Headers: Authorization: Bearer <token>
    Body: { ...analysis_data... }
    """
    try:
        data = request.get_json()
        user_id = current_user["user_id"]
        
        # Save analysis
        analysis_id = AnalysisHistory.save_analysis(user_id, data)
        
        if analysis_id:
            return jsonify({
                "message": "Analysis saved successfully",
                "analysis_id": analysis_id
            }), 201
        else:
            return jsonify({"error": "Failed to save analysis"}), 500
        
    except Exception as e:
        print(f"❌ Error saving analysis: {e}")
        return jsonify({"error": "Failed to save analysis"}), 500


@history_bp.route("/list", methods=["GET"])
@token_required
def get_user_history(current_user):
    """
    Get analysis history for current user
    
    GET /api/history/list?page=1&limit=20
    Headers: Authorization: Bearer <token>
    """
    try:
        user_id = current_user["user_id"]
        
        # Pagination
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))
        skip = (page - 1) * limit
        
        # Get history
        history = AnalysisHistory.get_user_history(user_id, skip, limit)
        
        return jsonify({
            "history": history,
            "page": page,
            "limit": limit,
            "count": len(history)
        }), 200
        
    except Exception as e:
        print(f"❌ Error getting history: {e}")
        return jsonify({"error": "Failed to get history"}), 500


@history_bp.route("/<analysis_id>", methods=["GET"])
@token_required
def get_analysis(current_user, analysis_id):
    """
    Get specific analysis by ID
    
    GET /api/history/<analysis_id>
    Headers: Authorization: Bearer <token>
    """
    try:
        analysis = AnalysisHistory.get_analysis_by_id(analysis_id)
        
        if not analysis:
            return jsonify({"error": "Analysis not found"}), 404
        
        # Check if user owns this analysis
        if analysis["user_id"] != current_user["user_id"]:
            return jsonify({"error": "Unauthorized"}), 403
        
        return jsonify({"analysis": analysis}), 200
        
    except Exception as e:
        print(f"❌ Error getting analysis: {e}")
        return jsonify({"error": "Failed to get analysis"}), 500


@history_bp.route("/<analysis_id>", methods=["DELETE"])
@token_required
def delete_analysis(current_user, analysis_id):
    """
    Delete an analysis
    
    DELETE /api/history/<analysis_id>
    Headers: Authorization: Bearer <token>
    """
    try:
        user_id = current_user["user_id"]
        
        success = AnalysisHistory.delete_analysis(analysis_id, user_id)
        
        if success:
            return jsonify({"message": "Analysis deleted successfully"}), 200
        else:
            return jsonify({"error": "Failed to delete analysis"}), 400
        
    except Exception as e:
        print(f"❌ Error deleting analysis: {e}")
        return jsonify({"error": "Failed to delete analysis"}), 500


@history_bp.route("/stats", methods=["GET"])
@token_required
def get_user_stats(current_user):
    """
    Get user statistics
    
    GET /api/history/stats
    Headers: Authorization: Bearer <token>
    """
    try:
        user_id = current_user["user_id"]
        
        stats = AnalysisHistory.get_user_stats(user_id)
        
        return jsonify({"stats": stats}), 200
        
    except Exception as e:
        print(f"❌ Error getting stats: {e}")
        return jsonify({"error": "Failed to get stats"}), 500
