from fastapi import APIRouter
from app.mongo_database import db

router = APIRouter()
collection = db["match_logs"]

# ===============================
# 1. Last 50 matches performance
# ===============================
@router.get("/last50-performance/{player_id}")
def last50_performance(player_id: int):
    pipeline = [
        {"$sort": {"date": -1}},
        {"$limit": 50},

        {"$unwind": "$teams"},
        {"$unwind": "$teams.players"},

        {
            "$match": {
                "teams.players.player_id": player_id
            }
        },

        {
            "$addFields": {
                "kda": {
                    "$divide": [
                        {"$add": [
                            "$teams.players.kills",
                            "$teams.players.assists"
                        ]},
                        {"$max": ["$teams.players.deaths", 1]}
                    ]
                }
            }
        },

        {
            "$group": {
                "_id": "$teams.players.player_id",
                "avg_kda": {"$avg": "$kda"},
                "avg_gpm": {"$avg": "$teams.players.gpm"},
                "total_matches": {"$sum": 1}
            }
        }
    ]

    result = list(collection.aggregate(pipeline))

    if result:
        result[0]["player_id"] = result[0]["_id"]
        del result[0]["_id"]

    return result


# ===============================
# 2. Player timeline
# ===============================
@router.get("/player-timeline/{player_id}")
def player_timeline(player_id: int):
    pipeline = [
        {"$sort": {"date": 1}},

        {"$unwind": "$teams"},
        {"$unwind": "$teams.players"},

        {
            "$match": {
                "teams.players.player_id": player_id
            }
        },

        {
            "$project": {
                "_id": 0,
                "date": 1,
                "kills": "$teams.players.kills",
                "deaths": "$teams.players.deaths",
                "assists": "$teams.players.assists",
                "gpm": "$teams.players.gpm",
                "result": "$teams.result",

                "kda": {
                    "$divide": [
                        {"$add": [
                            "$teams.players.kills",
                            "$teams.players.assists"
                        ]},
                        {"$max": ["$teams.players.deaths", 1]}
                    ]
                }
            }
        }
    ]

    return list(collection.aggregate(pipeline))