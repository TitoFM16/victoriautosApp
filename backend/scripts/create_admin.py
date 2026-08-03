"""Create an admin user, or promote an existing user to admin.

There's no signup flow that grants admin - `POST /api/users/signup` always
creates a regular (non-admin) user - so this script is how you bootstrap the
first admin account (or fix one that lost its flag).

Usage:
    uv run python scripts/create_admin.py --username admin
    uv run python scripts/create_admin.py --username admin --password "..."   # non-interactive

If --password is omitted and the user doesn't already exist, you'll be
prompted for one (input hidden). If the user already exists, the password is
ignored and the account is simply promoted to admin.
"""

import argparse
import asyncio
import getpass

from sqlalchemy import select

from victoriautos_backend.core.security import hash_password
from victoriautos_backend.db.session import AsyncSessionLocal
from victoriautos_backend.models.user import User


async def create_or_promote_admin(username: str, password: str | None) -> None:
    async with AsyncSessionLocal() as db:
        user = await db.scalar(select(User).where(User.username == username))

        if user is not None:
            if user.admin:
                print(f"'{username}' is already an admin.")
                return
            user.admin = True
            await db.commit()
            print(f"Promoted existing user '{username}' to admin.")
            return

        if password is None:
            password = getpass.getpass("Password: ")
            confirm = getpass.getpass("Confirm password: ")
            if password != confirm:
                raise SystemExit("Passwords didn't match.")

        user = User(username=username, password_hash=hash_password(password), admin=True)
        db.add(user)
        await db.commit()
        print(f"Created admin user '{username}'.")


def main() -> None:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--username", required=True)
    parser.add_argument(
        "--password", help="Only used when creating a new user. Prompted for if omitted."
    )
    args = parser.parse_args()

    asyncio.run(create_or_promote_admin(args.username, args.password))


if __name__ == "__main__":
    main()
