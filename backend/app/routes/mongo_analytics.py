from fastapi import APIRouter
from app.mongo_database import db 

router = APIRouter()

collection = db["match_logs"]

@router.get("/last50-performance")
def last50_performance():
    pipeline = [
        {"$sort": {"date": -1}},
        {"$limit": 50},

        {
            "$group": {
                "_id": "$player_id",
                "total_kills": {"$sum": "$kills"},
                "avg_kills": {"$avg": "$kills"},
                "total_deaths": {"$sum": "$deaths"},
                "total_assists": {"$sum": "$assists"},
                "matches": {"$sum": 1},
                "wins": {
                    "$sum": {
                        "$cond": [{"$eq": ["$result", "win"]}, 1, 0]
                    }
                }
            }
        },

        {
            "$addFields": {
                "win_rate": {
                    "$multiply": [
                        {"$divide": ["$wins", "$matches"]},
                        100
                    ]
                }
            }
        },

        {"$sort": {"total_kills": -1}}
    ]

    result = list(collection.aggregate(pipeline))

    # format lại
    for r in result:
        r["player_id"] = r["_id"]
        del r["_id"]

    return result