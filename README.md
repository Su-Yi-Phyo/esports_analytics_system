# Esports League Analytics & Leaderboards

## 1. Project Summary

This project is an Advanced Database Systems final project focused on an **Esports League Analytics and Decision Support System**. The system manages professional MLBB-style esports data, including players, teams, seasons, rosters, matches, player statistics, leaderboards, and coaching analytics.

The system uses **SQL Server** as the main relational database for structured data such as players, teams, rosters, seasons, matches, and match statistics. It also implements advanced database features such as `DENSE_RANK()` for leaderboard ranking, a SQL trigger for roster validation, and a CHECK constraint to prevent invalid match records.

The frontend is built with **React + Vite**, while the backend is built with **FastAPI (Python)**. Docker is used to run the backend and SQL Server database consistently.

---

## 2. Main Features

### Admin Features

- Manage players
- Manage teams
- Manage seasons
- Manage rosters
- Enter match results and player statistics
- View match records
- View admin overview dashboard

### Coach / User Features

- View player leaderboard
- View role-based leaderboard
- View player profiles
- Compare player statistics
- Use lineup builder
- Simulate substitutions

### Database Features

- Relational schema design using SQL Server
- Player, team, roster, season, match, and match statistics tables
- Global player leaderboard using `DENSE_RANK()`
- Role-based ranking using `DENSE_RANK() OVER (PARTITION BY role)`
- SQL trigger to prevent a player from joining multiple teams in the same season
- CHECK constraint to prevent the same team from being both Team A and Team B in a match

---

## 3. Technology Stack

### Frontend

- React
- Vite
- TypeScript
- TanStack Router
- Tailwind CSS
- Recharts
- Lucide React

### Backend

- FastAPI
- Python
- pyodbc
- Pydantic

### Database

- Microsoft SQL Server
- SQL Server Management Studio / Azure Data Studio

### DevOps

- Docker
- Docker Compose

---

## 4. Project Structure

```txt
esports_analytics_system/
│
├── frontend/
│   ├── src/
│   │   ├── routes/
│   │   ├── components/
│   │   ├── data/
│   │   └── lib/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── mongo_database.py
│   │   └── routes/
│   │       ├── players.py
│   │       ├── teams.py
│   │       ├── seasons.py
│   │       ├── rosters.py
│   │       ├── matches.py
│   │       └── leaderboard.py
│   │       └── mongo_match_logs.py
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── requirements.txt
│
├── database/
│   ├── 01_schema.sql
│   ├── 02_insert_data.sql
│   ├── 03_leaderboard_dense_rank.sql
│   ├── 04_trigger_roster_validation.sql
│   └── 05_role_based_dense_rank.sql
│
└── README.md