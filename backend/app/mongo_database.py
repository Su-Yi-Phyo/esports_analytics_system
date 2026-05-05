from pymongo import MongoClient
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongo:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "mlbb_analytics")

client = MongoClient(MONGO_URL)
db = client[MONGO_DB_NAME]

match_logs_collection = db["match_logs"]