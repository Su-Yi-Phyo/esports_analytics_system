from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import fetch_all, fetch_one, execute_query

router = APIRouter(prefix="/api/seasons", tags=["seasons"])


class SeasonPayload(BaseModel):
    name: str
    start_date: str
    end_date: str
    status: str


@router.get("")
def get_seasons():
    return fetch_all("""
        SELECT
            season_id AS id,
            season_id AS season_id,
            season_name AS name,
            start_date AS startDate,
            start_date AS start_date,
            end_date AS endDate,
            end_date AS end_date,
            status
        FROM dbo.Seasons
        ORDER BY start_date DESC;
    """)


@router.post("")
def create_season(payload: SeasonPayload):
    execute_query("""
        INSERT INTO dbo.Seasons
            (season_name, start_date, end_date, status)
        VALUES
            (?, ?, ?, ?);
    """, (
        payload.name,
        payload.start_date,
        payload.end_date,
        payload.status,
    ))

    return {"message": "Season created successfully"}


@router.put("/{season_id}")
def update_season(season_id: int, payload: SeasonPayload):
    existing = fetch_one(
        "SELECT season_id FROM dbo.Seasons WHERE season_id = ?;",
        (season_id,)
    )

    if not existing:
        raise HTTPException(status_code=404, detail="Season not found")

    execute_query("""
        UPDATE dbo.Seasons
        SET
            season_name = ?,
            start_date = ?,
            end_date = ?,
            status = ?
        WHERE season_id = ?;
    """, (
        payload.name,
        payload.start_date,
        payload.end_date,
        payload.status,
        season_id,
    ))

    return {"message": "Season updated successfully"}


@router.delete("/{season_id}")
def delete_season(season_id: int):
    existing = fetch_one(
        "SELECT season_id FROM dbo.Seasons WHERE season_id = ?;",
        (season_id,)
    )

    if not existing:
        raise HTTPException(status_code=404, detail="Season not found")

    execute_query("DELETE FROM dbo.Rosters WHERE season_id = ?;", (season_id,))
    execute_query("DELETE FROM dbo.Matches WHERE season_id = ?;", (season_id,))
    execute_query("DELETE FROM dbo.Seasons WHERE season_id = ?;", (season_id,))

    return {"message": "Season deleted successfully"}


@router.put("/{season_id}/activate")
def activate_season(season_id: int):
    existing = fetch_one(
        "SELECT season_id FROM dbo.Seasons WHERE season_id = ?;",
        (season_id,)
    )

    if not existing:
        raise HTTPException(status_code=404, detail="Season not found")

    execute_query("""
        UPDATE dbo.Seasons
        SET status = 'Completed'
        WHERE status = 'Active';
    """)

    execute_query("""
        UPDATE dbo.Seasons
        SET status = 'Active'
        WHERE season_id = ?;
    """, (season_id,))

    return {"message": "Season activated successfully"}