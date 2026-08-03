# syntax=docker/dockerfile:1
FROM python:3.13-slim-bookworm AS builder

# Copy the uv binary from its official image rather than using it as the base -
# keeps this Dockerfile on the standard python image while still getting uv.
COPY --from=ghcr.io/astral-sh/uv:0.8.17 /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never

WORKDIR /app

# Install dependencies first (cached separately from app code changes).
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-install-project --no-dev

COPY . .
RUN uv sync --locked --no-dev


FROM python:3.13-slim-bookworm AS runtime

RUN groupadd --gid 1000 app \
    && useradd --uid 1000 --gid app --create-home --shell /usr/sbin/nologin app

WORKDIR /app
COPY --from=builder --chown=app:app /app /app

ENV PATH="/app/.venv/bin:$PATH"

USER app

EXPOSE 8000

# Runs `alembic upgrade head` before starting the server. Fine for a single
# instance/simple deployment; if you ever run multiple replicas of this image,
# move the migration to a separate one-off step instead so they don't race.
ENTRYPOINT ["./docker-entrypoint.sh"]
