from fastapi import APIRouter, HTTPException
from app.mongo_database import match_logs_collection

router = APIRouter(prefix="/api/mongo", tags=["mongo"])


@router.get("/player/{player_id}/timeline")
def get_player_timeline(player_id: int):
    pipeline = [
        {"$unwind": "$teams"},
        {"$unwind": "$teams.players"},
        {"$match": {"teams.players.player_id": player_id}},
        {
            "$project": {
                "_id": 0,
                "match_id": 1,
                "season_id": 1,
                "season": 1,
                "match_date": 1,
                "team_id": "$teams.team_id",
                "team_name": "$teams.team_name",
                "result": "$teams.result",
                "player_id": "$teams.players.player_id",
                "nickname": "$teams.players.nickname",
                "role": "$teams.players.role",
                "kills": "$teams.players.kills",
                "deaths": "$teams.players.deaths",
                "assists": "$teams.players.assists",
                "gpm": "$teams.players.gpm",
                "damage_dealt": "$teams.players.damage_dealt",
                "damage_taken": "$teams.players.damage_taken",
                "objective_participation": "$teams.players.objective_participation",
                "kda": {
                    "$round": [
                        {
                            "$divide": [
                                {"$add": ["$teams.players.kills", "$teams.players.assists"]},
                                {
                                    "$cond": [
                                        {"$eq": ["$teams.players.deaths", 0]},
                                        1,
                                        "$teams.players.deaths"
                                    ]
                                }
                            ]
                        },
                        2
                    ]
                }
            }
        },
        {"$sort": {"match_date": -1, "match_id": -1}},
        {"$limit": 50}
    ]

    return list(match_logs_collection.aggregate(pipeline))


@router.get("/player/{player_id}/summary")
def get_player_summary(player_id: int):
    pipeline = [
        {"$unwind": "$teams"},
        {"$unwind": "$teams.players"},
        {"$match": {"teams.players.player_id": player_id}},
        {"$sort": {"match_date": -1, "match_id": -1}},
        {"$limit": 50},
        {
            "$group": {
                "_id": "$teams.players.player_id",
                "nickname": {"$first": "$teams.players.nickname"},
                "matches_played": {"$sum": 1},
                "average_kda": {
                    "$avg": {
                        "$divide": [
                            {"$add": ["$teams.players.kills", "$teams.players.assists"]},
                            {
                                "$cond": [
                                    {"$eq": ["$teams.players.deaths", 0]},
                                    1,
                                    "$teams.players.deaths"
                                ]
                            }
                        ]
                    }
                },
                "average_gpm": {"$avg": "$teams.players.gpm"},
                "wins": {
                    "$sum": {
                        "$cond": [{"$eq": ["$teams.result", "WIN"]}, 1, 0]
                    }
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                "player_id": "$_id",
                "nickname": 1,
                "matches_played": 1,
                "average_kda": {"$round": ["$average_kda", 2]},
                "average_gpm": {"$round": ["$average_gpm", 0]},
                "win_rate": {
                    "$round": [
                        {"$multiply": [{"$divide": ["$wins", "$matches_played"]}, 100]},
                        1
                    ]
                }
            }
        }
    ]

    result = list(match_logs_collection.aggregate(pipeline))

    if not result:
        raise HTTPException(status_code=404, detail="No MongoDB match history found for this player")

    return result[0]


@router.get("/matches")
def get_mongo_matches():
    docs = list(match_logs_collection.find({}, {"_id": 0}).sort("match_id", 1))
    return docs