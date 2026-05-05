from fastapi import APIRouter, Query
from app.database import fetch_all

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


@router.get("")
def get_leaderboard():
    return fetch_all("""
        SELECT
            rank,
            player_id AS id,
            player_id,
            nickname,
            role,
            nationality,
            team,
            kda,
            gpm,
            win_rate AS winRate,
            win_rate,
            matches_played AS matchesPlayed,
            matches_played,
            score
        FROM PlayerLeaderboard
        ORDER BY rank ASC, score DESC, nickname ASC;
    """)


@router.get("/role")
def get_role_leaderboard(role: str = Query(...)):
    return fetch_all("""
        SELECT
            role_rank,
            global_rank,
            player_id AS id,
            player_id,
            nickname,
            role,
            nationality,
            team,
            kda,
            gpm,
            win_rate AS winRate,
            win_rate,
            matches_played AS matchesPlayed,
            matches_played,
            score
        FROM RoleBasedPlayerLeaderboard
        WHERE role = ?
        ORDER BY role_rank ASC, score DESC, nickname ASC;
    """, (role,))