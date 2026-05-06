# MLBB FastAPI Backend

## 1. Start SQL Server + backend

```bash
docker compose up --build
```

## 2. Create database tables and insert data

Open SQL Server Management Studio / Azure Data Studio and connect:

- Server: `localhost,1433`
- User: `sa`
- Password: `YourStrong!Passw0rd`

Run:

1. `01_schema.sql`
2. `02_insert_data_final.sql`

## 3. Test backend

- http://localhost:8000/api/health
- http://localhost:8000/docs
- http://localhost:8000/api/players
- http://localhost:8000/api/leaderboard

## 4. Frontend

Run frontend separately:

```bash
npm run dev
```

Fetch API data from `http://localhost:8000/api/...`.
