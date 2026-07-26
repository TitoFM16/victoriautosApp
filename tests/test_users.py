from httpx import AsyncClient


async def test_signup_and_login(client: AsyncClient):
    signup_response = await client.post(
        "/api/users/signup",
        json={"username": "alice", "password": "s3cret-password", "firstname": "Alice"},
    )
    assert signup_response.status_code == 201
    assert signup_response.json()["username"] == "alice"
    assert "password" not in signup_response.json()
    assert "password_hash" not in signup_response.json()

    login_response = await client.post(
        "/api/users/login", json={"username": "alice", "password": "s3cret-password"}
    )
    assert login_response.status_code == 200
    assert login_response.json()["success"] is True
    assert "token" in login_response.cookies


async def test_signup_duplicate_username_rejected(client: AsyncClient):
    payload = {"username": "bob", "password": "another-password"}
    first = await client.post("/api/users/signup", json=payload)
    assert first.status_code == 201

    second = await client.post("/api/users/signup", json=payload)
    assert second.status_code == 409


async def test_login_wrong_password_rejected(client: AsyncClient):
    await client.post("/api/users/signup", json={"username": "carol", "password": "right-password"})
    response = await client.post(
        "/api/users/login", json={"username": "carol", "password": "wrong-password"}
    )
    assert response.status_code == 401


async def test_check_auth_cookie_without_cookie(client: AsyncClient):
    response = await client.get("/api/users/check-auth-cookie")
    assert response.status_code == 200
    assert response.json() == {"authenticated": False}


async def test_check_auth_cookie_after_login(client: AsyncClient):
    await client.post(
        "/api/users/signup", json={"username": "dave", "password": "yet-another-password"}
    )
    await client.post(
        "/api/users/login", json={"username": "dave", "password": "yet-another-password"}
    )

    response = await client.get("/api/users/check-auth-cookie")
    assert response.json() == {"authenticated": True}


async def test_logout_clears_cookie(client: AsyncClient):
    await client.post("/api/users/signup", json={"username": "erin", "password": "password-123"})
    await client.post("/api/users/login", json={"username": "erin", "password": "password-123"})

    response = await client.post("/api/users/logout")
    assert response.status_code == 200
    assert "token" not in client.cookies
