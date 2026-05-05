USE MLBB_DB;
GO

/* =========================================================
   Clear existing data for safe re-run
   ========================================================= */
DELETE FROM MatchStatsFlat;
DELETE FROM Matches;
DELETE FROM Rosters;
DELETE FROM Players;
DELETE FROM Teams;
DELETE FROM Seasons;
GO

/* =========================================================
   1. Teams
   ========================================================= */
INSERT INTO Teams (team_name, region, coach_name, founded_year) VALUES
('ONIC Esports', 'Indonesia', 'Coach Yeb', 2018),
('RRQ Hoshi', 'Indonesia', 'Coach James', 2013),
('EVOS Legends', 'Indonesia', 'Coach Zeys', 2016),
('Bigetron Alpha', 'Indonesia', 'Coach Khezcute', 2017),
('Blacklist International', 'Philippines', 'Coach Bon Chan', 2020),
('Team SMG', 'Malaysia', 'Coach Arcadia', 2017),
('RSG Singapore', 'Singapore', 'Coach Diablo', 2019),
('Falcon Esports', 'Myanmar', 'Coach Ice', 2020);
GO

/* =========================================================
   2. Players
   IDs are predictable after reseed:
   1-5 ONIC, 6-10 RRQ, 11-15 EVOS, 16-20 BTR,
   21-25 Blacklist, 26-30 SMG, 31-35 RSG, 36-40 Falcon
   ========================================================= */
INSERT INTO Players (nickname, real_name, role, nationality, status) VALUES
-- ONIC Esports
('Kairi', 'Yasin Dwi', 'EXP', 'Philippines', 'Active'),
('Branz', 'Ribo Pratama', 'Jungle', 'Indonesia', 'Active'),
('Drian', 'Muhammad Drian', 'Mid', 'Indonesia', 'Active'),
('CW', 'Calvin Winata', 'Gold', 'Indonesia', 'Active'),
('Kiboy', 'Nicky Fernando', 'Roam', 'Indonesia', 'Active'),

-- RRQ Hoshi
('Lemon', 'Muhammad Ikhsan', 'EXP', 'Indonesia', 'Active'),
('Alberttt', 'Albert Neilsen', 'Jungle', 'Indonesia', 'Active'),
('Skylar', 'Schevenko Tendean', 'Mid', 'Indonesia', 'Active'),
('Idok', 'Rivaldi Fatah', 'Gold', 'Indonesia', 'Active'),
('Vyn', 'Calvin Winata', 'Roam', 'Indonesia', 'Active'),

-- EVOS Legends
('Bren', 'Mark Sebastian', 'EXP', 'Indonesia', 'Active'),
('Kelra', 'Duane Pillas', 'Jungle', 'Philippines', 'Active'),
('Hito', 'Hito Prasetyo', 'Mid', 'Indonesia', 'Active'),
('Tazz', 'Jabran Bagus', 'Gold', 'Indonesia', 'Active'),
('Wise', 'Danerie Del Rosario', 'Roam', 'Philippines', 'Active'),

-- Bigetron Alpha
('Sanji', 'Sanji Villanueva', 'EXP', 'Philippines', 'Active'),
('Greed', 'Greed Armero', 'Jungle', 'Philippines', 'Active'),
('Owl', 'Owl Esports', 'Mid', 'Philippines', 'Active'),
('Kabuki', 'Muhammad Fajri', 'Gold', 'Indonesia', 'Active'),
('Touch', 'Touch Saputra', 'Roam', 'Indonesia', 'Active'),

-- Blacklist International
('Edward', 'Edward Dapadap', 'EXP', 'Philippines', 'Active'),
('Hadji', 'Salic Imam', 'Jungle', 'Philippines', 'Active'),
('Yue', 'Yue Martinez', 'Mid', 'Philippines', 'Active'),
('Oheb', 'Kiel Soriano', 'Gold', 'Philippines', 'Active'),
('OhMyV33nus', 'Johnmar Villaluna', 'Roam', 'Philippines', 'Active'),

