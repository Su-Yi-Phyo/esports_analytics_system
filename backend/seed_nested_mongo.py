from app.mongo_database import db
from datetime import datetime, timedelta
import random

collection = db["match_logs"]
collection.delete_many({})

players = [101, 102, 103, 104]
teams = [1, 2]

data = []

for i in range(10):
    match = {
        "match_id": i + 1,
        "season": "2025-S1",
        "date": datetime.now() - timedelta(days=i),
        "teams": []
    }

    for t in teams:
        team = {
            "team_id": t,
            "result": random.choice(["win", "lose"]),
            "players": []
        }

        for p in players:
            team["players"].append({
                "player_id": p,
                "kills": random.randint(0, 20),
                "deaths": random.randint(0, 10),
                "assists": random.randint(0, 15),
                "gpm": random.randint(300, 600)
            })

        match["teams"].append(team)

    data.append(match)

collection.insert_many(data)

print("Inserted 10 matches (nested)")