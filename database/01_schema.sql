/* =========================================================
   MLBB DB -  SQL Server Schema
   ========================================================= */

IF DB_ID('MLBB_DB') IS NULL
BEGIN
    CREATE DATABASE MLBB_DB;
END
GO

USE MLBB_DB;
GO

/* =========================================================
   1. Teams
   ========================================================= */
CREATE TABLE Teams (
    team_id INT IDENTITY(1,1) PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL UNIQUE,
    region VARCHAR(50) NULL,
    coach_name VARCHAR(100) NULL,
    founded_year INT NULL,

    CONSTRAINT CK_Teams_FoundedYear
        CHECK (founded_year IS NULL OR founded_year BETWEEN 2000 AND YEAR(GETDATE()))
);
GO

/* =========================================================
   2. Players
   EXP, Jungle, Mid, Gold, Roam
   ========================================================= */
CREATE TABLE Players (
    player_id INT IDENTITY(1,1) PRIMARY KEY,
    nickname VARCHAR(100) NOT NULL UNIQUE,
    real_name VARCHAR(100) NULL,
    role VARCHAR(20) NOT NULL,
    nationality VARCHAR(50) NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Active',

    CONSTRAINT CK_Players_Role
        CHECK (role IN ('EXP', 'Jungle', 'Mid', 'Gold', 'Roam')),

    CONSTRAINT CK_Players_Status
        CHECK (status IN ('Active', 'Bench', 'Free Agent'))
);
GO

/* =========================================================
   3. Seasons
   ========================================================= */
CREATE TABLE Seasons (
    season_id INT IDENTITY(1,1) PRIMARY KEY,
    season_name VARCHAR(100) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Upcoming',

    CONSTRAINT CK_Seasons_Status
        CHECK (status IN ('Upcoming', 'Active', 'Completed')),

    CONSTRAINT CK_Seasons_DateRange
        CHECK (end_date >= start_date)
);
GO

/* =========================================================
   4. Rosters
   Business rule:
   - A player should not appear twice in the same season.
   - This is included as UNIQUE(player_id, season_id).
   ========================================================= */
CREATE TABLE Rosters (
    roster_id INT IDENTITY(1,1) PRIMARY KEY,
    player_id INT NOT NULL,
    team_id INT NOT NULL,
    season_id INT NOT NULL,
    role VARCHAR(20) NOT NULL,
    join_date DATE NOT NULL,

    CONSTRAINT CK_Rosters_Role
        CHECK (role IN ('EXP', 'Jungle', 'Mid', 'Gold', 'Roam')),

    CONSTRAINT FK_Rosters_Player
        FOREIGN KEY (player_id) REFERENCES Players(player_id)
        ON DELETE CASCADE,

    CONSTRAINT FK_Rosters_Team
        FOREIGN KEY (team_id) REFERENCES Teams(team_id)
        ON DELETE CASCADE,

    CONSTRAINT FK_Rosters_Season
        FOREIGN KEY (season_id) REFERENCES Seasons(season_id)
        ON DELETE CASCADE,

    CONSTRAINT UQ_Rosters_Player_Season
        UNIQUE (player_id, season_id),

    CONSTRAINT UQ_Rosters_Team_Player_Season
        UNIQUE (team_id, player_id, season_id)
);
GO

/* =========================================================
   5. Matches
   ========================================================= */
CREATE TABLE Matches (
    match_id INT IDENTITY(1,1) PRIMARY KEY,
    season_id INT NOT NULL,
    match_date DATE NOT NULL,
    team_a_id INT NOT NULL,
    team_b_id INT NOT NULL,
    team_a_score INT NOT NULL DEFAULT 0,
    team_b_score INT NOT NULL DEFAULT 0,
    winner_team_id INT NULL,
    match_duration_minutes INT NULL,

    CONSTRAINT FK_Matches_Season
        FOREIGN KEY (season_id) REFERENCES Seasons(season_id)
        ON DELETE CASCADE,

    CONSTRAINT FK_Matches_TeamA
        FOREIGN KEY (team_a_id) REFERENCES Teams(team_id),

    CONSTRAINT FK_Matches_TeamB
        FOREIGN KEY (team_b_id) REFERENCES Teams(team_id),

    CONSTRAINT FK_Matches_Winner
        FOREIGN KEY (winner_team_id) REFERENCES Teams(team_id),

    CONSTRAINT CK_Matches_DifferentTeams
        CHECK (team_a_id <> team_b_id),

    CONSTRAINT CK_Matches_NonNegativeScore
        CHECK (team_a_score >= 0 AND team_b_score >= 0),

    CONSTRAINT CK_Matches_Duration
        CHECK (match_duration_minutes IS NULL OR match_duration_minutes > 0)
);
GO

/* =========================================================
   6. MatchStatsFlat
   ========================================================= */
CREATE TABLE MatchStatsFlat (
    stat_id INT IDENTITY(1,1) PRIMARY KEY,
    match_id INT NOT NULL,
    season_id INT NOT NULL,
    team_id INT NOT NULL,
    player_id INT NOT NULL,
    role VARCHAR(20) NOT NULL,

    kills INT NOT NULL DEFAULT 0,
    deaths INT NOT NULL DEFAULT 0,
    assists INT NOT NULL DEFAULT 0,
    gpm INT NOT NULL DEFAULT 0,
    damage_dealt INT NOT NULL DEFAULT 0,
    damage_taken INT NOT NULL DEFAULT 0,
    objective_participation DECIMAL(5,2) NOT NULL DEFAULT 0,
    result VARCHAR(10) NOT NULL,

    CONSTRAINT CK_Stats_Role
        CHECK (role IN ('EXP', 'Jungle', 'Mid', 'Gold', 'Roam')),

    CONSTRAINT CK_Stats_NonNegative
        CHECK (
            kills >= 0 AND deaths >= 0 AND assists >= 0 AND gpm >= 0
            AND damage_dealt >= 0 AND damage_taken >= 0
        ),

    CONSTRAINT CK_Stats_ObjectiveParticipation
        CHECK (objective_participation BETWEEN 0 AND 100),

    CONSTRAINT CK_Stats_Result
        CHECK (result IN ('WIN', 'LOSE')),

    CONSTRAINT FK_Stats_Match
        FOREIGN KEY (match_id) REFERENCES Matches(match_id)
        ON DELETE CASCADE,

    CONSTRAINT FK_Stats_Season
        FOREIGN KEY (season_id) REFERENCES Seasons(season_id),

    CONSTRAINT FK_Stats_Team
        FOREIGN KEY (team_id) REFERENCES Teams(team_id),

    CONSTRAINT FK_Stats_Player
        FOREIGN KEY (player_id) REFERENCES Players(player_id),

    CONSTRAINT UQ_Stats_Match_Player
        UNIQUE (match_id, player_id)
);
GO

/* =========================================================
   Useful indexes for performance
   ========================================================= */
CREATE INDEX IX_Rosters_Season_Team
ON dbo.Rosters(season_id, team_id);
GO

CREATE INDEX IX_Matches_Season_Date
ON dbo.Matches(season_id, match_date);
GO

CREATE INDEX IX_MatchStatsFlat_Player
ON dbo.MatchStatsFlat(player_id);
GO

CREATE INDEX IX_MatchStatsFlat_Role
ON dbo.MatchStatsFlat(role);
GO

CREATE INDEX IX_MatchStatsFlat_Season
ON dbo.MatchStatsFlat(season_id);
GO