-- Team SMG
('Smooth', 'Ahmad Faris', 'EXP', 'Malaysia', 'Active'),
('Sasa', 'Sasa Sulaiman', 'Jungle', 'Malaysia', 'Active'),
('Stormie', 'Lim Jian Wei', 'Mid', 'Malaysia', 'Active'),
('Mann', 'Muhammad Mann', 'Gold', 'Malaysia', 'Active'),
('Rynn', 'Tan Rynn', 'Roam', 'Malaysia', 'Active'),

-- RSG Singapore
('Diablo', 'Diablo Lim', 'EXP', 'Singapore', 'Active'),
('Aqua', 'Aqua Tan', 'Jungle', 'Singapore', 'Active'),
('Luciano', 'Luciano Lee', 'Mid', 'Singapore', 'Active'),
('Ly4ly4ly4', 'Lim Yang', 'Gold', 'Singapore', 'Active'),
('BRAYYY', 'Brayden Wong', 'Roam', 'Singapore', 'Active'),

-- Falcon Esports
('Naomi', 'Naomi Kyaw', 'EXP', 'Myanmar', 'Active'),
('Justin', 'Justin Min', 'Jungle', 'Myanmar', 'Active'),
('RubyDD', 'Ruby Tun', 'Mid', 'Myanmar', 'Active'),
('Silent', 'Silent Aung', 'Gold', 'Myanmar', 'Active'),
('Ace', 'Ace Htet', 'Roam', 'Myanmar', 'Active');
GO

/* =========================================================
   3. Seasons
   ========================================================= */
INSERT INTO Seasons (season_name, start_date, end_date, status) VALUES
('MPL Invitational 2025', '2025-08-01', '2025-11-30', 'Completed'),
('MPL Spring 2026', '2026-02-10', '2026-05-25', 'Active'),
('MPL Summer 2026', '2026-07-01', '2026-10-30', 'Upcoming');
GO

/* =========================================================
   4. Rosters for Active Season: MPL Spring 2026 (season_id = 2)
   ========================================================= */
INSERT INTO Rosters (player_id, team_id, season_id, role, join_date) VALUES
(1,1,2,'EXP','2026-02-01'),(2,1,2,'Jungle','2026-02-01'),(3,1,2,'Mid','2026-02-01'),(4,1,2,'Gold','2026-02-01'),(5,1,2,'Roam','2026-02-01'),
(6,2,2,'EXP','2026-02-01'),(7,2,2,'Jungle','2026-02-01'),(8,2,2,'Mid','2026-02-01'),(9,2,2,'Gold','2026-02-01'),(10,2,2,'Roam','2026-02-01'),
(11,3,2,'EXP','2026-02-01'),(12,3,2,'Jungle','2026-02-01'),(13,3,2,'Mid','2026-02-01'),(14,3,2,'Gold','2026-02-01'),(15,3,2,'Roam','2026-02-01'),
(16,4,2,'EXP','2026-02-01'),(17,4,2,'Jungle','2026-02-01'),(18,4,2,'Mid','2026-02-01'),(19,4,2,'Gold','2026-02-01'),(20,4,2,'Roam','2026-02-01'),
(21,5,2,'EXP','2026-02-01'),(22,5,2,'Jungle','2026-02-01'),(23,5,2,'Mid','2026-02-01'),(24,5,2,'Gold','2026-02-01'),(25,5,2,'Roam','2026-02-01'),
(26,6,2,'EXP','2026-02-01'),(27,6,2,'Jungle','2026-02-01'),(28,6,2,'Mid','2026-02-01'),(29,6,2,'Gold','2026-02-01'),(30,6,2,'Roam','2026-02-01'),
(31,7,2,'EXP','2026-02-01'),(32,7,2,'Jungle','2026-02-01'),(33,7,2,'Mid','2026-02-01'),(34,7,2,'Gold','2026-02-01'),(35,7,2,'Roam','2026-02-01'),
(36,8,2,'EXP','2026-02-01'),(37,8,2,'Jungle','2026-02-01'),(38,8,2,'Mid','2026-02-01'),(39,8,2,'Gold','2026-02-01'),(40,8,2,'Roam','2026-02-01');
GO

