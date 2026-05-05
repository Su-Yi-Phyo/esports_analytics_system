from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import fetch_all, fetch_one, execute_query

router = APIRouter(prefix="/api/players", tags=["players"])


class PlayerPayload(BaseModel):
    nickname: str
    real_name: str | None = None
    role: str
    nationality: str | None = None
    status: str = "Active"
    avatar: str | None = None  # frontend sends this, but DB does not need to store it


@router.get("")
def get_players():
    return fetch_all("""
        SELECT
            p.player_id AS id,
            p.player_id AS player_id,
            p.nickname,
            p.real_name AS realName,
            p.real_name AS real_name,
            p.role,
            p.nationality,
            p.status,

            COALESCE(t.team_name, 'Free Agent') AS team,
            COALESCE(t.team_name, 'Free Agent') AS team_name,

            COALESCE(
                CAST(AVG(
                    CAST(ms.kills + ms.assists AS FLOAT) /
                    CASE WHEN ms.deaths = 0 THEN 1 ELSE ms.deaths END
                ) AS DECIMAL(10,2)),
                0
            ) AS kda,

            COALESCE(
                CAST(AVG(CAST(ms.gpm AS FLOAT)) AS DECIMAL(10,0)),
                0
            ) AS gpm,

            COALESCE(
                CAST(
                    100.0 * SUM(CASE WHEN ms.result = 'WIN' THEN 1 ELSE 0 END)
                    / NULLIF(COUNT(ms.stat_id), 0)
                AS DECIMAL(10,1)),
                0
            ) AS winRate,

            COALESCE(
                CAST(
                    100.0 * SUM(CASE WHEN ms.result = 'WIN' THEN 1 ELSE 0 END)
                    / NULLIF(COUNT(ms.stat_id), 0)
                AS DECIMAL(10,1)),
                0
            ) AS win_rate,

            COUNT(ms.stat_id) AS matchesPlayed,
            COUNT(ms.stat_id) AS matches_played

        FROM dbo.Players p
        LEFT JOIN dbo.MatchStatsFlat ms ON p.player_id = ms.player_id

        OUTER APPLY (
            SELECT TOP 1 rt.team_id
            FROM dbo.Rosters rt
            JOIN dbo.Seasons s ON s.season_id = rt.season_id
            WHERE rt.player_id = p.player_id
            ORDER BY
                CASE WHEN s.status = 'Active' THEN 0 ELSE 1 END,
                s.start_date DESC
        ) latest_roster

        LEFT JOIN dbo.Teams t ON t.team_id = latest_roster.team_id

        GROUP BY
            p.player_id,
            p.nickname,
            p.real_name,
            p.role,
            p.nationality,
            p.status,
            t.team_name

        ORDER BY kda DESC, p.nickname ASC;
    """)


@router.get("/{player_id}")
def get_player(player_id: int):
    player = fetch_one("""
        SELECT
            p.player_id AS id,
            p.player_id AS player_id,
            p.nickname,
            p.real_name AS realName,
            p.real_name AS real_name,
            p.role,
            p.nationality,
            p.status,

            COALESCE(t.team_name, 'Free Agent') AS team,
            COALESCE(t.team_name, 'Free Agent') AS team_name,

            COALESCE(
                CAST(AVG(
                    CAST(ms.kills + ms.assists AS FLOAT) /
                    CASE WHEN ms.deaths = 0 THEN 1 ELSE ms.deaths END
                ) AS DECIMAL(10,2)),
                0
            ) AS kda,

            COALESCE(
                CAST(AVG(CAST(ms.gpm AS FLOAT)) AS DECIMAL(10,0)),
                0
            ) AS gpm,

            COALESCE(
                CAST(
                    100.0 * SUM(CASE WHEN ms.result = 'WIN' THEN 1 ELSE 0 END)
                    / NULLIF(COUNT(ms.stat_id), 0)
                AS DECIMAL(10,1)),
                0
            ) AS winRate,

            COALESCE(
                CAST(
                    100.0 * SUM(CASE WHEN ms.result = 'WIN' THEN 1 ELSE 0 END)
                    / NULLIF(COUNT(ms.stat_id), 0)
                AS DECIMAL(10,1)),
                0
            ) AS win_rate,

            COUNT(ms.stat_id) AS matchesPlayed,
            COUNT(ms.stat_id) AS matches_played

        FROM Players p
        LEFT JOIN MatchStatsFlat ms ON p.player_id = ms.player_id

        OUTER APPLY (
            SELECT TOP 1 rt.team_id
            FROM Rosters rt
            JOIN Seasons s ON s.season_id = rt.season_id
            WHERE rt.player_id = p.player_id
            ORDER BY
                CASE WHEN s.status = 'Active' THEN 0 ELSE 1 END,
                s.start_date DESC
        ) latest_roster

        LEFT JOIN Teams t ON t.team_id = latest_roster.team_id

        WHERE p.player_id = ?

        GROUP BY
            p.player_id,
            p.nickname,
            p.real_name,
            p.role,
            p.nationality,
            p.status,
            t.team_name;
    """, (player_id,))

    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    player["recentMatches"] = fetch_all("""
        SELECT TOP 20
            m.match_id AS matchId,
            m.match_id AS match_id,
            m.match_date AS matchDate,
            m.match_date AS match_date,
            ms.kills,
            ms.deaths,
            ms.assists,
            ms.gpm,
            CAST(
                CAST(ms.kills + ms.assists AS FLOAT) /
                CASE WHEN ms.deaths = 0 THEN 1 ELSE ms.deaths END
            AS DECIMAL(10,2)) AS kda,
            ms.result
        FROM MatchStatsFlat ms
        JOIN Matches m ON m.match_id = ms.match_id
        WHERE ms.player_id = ?
        ORDER BY m.match_date DESC, m.match_id DESC;
    """, (player_id,))

    return player


@router.post("")
def create_player(payload: PlayerPayload):
    execute_query("""
        INSERT INTO Players
            (nickname, real_name, role, nationality, status)
        VALUES
            (?, ?, ?, ?, ?);
    """, (
        payload.nickname,
        payload.real_name,
        payload.role,
        payload.nationality,
        payload.status,
    ))

    return {"message": "Player created successfully"}


@router.put("/{player_id}")
def update_player(player_id: int, payload: PlayerPayload):
    existing = fetch_one(
        "SELECT player_id FROM Players WHERE player_id = ?;",
        (player_id,)
    )

    if not existing:
        raise HTTPException(status_code=404, detail="Player not found")

    execute_query("""
        UPDATE Players
        SET
            nickname = ?,
            real_name = ?,
            role = ?,
            nationality = ?,
            status = ?
        WHERE player_id = ?;
    """, (
        payload.nickname,
        payload.real_name,
        payload.role,
        payload.nationality,
        payload.status,
        player_id,
    ))

    return {"message": "Player updated successfully"}


@router.delete("/{player_id}")
def delete_player(player_id: int):
    existing = fetch_one(
        "SELECT player_id FROM Players WHERE player_id = ?;",
        (player_id,)
    )

    if not existing:
        raise HTTPException(status_code=404, detail="Player not found")

    execute_query("DELETE FROM MatchStatsFlat WHERE player_id = ?;", (player_id,))
    execute_query("DELETE FROM Rosters WHERE player_id = ?;", (player_id,))
    execute_query("DELETE FROM Players WHERE player_id = ?;", (player_id,))

    return {"message": "Player deleted successfully"}