from slowapi import Limiter
from slowapi.util import get_remote_address

# In-memory limiter keyed by client IP. Good enough for a single-worker
# deployment; if this ever runs behind multiple uvicorn workers or replicas,
# each process tracks its own counters, so the effective limit multiplies by
# worker count. Move to a Redis storage backend (slowapi supports one via the
# `storage_uri` argument) if that becomes a problem.
limiter = Limiter(key_func=get_remote_address)
