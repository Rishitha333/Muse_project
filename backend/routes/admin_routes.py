"""
Admin Routes - dashboard stats, user administration, call records, activity log

All routes require a JWT whose role claim is "admin" (see auth.auth_utils.admin_required).
"""

from datetime import datetime

from bson import ObjectId
from flask import Blueprint, request, jsonify

from auth.auth_utils import admin_required
from database.db_config import (
    get_users_collection,
    get_history_collection,
    get_admin_logs_collection,
)

admin_bp = Blueprint("admin", __name__)


# ─────────────────────────────────────────────────────────────
# Activity log helper
# ─────────────────────────────────────────────────────────────

def log_activity(action, message, actor_email=None, target_email=None, icon="•"):
    """
    Record an administrative event.

    Called from admin routes and from auth routes (registration, login) so the
    activity feed reflects things that actually happened.
    """
    try:
        get_admin_logs_collection().insert_one({
            "action": action,            # e.g. "role_changed", "user_registered"
            "message": message,          # human-readable line shown in the UI
            "actor_email": actor_email,  # who performed it
            "target_email": target_email,
            "icon": icon,
            "timestamp": datetime.utcnow(),
        })
    except Exception as e:
        # Logging must never break the operation it is recording
        print(f"Could not write activity log: {e}")


# ─────────────────────────────────────────────────────────────
# Dashboard statistics
# ─────────────────────────────────────────────────────────────

@admin_bp.route("/stats", methods=["GET"])
@admin_required
def admin_stats(current_user):
    """
    GET /api/admin/stats

    System-wide totals for the admin dashboard.
    """
    try:
        users = get_users_collection()
        history = get_history_collection()

        total_users = users.count_documents({})
        active_users = users.count_documents({"is_active": {"$ne": False}})
        total_analyses = history.count_documents({})

        # Averages across every analysis, not per user
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "avg_sarcasm_score": {"$avg": "$results.final_sarcasm_score"},
                    "avg_stt_confidence": {"$avg": "$results.stt_confidence"},
                    "audio_analyses": {"$sum": {"$cond": ["$input.has_audio", 1, 0]}},
                    "text_analyses": {"$sum": {"$cond": ["$input.has_text", 1, 0]}},
                }
            }
        ]
        agg = list(history.aggregate(pipeline))
        totals = agg[0] if agg else {}

        def rounded(key, places=3):
            value = totals.get(key)
            return round(value, places) if value is not None else 0

        # Distribution of source languages, for the dashboard chart
        lang_pipeline = [
            {"$group": {"_id": "$detected_language", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10},
        ]
        languages = [
            {"language": row["_id"] or "Unknown", "count": row["count"]}
            for row in history.aggregate(lang_pipeline)
        ]

        return jsonify({
            "stats": {
                "total_users": total_users,
                "active_users": active_users,
                "total_analyses": total_analyses,
                "avg_analyses_per_user": (
                    round(total_analyses / total_users, 1) if total_users else 0
                ),
                "avg_sarcasm_score": rounded("avg_sarcasm_score"),
                "avg_stt_confidence": rounded("avg_stt_confidence", 2),
                "audio_analyses": totals.get("audio_analyses", 0),
                "text_analyses": totals.get("text_analyses", 0),
                "languages": languages,
            }
        }), 200

    except Exception as e:
        print(f"Error building admin stats: {e}")
        return jsonify({"error": "Failed to get stats"}), 500


# ─────────────────────────────────────────────────────────────
# Users, with their real analysis counts
# ─────────────────────────────────────────────────────────────

@admin_bp.route("/users", methods=["GET"])
@admin_required
def admin_users(current_user):
    """
    GET /api/admin/users

    Every user, joined with how many analyses they have run and when they last
    ran one. This is what fills the Calls and Last Active columns.
    """
    try:
        users = get_users_collection()
        history = get_history_collection()

        # One aggregation for all users, rather than a query per user
        counts = {}
        pipeline = [
            {
                "$group": {
                    "_id": "$user_id",
                    "calls_analyzed": {"$sum": 1},
                    "last_active": {"$max": "$timestamp"},
                }
            }
        ]
        for row in history.aggregate(pipeline):
            if row["_id"] is not None:
                counts[str(row["_id"])] = {
                    "calls_analyzed": row["calls_analyzed"],
                    "last_active": (
                        row["last_active"].isoformat() if row["last_active"] else None
                    ),
                }

        result = []
        for user in users.find({}, {"password": 0}):
            uid = str(user["_id"])
            stats = counts.get(uid, {"calls_analyzed": 0, "last_active": None})

            result.append({
                "_id": uid,
                "username": user.get("username", ""),
                "email": user.get("email", ""),
                "role": user.get("role", "user"),
                "is_active": user.get("is_active", True),
                "created_at": (
                    user["created_at"].isoformat() if user.get("created_at") else None
                ),
                "calls_analyzed": stats["calls_analyzed"],
                "last_active": stats["last_active"],
            })

        return jsonify({"users": result, "count": len(result)}), 200

    except Exception as e:
        print(f"Error listing users: {e}")
        return jsonify({"error": "Failed to get users"}), 500


@admin_bp.route("/users/<user_id>/role", methods=["PUT"])
@admin_required
def update_user_role(current_user, user_id):
    """
    PUT /api/admin/users/<user_id>/role
    Body: { "role": "admin" | "user" }
    """
    try:
        data = request.get_json() or {}
        new_role = data.get("role")

        if new_role not in ("admin", "user"):
            return jsonify({"error": "Role must be 'admin' or 'user'"}), 400

        users = get_users_collection()
        target = users.find_one({"_id": ObjectId(user_id)})

        if not target:
            return jsonify({"error": "User not found"}), 404

        # Refuse to remove the last admin, which would lock everyone out
        if target.get("role") == "admin" and new_role == "user":
            if users.count_documents({"role": "admin"}) <= 1:
                return jsonify({
                    "error": "Cannot demote the only remaining admin"
                }), 400

        users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"role": new_role, "updated_at": datetime.utcnow()}},
        )

        log_activity(
            action="role_changed",
            message=f"{target.get('username') or target.get('email')}'s role changed to {new_role}",
            actor_email=current_user.get("email"),
            target_email=target.get("email"),
            icon="⚙",
        )

        return jsonify({"message": "Role updated", "role": new_role}), 200

    except Exception as e:
        print(f"Error updating role: {e}")
        return jsonify({"error": "Failed to update role"}), 500


