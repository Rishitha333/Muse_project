from database.db_config import init_collections, get_db
from bson import ObjectId

init_collections()
db = get_db()

# Get all history records without user_email
records = list(db.history.find({"user_email": {"$exists": False}}))
print(f"Found {len(records)} records without user_email")

for record in records:
    user_id = record.get("user_id")
    if user_id:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if user:
            db.history.update_one(
                {"_id": record["_id"]},
                {"$set": {"user_email": user.get("email", "Unknown")}}
            )
            print(f"Updated record {record['_id']} with email {user.get('email')}")

print("Done!")