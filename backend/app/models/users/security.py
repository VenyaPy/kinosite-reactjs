from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext

from backend.app.exceptions import IncorrectPasswordOrLogin, OnlyForAdmins
from backend.app.config import AuthJWT

from backend.app.models.users.dao import UserDAO

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password, hash_pass) -> bool:
    return pwd_context.verify(plain_password, hash_pass)


def create_access_token(data: dict) -> str:
    try:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=90)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, key=AuthJWT.private_key, algorithm=AuthJWT.algorithm)
        return encoded_jwt
    except Exception as e:
        print(e)


async def authenticate_user(username: str, password: str):
    user = await UserDAO.find_one_or_none(username=username)
    if not (user and verify_password(password, user.hashed_password)):
        raise IncorrectPasswordOrLogin
    return user


async def authenticate_admin(username: str, password: str):
    user = await UserDAO.find_one_or_none(username=username)
    if not (user and verify_password(password, user.hashed_password)):
        raise IncorrectPasswordOrLogin

    user_status = await UserDAO.find_status(id=user.id)
    if not user_status or user_status['status'] != 'admin':
        raise OnlyForAdmins

    return user