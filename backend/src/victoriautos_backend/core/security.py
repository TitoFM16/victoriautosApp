import hashlib
import hmac
import re
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from pwdlib import PasswordHash

from victoriautos_backend.core.config import settings

password_hasher = PasswordHash.recommended()
LEGACY_PASSWORD_PREFIX = "legacy-pbkdf2-sha256$"


def legacy_password_hash(salt: str, digest: str) -> str:
    """Encode passport-local-mongoose 8.0.0 defaults, rejecting incomplete exports."""
    if not re.fullmatch(r"[0-9a-fA-F]{64}", salt) or not re.fullmatch(r"[0-9a-fA-F]{1024}", digest):
        raise ValueError("Invalid legacy password salt/hash; export raw MongoDB users")
    return f"{LEGACY_PASSWORD_PREFIX}25000${salt}${digest}"


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    if password_hash.startswith(LEGACY_PASSWORD_PREFIX):
        try:
            _, iterations, salt, digest = password_hash.split("$")
            if iterations != "25000":
                return False
            legacy_password_hash(salt, digest)
        except ValueError:
            return False
        # The plugin passes the hex salt STRING to Node crypto.pbkdf2, not decoded bytes.
        derived = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 25000, 512)
        return hmac.compare_digest(derived, bytes.fromhex(digest))
    return password_hasher.verify(password, password_hash)


class InvalidTokenError(Exception):
    pass


def create_access_token(user_id: uuid.UUID) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(seconds=settings.access_token_expire_seconds),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError as exc:
        raise InvalidTokenError(str(exc)) from exc
