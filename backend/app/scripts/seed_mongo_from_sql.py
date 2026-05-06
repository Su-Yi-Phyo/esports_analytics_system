from collections import defaultdict
from app.database import get_connection
from app.mongo_database import match_logs_collection


def safe_float(value):
    return float(value) if value is not None else 0.0


def main():
    conn = get_connection()
    cursor = conn.cursor()

    match_logs_collection.delete_many({})

    cursor.execute("""
        SELECT
            m.match_id,
            m.season_id,
            s.season_name,
            m.match_date,
            m.team_a_id,
            ta.team_name AS team_a_name,
            m.team_b_id,
            tb.team_name AS team_b_name,
            m.team_a_score,
            m.team_b_score,
            m.winner_team_id,
            m.match_duration_minutes
        FROM Matches m
        JOIN Seasons s ON s.season_id = m.season_id
        JOIN Teams ta ON ta.team_id = m.team_a_id
        JOIN Teams tb ON tb.team_id = m.team_b_id
        ORDER BY m.match_date ASC, m.match_id ASC;
    """)

    matches = cursor.fetchall()

    cursor.execute("""
        SELECT
            ms.match_id,
            ms.team_id,
            t.team_name,
            ms.player_id,
            p.nickname,
            ms.role,
            ms.kills,
            ms.deaths,
            ms.assists,
            ms.gpm,
            ms.damage_dealt,
            ms.damage_taken,
            ms.objective_participation,
            ms.result
        FROM MatchStatsFlat ms
        JOIN Teams t ON t.team_id = ms.team_id
        JOIN Players p ON p.player_id = ms.player_id
        ORDER BY ms.match_id, ms.team_id, ms.role;
    """)

    stats = cursor.fetchall()

    grouped_stats = defaultdict(lambda: defaultdict(list))

    for row in stats:
        grouped_stats[row.match_id][row.team_id].append({
            "player_id": int(row.player_id),
            "nickname": row.nickname,
            "role": row.role,
            "kills": int(row.kills),
            "deaths": int(row.deaths),
            "assists": int(row.assists),
            "gpm": int(row.gpm),
            "damage_dealt": int(row.damage_dealt or 0),
            "damage_taken": int(row.damage_taken or 0),
            "objective_participation": safe_float(row.objective_participation),
            "result": row.result,
        })

    docs = []

    for m in matches:
        teams = []

        for team_id, team_name, score in [
            (m.team_a_id, m.team_a_name, m.team_a_score),
            (m.team_b_id, m.team_b_name, m.team_b_score),
        ]:
            teams.append({
                "team_id": int(team_id),
                "team_name": team_name,
                "score": int(score),
                "result": "WIN" if int(team_id) == int(m.winner_team_id) else "LOSE",
                "players": grouped_stats[m.match_id][team_id],
            })

        docs.append({
            "match_id": int(m.match_id),
            "season_id": int(m.season_id),
            "season": m.season_name,
            "match_date": str(m.match_date),
            "duration_minutes": int(m.match_duration_minutes or 0),
            "teams": teams,
        })

    if docs:
        match_logs_collection.insert_many(docs)

    match_logs_collection.create_index("match_id", unique=True)
    match_logs_collection.create_index("teams.players.player_id")
    match_logs_collection.create_index("match_date")

    cursor.close()
    conn.close()

    print(f"Inserted {len(docs)} MongoDB match_logs documents.")


if __name__ == "__main__":
    main()