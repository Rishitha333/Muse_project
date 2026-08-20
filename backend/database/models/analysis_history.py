"""
Analysis History Model - Store analysis results
"""

from datetime import datetime
from bson import ObjectId
from database.db_config import get_history_collection


class AnalysisHistory:
    """Model for storing analysis results"""
    
    @staticmethod
    def save_analysis(user_id, analysis_data):
        """
        Save analysis result to database
        
        Args:
            user_id (str): User ID who performed the analysis
            analysis_data (dict): Analysis results from /analyze endpoint
            
        Returns:
            str: Inserted document ID
        """
        try:
            history = get_history_collection()
            
            # Create history document
            doc = {
                "user_id": ObjectId(user_id),
                "timestamp": datetime.utcnow(),
                
                # Input data
                "input": {
                    "has_audio": analysis_data.get("audio_processed", False),
                    "has_text": analysis_data.get("text_processed", False),
                    "source_lang": analysis_data.get("source_lang", "Unknown"),
                    "target_lang": analysis_data.get("target_lang", "Unknown")
                },
                
                # Detected language from Whisper
                "detected_language": analysis_data.get("detected_language", "Unknown"),
                "target_language": analysis_data.get("target_lang", "Unknown"),
                
                # Transcript and translation
                "transcript": analysis_data.get("transcript", ""),
                "translated_transcript": analysis_data.get("translated_transcript", ""),
                
                # Audio analysis
                "audio": {
                    "tone": analysis_data.get("tone"),
                    "audio_tone_score": analysis_data.get("audio_tone_score")
                } if analysis_data.get("audio_processed") else None,
                
                # Text analysis
                "text": {
                    "sarcasm_score": analysis_data.get("text_sarcasm_score"),
                    "sentiment": analysis_data.get("sentiment"),
                    "sentiment_confidence": analysis_data.get("sentiment_confidence")
                } if analysis_data.get("text_processed") else None,
                
                # Final results
                "results": {
                    "final_sarcasm_score": analysis_data.get("final_sarcasm_score"),
                    "stt_confidence": analysis_data.get("stt_confidence"),
                    "translation_confidence": analysis_data.get("translation_confidence")
                },
                # Clean Call ID
                "call_id": analysis_data.get("call_id", ""),
                # Metadata
                "metadata": {
                    "audio_filename": analysis_data.get("audio_filename"),
                    "duration": analysis_data.get("duration"),
                    "processing_time": analysis_data.get("processing_time")
                }
            }
            
            # Add user email to doc
            doc["user_email"] = analysis_data.get("user_email", "Unknown")
            
            # Insert document
            result = history.insert_one(doc)
            
            print(f"✅ Analysis saved to history: {result.inserted_id}")
            return str(result.inserted_id)
            
        except Exception as e:
            print(f"❌ Error saving analysis: {e}")
            return None
    
    
    @staticmethod
    def get_user_history(user_id, skip=0, limit=20):
        """
        Get analysis history for a user
        
        Args:
            user_id (str): User ID
            skip (int): Number of records to skip (pagination)
            limit (int): Number of records to return
            
        Returns:
            list: List of analysis records
        """
        try:
            history = get_history_collection()
            
            cursor = history.find(
                {"user_id": ObjectId(user_id)}
            ).sort("timestamp", -1).skip(skip).limit(limit)
            
            results = list(cursor)
            
            # Convert ObjectId to string for JSON serialization
            for result in results:
                result["_id"] = str(result["_id"])
                result["user_id"] = str(result["user_id"])
            
            return results
            
        except Exception as e:
            print(f"❌ Error getting history: {e}")
            return []
    
    
    @staticmethod
    def get_analysis_by_id(analysis_id):
        """Get a specific analysis by ID"""
        try:
            history = get_history_collection()
            
            result = history.find_one({"_id": ObjectId(analysis_id)})
            
            if result:
                result["_id"] = str(result["_id"])
                result["user_id"] = str(result["user_id"])
            
            return result
            
        except Exception as e:
            print(f"❌ Error getting analysis: {e}")
            return None
    
    
    @staticmethod
    def delete_analysis(analysis_id, user_id):
        """
        Delete an analysis (user can only delete their own)
        
        Args:
            analysis_id (str): Analysis ID
            user_id (str): User ID (for authorization)
            
        Returns:
            bool: True if deleted
        """
        try:
            history = get_history_collection()
            
            result = history.delete_one({
                "_id": ObjectId(analysis_id),
                "user_id": ObjectId(user_id)
            })
            
            return result.deleted_count > 0
            
        except Exception as e:
            print(f"❌ Error deleting analysis: {e}")
            return False
    
    
    @staticmethod
    def get_user_stats(user_id):
        """
        Get statistics for a user
        
        Returns:
            dict: Statistics including STT and translation accuracy
        """
        try:
            history = get_history_collection()
            
            pipeline = [
                {"$match": {"user_id": ObjectId(user_id)}},
                {
                    "$group": {
                        "_id": None,
                        "total_analyses": {"$sum": 1},
                        "avg_sarcasm_score": {
                            "$avg": "$results.final_sarcasm_score"
                        },
                        "avg_stt_confidence": {
                            "$avg": "$results.stt_confidence"
                        },
                        "avg_translation_confidence": {
                            "$avg": "$results.translation_confidence"
                        },
                        "audio_analyses": {
                            "$sum": {"$cond": ["$input.has_audio", 1, 0]}
                        },
                        "text_analyses": {
                            "$sum": {"$cond": ["$input.has_text", 1, 0]}
                        }
                    }
                }
            ]
            
            result = list(history.aggregate(pipeline))
            
            if result:
                stats = result[0]
                stats.pop("_id")
                
                # Convert to percentage and round
                if stats.get("avg_sarcasm_score"):
                    stats["avg_sarcasm_score"] = round(stats["avg_sarcasm_score"], 3)
                if stats.get("avg_stt_confidence"):
                    stats["avg_stt_confidence"] = round(stats["avg_stt_confidence"], 2)
                if stats.get("avg_translation_confidence"):
                    stats["avg_translation_confidence"] = round(stats["avg_translation_confidence"], 2)
                
                return stats
            
            return {
                "total_analyses": 0,
                "avg_sarcasm_score": 0,
                "audio_analyses": 0,
                "text_analyses": 0
            }
            
        except Exception as e:
            print(f"❌ Error getting stats: {e}")
            return {}
    
    
    @staticmethod
    def get_all_analyses(skip=0, limit=50):
        """Get all analyses (for admin)"""
        try:
            history = get_history_collection()
            
            cursor = history.find().sort("timestamp", -1).skip(skip).limit(limit)
            
            results = list(cursor)
            
            # Convert ObjectId to string
            for result in results:
                result["_id"] = str(result["_id"])
                result["user_id"] = str(result["user_id"])
            
            return results
            
        except Exception as e:
            print(f"❌ Error getting all analyses: {e}")
            return []