/* =========================================================
   5. Matches for Active Season
   ========================================================= */
INSERT INTO Matches (season_id, match_date, team_a_id, team_b_id, team_a_score, team_b_score, winner_team_id, match_duration_minutes) VALUES
(2,'2026-03-02',1,2,2,1,1,19),
(2,'2026-03-03',3,4,1,2,4,22),
(2,'2026-03-04',5,6,2,0,5,18),
(2,'2026-03-05',7,8,1,2,8,24),
(2,'2026-03-07',1,3,2,0,1,17),
(2,'2026-03-08',2,4,2,1,2,21),
(2,'2026-03-09',5,7,2,1,5,23),
(2,'2026-03-10',6,8,0,2,8,20),
(2,'2026-03-12',1,5,1,2,5,26),
(2,'2026-03-13',2,6,2,0,2,18),
(2,'2026-03-14',3,7,2,1,3,25),
(2,'2026-03-15',4,8,1,2,8,27),
(2,'2026-03-17',1,4,2,1,1,22),
(2,'2026-03-18',2,5,1,2,5,24),
(2,'2026-03-19',3,8,0,2,8,19),
(2,'2026-03-20',6,7,2,1,6,23);
GO

/* =========================================================
   6. MatchStatsFlat
   16 matches x 10 players = 160 rows
   Format: match_id, season_id, team_id, player_id, role,
           kills, deaths, assists, gpm, damage_dealt, damage_taken,
           objective_participation, result
   ========================================================= */
