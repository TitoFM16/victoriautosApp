import httpx
from fastapi import HTTPException, status

from victoriautos_backend.core.config import settings


async def verify_recaptcha_token(token: str | None, remote_ip: str | None = None) -> None:
    """Verify a reCAPTCHA v2 token against Google's siteverify endpoint.

    Ported from middleware/captchaMiddleware.js. Raises HTTPException(400) on any
    failure (missing token, Google rejects it, or the request itself fails).
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="reCAPTCHA verification failed. Please try again.",
        )

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                settings.recaptcha_verify_url,
                data={
                    "secret": settings.recaptcha_secret_key,
                    "response": token,
                    "remoteip": remote_ip,
                },
            )
        payload = response.json()
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="reCAPTCHA verification failed."
        ) from exc

    if not payload.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="reCAPTCHA verification failed."
        )
