# Peptide & Supplement Protocol Manager - Backend

FastAPI backend scaffold with Supabase integration.

## Quickstart

1. Create a virtual environment (optional but recommended)
```bash
python3.11 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies
```bash
pip install -e .[dev]
```

3. Configure environment
- Copy `env.example` to `.env` and fill values.

4. Run the server
```bash
uvicorn app.main:app --reload
```

5. Open docs
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure
```
backend/
  app/
    api/
      v1/
        routes/
          health.py
    core/
      config.py
    models/
    schemas/
      health.py
    services/
      supabase_client.py
    main.py
  pyproject.toml
  README.md
  env.example
```

## Notes
- Supabase client is optional; `health` reports if configured.
- CORS is configured via `BACKEND_CORS_ORIGINS` in `.env`.
