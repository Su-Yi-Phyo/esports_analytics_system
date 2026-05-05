-- ============================================
-- 03_leaderboard_dense_rank.sql
-- Global Player Leaderboard using DENSE_RANK
-- ============================================

-- Drop if exists (for easy rerun)
IF OBJECT_ID('PlayerLeaderboard', 'V') IS NOT NULL
    DROP VIEW PlayerLeaderboard;
GO

CREATE VIEW PlayerLeaderboard AS
WITH PlayerStats AS (
    SELECT
        p.player_id,
        p.nickname,
        p.role,
        p.nationality,

        -- Team resolved entirely inside OUTER APPLY to avoid GROUP BY ambiguity
        COALESCE(latest_roster.team_name, 'Free Agent') AS team,

        -- Core metrics
        AVG(CAST(ms.kills + ms.assists AS FLOAT) /
            CASE WHEN ms.deaths = 0 THEN 1 ELSE ms.deaths END) AS kda,

        AVG(CAST(ms.gpm AS FLOAT)) AS gpm,

        100.0 * SUM(CASE WHEN ms.result = 'WIN' THEN 1 ELSE 0 END)
        / COUNT(ms.stat_id) AS win_rate,

        COUNT(ms.stat_id) AS matches_played

    FROM Players p
    LEFT JOIN MatchStatsFlat ms
        ON p.player_id = ms.player_id

    -- Resolve latest team name directly inside OUTER APPLY to avoid
    -- duplicate rows from multi-roster players and simplify GROUP BY
    OUTER APPLY (
        SELECT TOP 1 t2.team_name
        FROM Rosters rt
        JOIN Seasons s  ON s.season_id = rt.season_id
        JOIN Teams  t2  ON t2.team_id  = rt.team_id
        WHERE rt.player_id = p.player_id
        ORDER BY
            CASE WHEN s.status = 'Active' THEN 0 ELSE 1 END,
            s.start_date DESC
    ) AS latest_roster(team_name)

    GROUP BY
        p.player_id,
        p.nickname,
        p.role,
        p.nationality,
        latest_roster.team_name
),

Scored AS (
    SELECT *,
        -- Performance Score breakdown:
        --   KDA        × 0.5  → 50% weight  (skill / survivability)
        --   GPM / 1000 × 0.2  → 20% weight  (economy; 1 000 GPM ≈ baseline 1.0)
        --   Win Rate   × 0.3  → 30% weight  (team success contribution)
        -- Verify GPM range in your data: if avg GPM differs significantly from
        -- 1 000, adjust the divisor so this component stays near its intended 20%.
        (kda * 0.5)
        + (gpm / 1000.0 * 0.2)
        + (win_rate / 100.0 * 0.3) AS performance_score
    FROM PlayerStats
)

SELECT
    DENSE_RANK() OVER (ORDER BY performance_score DESC) AS rank,

    player_id,
    nickname,
    role,
    nationality,
    team,

    CAST(kda            AS DECIMAL(10, 2)) AS kda,
    -- ROUND before casting to DECIMAL(10,0) to round rather than truncate
    CAST(ROUND(gpm, 0)  AS DECIMAL(10, 0)) AS gpm,
    CAST(win_rate       AS DECIMAL(10, 1)) AS win_rate,
    matches_played,

    CAST(performance_score AS DECIMAL(10, 3)) AS score

FROM Scored;
GO

SELECT * FROM PlayerLeaderboard;