-- ============================================
-- 07_role_based_dense_rank.sql
-- Role-based Player Leaderboard using DENSE_RANK
-- ============================================

IF OBJECT_ID('RoleBasedPlayerLeaderboard', 'V') IS NOT NULL
    DROP VIEW RoleBasedPlayerLeaderboard;
GO

CREATE VIEW RoleBasedPlayerLeaderboard AS
SELECT
    DENSE_RANK() OVER (
        PARTITION BY role
        ORDER BY score DESC
    ) AS role_rank,

    rank AS global_rank,
    player_id,
    nickname,
    role,
    nationality,
    team,
    kda,
    gpm,
    win_rate,
    matches_played,
    score

FROM PlayerLeaderboard;
GO

SELECT * 
FROM RoleBasedPlayerLeaderboard
ORDER BY role, role_rank;