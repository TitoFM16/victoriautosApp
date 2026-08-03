#!/bin/sh
set -e

alembic upgrade head
exec uvicorn victoriautos_backend.main:app --host 0.0.0.0 --port 8000