@admin_bp.route("/users/<user_id>/status", methods=["PUT"])
@admin_required
def update_user_status(current_user, user_id):
    """
    PUT /api/admin/users/<user_id>/status
    Body: { "is_active": true | false }
    """
    try:
        data = request.get_json() or {}
        is_active = data.get("is_active")

        if not isinstance(is_active, bool):
            return jsonify({"error": "is_active must be true or false"}), 400

        users = get_users_collection()
        target = users.find_one({"_id": ObjectId(user_id)})

        if not target:
            return jsonify({"error": "User not found"}), 404

        # Don't let an admin lock themselves out
        if str(target["_id"]) == current_user.get("user_id") and not is_active:
            return jsonify({"error": "You cannot deactivate your own account"}), 400

        users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_active": is_active, "updated_at": datetime.utcnow()}},
        )

        name = target.get("username") or target.get("email")
        log_activity(
            action="status_changed",
            message=f"{name}'s account {'activated' if is_active else 'deactivated'}",
            actor_email=current_user.get("email"),
            target_email=target.get("email"),
            icon="✓" if is_active else "✕",
        )

        return jsonify({"message": "Status updated", "is_active": is_active}), 200

    except Exception as e:
        print(f"Error updating status: {e}")
        return jsonify({"error": "Failed to update status"}), 500


# ─────────────────────────────────────────────────────────────
# Call records — every analysis, across all users
# ─────────────────────────────────────────────────────────────

@admin_bp.route("/calls", methods=["GET"])
@admin_required
def admin_calls(current_user):
    """
    GET /api/admin/calls?page=1&limit=20

    All analyses, newest first, with the owning user's current email joined in
    rather than the snapshot stored at analysis time.
    """
    try:
        page = int(request.args.get("page", 1))
        limit = min(int(request.args.get("limit", 20)), 100)
        skip = (page - 1) * limit

        history = get_history_collection()
        users = get_users_collection()

        total = history.count_documents({})
        cursor = history.find().sort("timestamp", -1).skip(skip).limit(limit)
        records = list(cursor)

        # Look up the users referenced by this page in one query
        user_ids = {r["user_id"] for r in records if r.get("user_id")}
        lookup = {
            str(u["_id"]): u
            for u in users.find({"_id": {"$in": list(user_ids)}}, {"password": 0})
        }

        result = []
        for r in records:
            uid = str(r["user_id"]) if r.get("user_id") else None
            owner = lookup.get(uid, {})
            results_block = r.get("results") or {}

            result.append({
                "_id": str(r["_id"]),
                "call_id": r.get("call_id", ""),
                "user_id": uid,
                "user_email": owner.get("email") or r.get("user_email", "Unknown"),
                "username": owner.get("username", ""),
                "timestamp": r["timestamp"].isoformat() if r.get("timestamp") else None,
                "detected_language": r.get("detected_language", "Unknown"),
                "target_language": r.get("target_language", "Unknown"),
                "transcript": (r.get("transcript") or "")[:200],
                "sentiment": (r.get("text") or {}).get("sentiment"),
                "final_sarcasm_score": results_block.get("final_sarcasm_score"),
                "stt_confidence": results_block.get("stt_confidence"),
                "has_audio": (r.get("input") or {}).get("has_audio", False),
            })

        return jsonify({
            "calls": result,
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit if limit else 0,
        }), 200

    except Exception as e:
        print(f"Error listing calls: {e}")
        return jsonify({"error": "Failed to get call records"}), 500


# ─────────────────────────────────────────────────────────────
# Activity log
# ─────────────────────────────────────────────────────────────

@admin_bp.route("/activity", methods=["GET"])
@admin_required
def admin_activity(current_user):
    """
    GET /api/admin/activity?limit=20

    Real administrative events, newest first. Empty until something happens —
    which is correct, and better than inventing entries.
    """
    try:
        limit = min(int(request.args.get("limit", 20)), 100)
        logs = get_admin_logs_collection()

        entries = []
        for row in logs.find().sort("timestamp", -1).limit(limit):
            entries.append({
                "_id": str(row["_id"]),
                "action": row.get("action", ""),
                "message": row.get("message", ""),
                "actor_email": row.get("actor_email"),
                "icon": row.get("icon", "•"),
                "timestamp": (
                    row["timestamp"].isoformat() if row.get("timestamp") else None
                ),
            })

        return jsonify({"activity": entries, "count": len(entries)}), 200

    except Exception as e:
        print(f"Error reading activity log: {e}")
        return jsonify({"error": "Failed to get activity log"}), 500