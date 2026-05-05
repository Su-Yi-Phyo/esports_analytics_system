from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import fetch_all, fetch_one, execute_query

router = APIRouter(prefix="/api/teams", tags=["teams"])


class TeamPayload(BaseModel):
    name: str
    region: str | None = None
    coach: str | None = None
    founded: int | None = None


@router.get("")
def get_teams():
    return fetch_all("""
        SELECT
            t.team_id AS id,
            t.team_id AS team_id,
            t.team_name AS name,
            t.team_name AS team_name,
            t.region,
            t.coach_name AS coach,
            t.coach_name AS coachName,
            t.founded_year AS founded,
            t.founded_year AS foundedYear,

            LEFT(t.team_name, 2) AS logo,
            '#a855f7' AS color,

            COUNT(DISTINCT r.player_id) AS rosterCount,
            COUNT(DISTINCT r.player_id) AS roster_count,
            COUNT(DISTINCT r.season_id) AS seasonCount,
            COUNT(DISTINCT r.season_id) AS season_count
        FROM dbo.Teams t
        LEFT JOIN Rosters r ON r.team_id = t.team_id
        GROUP BY
            t.team_id,
            t.team_name,
            t.region,
            t.coach_name,
            t.founded_year
        ORDER BY t.team_name;
    """)


@router.get("/{team_id}/roster")
def get_team_roster(team_id: int):
    return fetch_all("""
        SELECT
            r.roster_id AS id,
            p.player_id,
            p.nickname,
            p.real_name AS realName,
            p.real_name AS real_name,
            r.role,
            r.join_date AS joinDate,
            r.join_date AS join_date,
            '#a855f7' AS avatar
        FROM Rosters r
        JOIN Players p ON p.player_id = r.player_id
        JOIN Seasons s ON s.season_id = r.season_id
        WHERE r.team_id = ?
        ORDER BY
            CASE WHEN s.status = 'Active' THEN 0 ELSE 1 END,
            s.start_date DESC,
            r.role;
    """, (team_id,))


@router.post("")
def create_team(payload: TeamPayload):
    execute_query("""
        INSERT INTO Teams
            (team_name, region, coach_name, founded_year)
        VALUES
            (?, ?, ?, ?);
    """, (
        payload.name,
        payload.region,
        payload.coach,
        payload.founded,
    ))

    return {"message": "Team created successfully"}


@router.put("/{team_id}")
def update_team(team_id: int, payload: TeamPayload):
    existing = fetch_one(
        "SELECT team_id FROM Teams WHERE team_id = ?;",
        (team_id,)
    )

    if not existing:
        raise HTTPException(status_code=404, detail="Team not found")

    execute_query("""
        UPDATE Teams
        SET
            team_name = ?,
            region = ?,
            coach_name = ?,
            founded_year = ?
        WHERE team_id = ?;
    """, (
        payload.name,
        payload.region,
        payload.coach,
        payload.founded,
        team_id,
    ))

    return {"message": "Team updated successfully"}


@router.delete("/{team_id}")
def delete_team(team_id: int):
    existing = fetch_one(
        "SELECT team_id FROM Teams WHERE team_id = ?;",
        (team_id,)
    )

    if not existing:
        raise HTTPException(status_code=404, detail="Team not found")

    execute_query("DELETE FROM Rosters WHERE team_id = ?;", (team_id,))
    execute_query("DELETE FROM Teams WHERE team_id = ?;", (team_id,))

    return {"message": "Team deleted successfully"}