from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import fetch_all, fetch_one, execute_query
import pyodbc

router = APIRouter(prefix="/api/rosters", tags=["rosters"])


class RosterPayload(BaseModel):
    season_id: int
    team_id: int
    player_id: int
    role: str
    join_date: str


@router.get("")
def get_rosters():
    return fetch_all("""
        SELECT
            r.roster_id AS id,
            r.roster_id AS roster_id,
            r.season_id AS seasonId,
            r.season_id AS season_id,
            s.season_name AS seasonName,
            s.season_name AS season_name,
            r.team_id AS teamId,
            r.team_id AS team_id,
            t.team_name AS teamName,
            t.team_name AS team_name,
            r.player_id AS playerId,
            r.player_id AS player_id,
            p.nickname AS playerName,
            p.nickname AS player_name,
            p.real_name AS realName,
            p.real_name AS real_name,
            p.nationality,
            r.role,
            r.join_date AS joinDate,
            r.join_date AS join_date
        FROM Rosters r
        JOIN Seasons s ON s.season_id = r.season_id
        JOIN Teams t ON t.team_id = r.team_id
        JOIN Players p ON p.player_id = r.player_id
        ORDER BY s.start_date DESC, t.team_name, r.role;
    """)


@router.post("")
def create_roster(payload: RosterPayload):
    conflict = fetch_one("""
        SELECT
            r.roster_id,
            p.nickname AS playerName,
            t.team_name AS existingTeam
        FROM Rosters r
        JOIN Players p ON p.player_id = r.player_id
        JOIN Teams t ON t.team_id = r.team_id
        WHERE r.season_id = ?
          AND r.player_id = ?;
    """, (payload.season_id, payload.player_id))

    if conflict:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "A player cannot belong to more than one team in the same season.",
                "playerName": conflict["playerName"],
                "existingTeam": conflict["existingTeam"],
            },
        )

    try:
        execute_query("""
            INSERT INTO Rosters
                (season_id, team_id, player_id, role, join_date)
            VALUES
                (?, ?, ?, ?, ?);
        """, (
            payload.season_id,
            payload.team_id,
            payload.player_id,
            payload.role,
            payload.join_date,
        ))
    except pyodbc.Error:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "A player cannot belong to more than one team in the same season.",
                "playerName": "Player",
                "existingTeam": "another team",
            },
        )

    return {"message": "Roster entry created successfully"}


@router.delete("/{roster_id}")
def delete_roster(roster_id: int):
    existing = fetch_one(
        "SELECT roster_id FROM dbo.Rosters WHERE roster_id = ?;",
        (roster_id,)
    )

    if not existing:
        raise HTTPException(status_code=404, detail="Roster entry not found")

    execute_query("DELETE FROM Rosters WHERE roster_id = ?;", (roster_id,))

    return {"message": "Roster entry deleted successfully"}