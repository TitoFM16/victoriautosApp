-- Runs once when the postgres container's data volume is first initialized.
-- Creates the test database alongside the main app database (POSTGRES_DB),
-- so `uv run pytest` has somewhere to run against without extra setup.
CREATE DATABASE victoriautos_test;
