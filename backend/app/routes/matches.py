from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import fetch_all, fetch_one, execute_query

router = APIRouter(prefix="/api/matches", tags=["matches"])


class MatchStatPayload(BaseModel):
    player_id: int
    team_id: int
    role: str
    kills: int
    deaths: int
    assists: int
    gpm: int
    damage_dealt: int = 0
    damage_taken: int = 0
    objective_participation: int = 0
    result: str


class MatchPayload(BaseModel):
    season_id: int
    match_date: str
    team_a_id: int
    team_b_id: int
    team_a_score: int
    team_b_score: int
    winner_team_id: int | None = None
    match_duration_minutes: int
    stats: list[MatchStatPayload]


@router.get("")
def get_matches():
    return fetch_all("""
        SELECT
            m.match_id AS id,
            m.match_id AS match_id,
            m.season_id AS seasonId,
            m.season_id AS season_id,
            s.season_name AS seasonName,
            s.season_name AS season_name,
            m.match_date AS matchDate,
            m.match_date AS match_date,
            m.team_a_id AS teamAId,
            m.team_a_id AS team_a_id,
            ta.team_name AS teamAName,
            ta.team_name AS team_a_name,
            m.team_b_id AS teamBId,
            m.team_b_id AS team_b_id,
            tb.team_name AS teamBName,
            tb.team_name AS team_b_name,
            m.team_a_score AS teamAScore,
            m.team_a_score AS team_a_score,
            m.team_b_score AS teamBScore,
            m.team_b_score AS team_b_score,
            m.winner_team_id AS winnerTeamId,
            m.winner_team_id AS winner_team_id,
            tw.team_name AS winnerTeamName,
            tw.team_name AS winner_team_name,
            m.match_duration_minutes AS durationMinutes,
            m.match_duration_minutes AS duration_minutes
        FROM Matches m
        JOIN Seasons s ON s.season_id = m.season_id
        JOIN Teams ta ON ta.team_id = m.team_a_id
        JOIN Teams tb ON tb.team_id = m.team_b_id
        LEFT JOIN Teams tw ON tw.team_id = m.winner_team_id
        ORDER BY m.match_date DESC, m.match_id DESC;
    """)


@router.post("")
def create_match(payload: MatchPayload):
    if payload.team_a_id == payload.team_b_id:
        raise HTTPException(status_code=400, detail="Team A and Team B cannot be the same.")

    execute_query("""
        INSERT INTO Matches
            (season_id, match_date, team_a_id, team_b_id, team_a_score, team_b_score, winner_team_id, match_duration_minutes)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        payload.season_id,
        payload.match_date,
        payload.team_a_id,
        payload.team_b_id,
        payload.team_a_score,
        payload.team_b_score,
        payload.winner_team_id,
        payload.match_duration_minutes,
    ))

    match = fetch_one("SELECT MAX(match_id) AS match_id FROM dbo.Matches;")
    match_id = match["match_id"]

    for s in payload.stats:
        execute_query("""
            INSERT INTO MatchStatsFlat
                (match_id, team_id, player_id, role, kills, deaths, assists, gpm,
                 damage_dealt, damage_taken, objective_participation, result)
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            match_id,
            s.team_id,
            s.player_id,
            s.role,
            s.kills,
            s.deaths,
            s.assists,
            s.gpm,
            s.damage_dealt,
            s.damage_taken,
            s.objective_participation,
            s.result,
        ))

    return {"message": "Match created successfully", "match_id": match_id}


@router.get("/{match_id}/stats")
def get_match_stats(match_id: int):
    return fetch_all("""
        SELECT
            ms.stat_id AS id,
            ms.stat_id AS stat_id,
            ms.match_id AS matchId,
            ms.match_id AS match_id,
            ms.team_id AS teamId,
            ms.team_id AS team_id,
            t.team_name AS teamName,
            t.team_name AS team_name,
            ms.player_id AS playerId,
            ms.player_id AS player_id,
            p.nickname AS playerName,
            p.nickname AS player_name,
            ms.role,
            ms.kills,
            ms.deaths,
            ms.assists,
            ms.gpm,
            ms.damage_dealt AS damageDealt,
            ms.damage_dealt AS damage_dealt,
            ms.damage_taken AS damageTaken,
            ms.damage_taken AS damage_taken,
            ms.objective_participation AS objectiveParticipation,
            ms.objective_participation AS objective_participation,
            CAST(
                CAST(ms.kills + ms.assists AS FLOAT) /
                CASE WHEN ms.deaths = 0 THEN 1 ELSE ms.deaths END
            AS DECIMAL(10,2)) AS kda,
            ms.result
        FROM MatchStatsFlat ms
        JOIN Teams t ON t.team_id = ms.team_id
        JOIN Players p ON p.player_id = ms.player_id
        WHERE ms.match_id = ?
        ORDER BY t.team_name, ms.role;
    """, (match_id,))

@router.delete("/{match_id}")
def delete_match(match_id: int):
    existing = fetch_one(
        "SELECT match_id FROM dbo.Matches WHERE match_id = ?;",
        (match_id,)
    )

    if not existing:
        raise HTTPException(status_code=404, detail="Match not found")

    execute_query("DELETE FROM dbo.MatchStatsFlat WHERE match_id = ?;", (match_id,))
    execute_query("DELETE FROM dbo.Matches WHERE match_id = ?;", (match_id,))

    return {"message": "Match deleted successfully"}