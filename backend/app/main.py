from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import fetch_one
from app.routes import leaderboard, matches, players, rosters, seasons, teams
from app.routes import mongo_match_logs
from app.routes import mongo_analytics
from app.routes import mongo_advanced


app = FastAPI(title="MLBB Coach Decision System API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(players.router)
app.include_router(teams.router)
app.include_router(seasons.router)
app.include_router(rosters.router)
app.include_router(matches.router)
app.include_router(leaderboard.router)
app.include_router(mongo_match_logs.router)
app.include_router(mongo_analytics.router)
app.include_router(mongo_advanced.router)


@app.get("/api/health")
def health_check():
    db = fetch_one("SELECT DB_NAME() AS databaseName")
    return {"status": "ok", "database": db["databaseName"] if db else None}
