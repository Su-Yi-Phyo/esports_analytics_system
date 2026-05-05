from app.mongo_database import db
from datetime import datetime, timedelta
import random

collection = db["match_logs"]

collection.delete_many({})

players = [101, 102, 103, 104, 105]
teams = [1, 2]

data = []

for i in range(50):
    data.append({
        "match_id": i + 1,
        "player_id": random.choice(players),
        "team_id": random.choice(teams),
        "kills": random.randint(0, 20),
        "deaths": random.randint(0, 10),
        "assists": random.randint(0, 15),
        "result": random.choice(["win", "lose"]),
        "date": datetime.now() - timedelta(days=i)
    })

collection.insert_many(data)

print("Inserted 50 matches!")