INSERT INTO MatchStatsFlat
(match_id, season_id, team_id, player_id, role, kills, deaths, assists, gpm, damage_dealt, damage_taken, objective_participation, result)
VALUES
-- Match 1: ONIC WIN vs RRQ
(1,2,1,1,'EXP',7,2,9,710,24500,23800,68.50,'WIN'),(1,2,1,2,'Jungle',9,3,11,805,31200,20600,74.00,'WIN'),(1,2,1,3,'Mid',6,2,10,665,28600,15800,71.20,'WIN'),(1,2,1,4,'Gold',11,1,7,835,34800,14200,66.40,'WIN'),(1,2,1,5,'Roam',2,4,16,485,9800,27600,82.50,'WIN'),
(1,2,2,6,'EXP',5,5,7,680,21100,26000,55.80,'LOSE'),(1,2,2,7,'Jungle',7,5,8,755,27900,22800,61.50,'LOSE'),(1,2,2,8,'Mid',4,4,9,635,23800,17100,59.20,'LOSE'),(1,2,2,9,'Gold',8,3,6,790,30100,15300,57.80,'LOSE'),(1,2,2,10,'Roam',1,5,13,455,8200,28900,70.30,'LOSE'),
-- Match 2: EVOS LOSE vs BTR WIN
(2,2,3,11,'EXP',4,6,6,640,20600,28600,49.50,'LOSE'),(2,2,3,12,'Jungle',6,6,7,718,26100,24800,54.30,'LOSE'),(2,2,3,13,'Mid',4,5,6,605,22100,18300,51.20,'LOSE'),(2,2,3,14,'Gold',7,4,5,738,27600,16200,50.70,'LOSE'),(2,2,3,15,'Roam',2,6,9,420,7600,30100,64.80,'LOSE'),
(2,2,4,16,'EXP',8,3,10,690,26600,23900,67.10,'WIN'),(2,2,4,17,'Jungle',10,2,12,775,33100,21700,78.60,'WIN'),(2,2,4,18,'Mid',6,3,9,650,27400,16200,69.40,'WIN'),(2,2,4,19,'Gold',11,2,8,790,35200,14800,71.00,'WIN'),(2,2,4,20,'Roam',3,3,15,462,9700,28100,80.40,'WIN'),
-- Match 3: Blacklist WIN vs SMG
(3,2,5,21,'EXP',6,2,10,702,24100,23600,70.60,'WIN'),(3,2,5,22,'Jungle',8,2,12,795,30900,20400,77.80,'WIN'),(3,2,5,23,'Mid',7,1,11,668,29500,15100,73.20,'WIN'),(3,2,5,24,'Gold',10,2,8,822,33700,14300,68.70,'WIN'),(3,2,5,25,'Roam',2,3,17,492,9100,27200,84.90,'WIN'),
(3,2,6,26,'EXP',3,5,5,632,19100,26900,46.30,'LOSE'),(3,2,6,27,'Jungle',5,5,6,710,24900,23800,51.40,'LOSE'),(3,2,6,28,'Mid',4,4,5,610,22000,17400,49.20,'LOSE'),(3,2,6,29,'Gold',6,4,4,742,26300,16100,46.90,'LOSE'),(3,2,6,30,'Roam',1,5,8,438,6800,29500,60.00,'LOSE'),
-- Match 4: RSG LOSE vs Falcon WIN
(4,2,7,31,'EXP',5,5,6,655,21300,27500,52.30,'LOSE'),(4,2,7,32,'Jungle',7,5,7,735,26600,24100,58.70,'LOSE'),(4,2,7,33,'Mid',5,4,6,628,23000,17800,54.10,'LOSE'),(4,2,7,34,'Gold',8,4,5,762,28500,16500,55.60,'LOSE'),(4,2,7,35,'Roam',2,5,10,448,7900,30300,65.20,'LOSE'),
(4,2,8,36,'EXP',7,3,9,685,24700,24200,66.40,'WIN'),(4,2,8,37,'Jungle',10,3,10,785,32100,21800,74.50,'WIN'),(4,2,8,38,'Mid',6,2,11,652,28100,15900,70.20,'WIN'),(4,2,8,39,'Gold',12,2,7,812,36100,14900,69.70,'WIN'),(4,2,8,40,'Roam',3,3,14,468,9300,28500,79.80,'WIN'),
-- Match 5: ONIC WIN vs EVOS
(5,2,1,1,'EXP',8,1,12,722,26900,22100,75.20,'WIN'),(5,2,1,2,'Jungle',11,2,14,815,34800,20200,82.10,'WIN'),(5,2,1,3,'Mid',7,2,10,674,30100,15500,72.50,'WIN'),(5,2,1,4,'Gold',12,1,9,842,37200,13700,71.30,'WIN'),(5,2,1,5,'Roam',4,2,15,498,10400,26800,85.00,'WIN'),
(5,2,3,11,'EXP',3,6,4,635,18400,29200,42.30,'LOSE'),(5,2,3,12,'Jungle',5,7,6,705,23700,25700,48.40,'LOSE'),(5,2,3,13,'Mid',4,5,5,600,21300,18800,45.80,'LOSE'),(5,2,3,14,'Gold',6,5,4,730,25800,17100,43.20,'LOSE'),(5,2,3,15,'Roam',1,6,7,418,6500,31000,55.90,'LOSE'),
-- Match 6: RRQ WIN vs BTR
(6,2,2,6,'EXP',7,2,9,705,24800,23000,68.00,'WIN'),(6,2,2,7,'Jungle',10,3,11,782,32900,21300,75.20,'WIN'),(6,2,2,8,'Mid',6,2,8,652,27200,16000,67.70,'WIN'),(6,2,2,9,'Gold',11,1,8,820,35600,14300,70.40,'WIN'),(6,2,2,10,'Roam',3,3,14,470,9300,27600,79.20,'WIN'),
(6,2,4,16,'EXP',5,5,7,676,21300,26100,53.80,'LOSE'),(6,2,4,17,'Jungle',7,5,8,742,28200,23600,59.50,'LOSE'),(6,2,4,18,'Mid',5,4,6,632,23700,17600,54.60,'LOSE'),(6,2,4,19,'Gold',8,4,5,765,29300,16600,56.10,'LOSE'),(6,2,4,20,'Roam',2,5,10,450,8100,29900,65.00,'LOSE'),
-- Match 7: Blacklist WIN vs RSG
(7,2,5,21,'EXP',7,3,9,708,25000,23200,68.90,'WIN'),(7,2,5,22,'Jungle',9,2,13,802,32300,20800,80.10,'WIN'),(7,2,5,23,'Mid',8,2,10,675,31000,15300,75.60,'WIN'),(7,2,5,24,'Gold',10,2,9,826,34400,14600,70.10,'WIN'),(7,2,5,25,'Roam',2,3,18,496,9100,27400,86.30,'WIN'),
(7,2,7,31,'EXP',4,5,6,650,20200,26700,50.30,'LOSE'),(7,2,7,32,'Jungle',6,6,7,728,25500,24200,54.70,'LOSE'),(7,2,7,33,'Mid',5,5,5,620,22600,18100,50.20,'LOSE'),(7,2,7,34,'Gold',7,4,5,758,28000,16600,52.40,'LOSE'),(7,2,7,35,'Roam',1,5,10,445,7400,30400,63.10,'LOSE'),
-- Match 8: SMG LOSE vs Falcon WIN
(8,2,6,26,'EXP',4,5,5,638,19800,27000,48.10,'LOSE'),(8,2,6,27,'Jungle',6,6,6,714,25400,24000,52.40,'LOSE'),(8,2,6,28,'Mid',5,5,5,612,22500,18000,50.60,'LOSE'),(8,2,6,29,'Gold',7,4,5,748,27800,16400,51.80,'LOSE'),(8,2,6,30,'Roam',2,5,9,442,7600,29800,62.50,'LOSE'),
(8,2,8,36,'EXP',8,2,10,692,26300,23200,70.70,'WIN'),(8,2,8,37,'Jungle',11,3,11,792,34200,21100,77.90,'WIN'),(8,2,8,38,'Mid',7,2,10,660,29200,15600,72.80,'WIN'),(8,2,8,39,'Gold',12,1,8,820,36600,14200,70.20,'WIN'),(8,2,8,40,'Roam',3,3,16,472,9600,27900,82.60,'WIN'),
-- Match 9: ONIC LOSE vs Blacklist WIN
(9,2,1,1,'EXP',5,4,8,705,22900,24900,58.30,'LOSE'),(9,2,1,2,'Jungle',7,5,9,770,29600,22500,62.10,'LOSE'),(9,2,1,3,'Mid',6,4,7,650,26300,17000,57.40,'LOSE'),(9,2,1,4,'Gold',9,3,5,808,31700,15500,56.90,'LOSE'),(9,2,1,5,'Roam',2,5,11,462,8200,29100,66.40,'LOSE'),
(9,2,5,21,'EXP',8,2,11,714,27000,22600,74.20,'WIN'),(9,2,5,22,'Jungle',10,3,13,805,34100,20500,80.50,'WIN'),(9,2,5,23,'Mid',8,2,12,680,31400,14900,77.10,'WIN'),(9,2,5,24,'Gold',11,2,9,832,35500,14000,72.50,'WIN'),(9,2,5,25,'Roam',3,3,17,500,9500,27000,85.90,'WIN'),
-- Match 10: RRQ WIN vs SMG
(10,2,2,6,'EXP',8,2,8,710,25200,22800,69.10,'WIN'),(10,2,2,7,'Jungle',11,2,10,790,33500,20700,76.80,'WIN'),(10,2,2,8,'Mid',7,1,9,660,28800,15200,71.00,'WIN'),(10,2,2,9,'Gold',12,2,7,824,36000,14400,68.70,'WIN'),(10,2,2,10,'Roam',2,3,16,476,9000,28000,81.40,'WIN'),
(10,2,6,26,'EXP',3,5,4,630,18600,27200,44.20,'LOSE'),(10,2,6,27,'Jungle',5,6,6,705,23800,24600,49.50,'LOSE'),(10,2,6,28,'Mid',4,5,5,606,21000,18300,46.30,'LOSE'),(10,2,6,29,'Gold',6,4,4,740,25800,16700,45.90,'LOSE'),(10,2,6,30,'Roam',1,5,8,435,6800,30200,58.70,'LOSE'),
-- Match 11: EVOS WIN vs RSG
(11,2,3,11,'EXP',7,3,8,665,23900,23800,64.20,'WIN'),(11,2,3,12,'Jungle',9,3,9,752,31000,22000,70.50,'WIN'),(11,2,3,13,'Mid',7,2,8,638,27900,16000,66.70,'WIN'),(11,2,3,14,'Gold',10,2,7,782,33100,15000,65.30,'WIN'),(11,2,3,15,'Roam',3,3,13,455,8900,28200,76.20,'WIN'),
(11,2,7,31,'EXP',5,5,5,650,21000,27000,50.40,'LOSE'),(11,2,7,32,'Jungle',6,5,6,730,25500,23800,53.80,'LOSE'),(11,2,7,33,'Mid',4,4,6,620,22500,17800,52.00,'LOSE'),(11,2,7,34,'Gold',7,4,5,758,27900,16400,52.70,'LOSE'),(11,2,7,35,'Roam',2,5,9,445,7500,30000,61.40,'LOSE'),
-- Match 12: BTR LOSE vs Falcon WIN
(12,2,4,16,'EXP',6,5,6,680,22000,26000,54.30,'LOSE'),(12,2,4,17,'Jungle',7,6,7,744,27500,24200,57.80,'LOSE'),(12,2,4,18,'Mid',5,5,6,632,23500,18000,53.20,'LOSE'),(12,2,4,19,'Gold',8,4,5,770,29500,16500,55.10,'LOSE'),(12,2,4,20,'Roam',2,5,10,452,8100,29600,64.60,'LOSE'),
(12,2,8,36,'EXP',9,3,10,695,27100,23500,72.30,'WIN'),(12,2,8,37,'Jungle',12,2,12,800,35400,20700,80.20,'WIN'),(12,2,8,38,'Mid',8,2,9,665,30200,15300,73.60,'WIN'),(12,2,8,39,'Gold',13,2,8,825,37200,14100,71.80,'WIN'),(12,2,8,40,'Roam',4,3,15,478,10100,27500,83.10,'WIN'),
-- Match 13: ONIC WIN vs BTR
(13,2,1,1,'EXP',8,2,10,718,26200,22800,72.70,'WIN'),(13,2,1,2,'Jungle',10,2,13,810,34000,20300,81.40,'WIN'),(13,2,1,3,'Mid',8,1,9,678,30600,15100,73.90,'WIN'),(13,2,1,4,'Gold',12,2,8,838,36500,14200,70.60,'WIN'),(13,2,1,5,'Roam',3,3,16,492,9500,27200,82.90,'WIN'),
(13,2,4,16,'EXP',5,5,6,675,21000,26200,51.90,'LOSE'),(13,2,4,17,'Jungle',6,6,7,738,26000,24000,55.00,'LOSE'),(13,2,4,18,'Mid',5,4,5,628,23200,17700,50.60,'LOSE'),(13,2,4,19,'Gold',8,4,4,762,28500,16500,51.30,'LOSE'),(13,2,4,20,'Roam',2,5,9,448,7800,29800,62.80,'LOSE'),
-- Match 14: RRQ LOSE vs Blacklist WIN
(14,2,2,6,'EXP',6,4,7,700,23000,24800,56.50,'LOSE'),(14,2,2,7,'Jungle',8,5,8,768,29200,22600,60.70,'LOSE'),(14,2,2,8,'Mid',6,4,6,642,26000,17000,55.20,'LOSE'),(14,2,2,9,'Gold',9,3,5,803,31400,15400,55.90,'LOSE'),(14,2,2,10,'Roam',2,5,10,458,8000,28900,65.10,'LOSE'),
(14,2,5,21,'EXP',9,2,11,720,27800,22500,76.20,'WIN'),(14,2,5,22,'Jungle',11,3,13,810,35000,20500,82.00,'WIN'),(14,2,5,23,'Mid',8,2,12,682,31800,15000,78.60,'WIN'),(14,2,5,24,'Gold',12,1,10,840,37100,13900,74.30,'WIN'),(14,2,5,25,'Roam',3,3,18,504,9700,26900,87.50,'WIN'),
-- Match 15: EVOS LOSE vs Falcon WIN
(15,2,3,11,'EXP',4,6,5,638,19800,28600,45.70,'LOSE'),(15,2,3,12,'Jungle',6,6,6,712,25000,24700,50.30,'LOSE'),(15,2,3,13,'Mid',4,5,5,604,21800,18500,47.80,'LOSE'),(15,2,3,14,'Gold',7,4,4,735,26800,16700,47.20,'LOSE'),(15,2,3,15,'Roam',1,6,8,418,6900,30700,58.30,'LOSE'),
(15,2,8,36,'EXP',8,2,10,700,26500,23000,71.40,'WIN'),(15,2,8,37,'Jungle',11,2,12,804,35000,20400,81.00,'WIN'),(15,2,8,38,'Mid',8,2,9,668,30400,15200,73.80,'WIN'),(15,2,8,39,'Gold',12,2,9,828,36700,14100,72.10,'WIN'),(15,2,8,40,'Roam',3,3,16,480,9600,27300,84.00,'WIN'),
-- Match 16: SMG WIN vs RSG
(16,2,6,26,'EXP',7,3,8,665,23500,23500,64.20,'WIN'),(16,2,6,27,'Jungle',9,3,9,752,31000,22000,70.80,'WIN'),(16,2,6,28,'Mid',7,2,8,638,27900,16000,66.50,'WIN'),(16,2,6,29,'Gold',10,2,7,782,33100,15000,65.20,'WIN'),(16,2,6,30,'Roam',3,3,13,455,8900,28200,76.00,'WIN'),
(16,2,7,31,'EXP',5,5,5,650,21000,27000,50.10,'LOSE'),(16,2,7,32,'Jungle',6,5,6,730,25500,23800,53.50,'LOSE'),(16,2,7,33,'Mid',4,4,6,620,22500,17800,51.70,'LOSE'),(16,2,7,34,'Gold',7,4,5,758,27900,16400,52.40,'LOSE'),(16,2,7,35,'Roam',2,5,9,445,7500,30000,61.10,'LOSE');
GO

/* =========================================================
   Quick verification
   ========================================================= */
SELECT 'Teams' AS table_name, COUNT(*) AS total_rows FROM Teams
UNION ALL SELECT 'Players', COUNT(*) FROM Players
UNION ALL SELECT 'Seasons', COUNT(*) FROM Seasons
UNION ALL SELECT 'Rosters', COUNT(*) FROM Rosters
UNION ALL SELECT 'Matches', COUNT(*) FROM Matches
UNION ALL SELECT 'MatchStatsFlat', COUNT(*) FROM MatchStatsFlat;
GO

SELECT * FROM TEAMS;
SELECT * FROM PLAYERS;
SELECT * FROM SEASONS;
SELECT * FROM ROSTERS;
SELECT * FROM MATCHES;
SELECT * FROM MatchStatsFlat;