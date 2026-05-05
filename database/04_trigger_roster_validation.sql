-- ============================================
-- 04_trigger_roster_validation.sql
-- Prevent one player from joining multiple teams in the same season
-- ============================================
USE MLBB_DB;
GO

IF OBJECT_ID('trg_CheckPlayerTeamPerSeason', 'TR') IS NOT NULL
    DROP TRIGGER trg_CheckPlayerTeamPerSeason;
GO

CREATE TRIGGER trg_CheckPlayerTeamPerSeason
ON Rosters
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted
        WHERE player_id IS NULL
           OR season_id IS NULL
           OR team_id IS NULL
    )
    BEGIN
        RAISERROR('player_id, season_id, and team_id cannot be NULL.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;

    IF EXISTS (
        SELECT 1
        FROM Rosters r
        JOIN inserted i
            ON r.player_id = i.player_id
           AND r.season_id = i.season_id
        WHERE r.team_id <> i.team_id
    )
    BEGIN
        RAISERROR('A player cannot belong to more than one team in the same season.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;
END;
GO

-- This should fail if player 1 is already assigned to another team in season 1, sample testing
INSERT INTO Rosters (season_id, team_id, player_id, role, join_date)
VALUES (1, 2, 1, 'EXP', '2026-05-05');

INSERT INTO Rosters (season_id, team_id, player_id, role, join_date)
VALUES (1, 3, 1, 'EXP', '2026-05-05');