#!/usr/bin/env bash
set -e

# Esperar a Postgres
until python -c "import psycopg2, os; psycopg2.connect(os.environ['DATABASE_URL'].replace('postgresql+psycopg2','postgresql'))" 2>/dev/null; do
  echo "Esperando Postgres..."
  sleep 2
done

echo "Ejecutando migraciones..."
alembic upgrade head || alembic revision --autogenerate -m "init" && alembic upgrade head

exec "$@"