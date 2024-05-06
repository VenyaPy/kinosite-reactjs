from fastapi import Depends, Request, HTTPException, status
from jose import ExpiredSignatureError, JWTError, jwt

from backend.app.exceptions import IncorrectEmailOrPasswordException, TokenExpiredException, TokenAbsentException
from backend.app.config import AuthJWT


from backend.app.models.users.security import UserDAO


def get_token(request: Request):
    token = request.cookies.get("token_access")
    if not token:
        raise HTTPException(status_code=status.HTTP_423_LOCKED, detail="Вы не авторизованы")
    return token


async def get_current_user(token: str = Depends(get_token)):
    try:
        payload = jwt.decode(token, key=AuthJWT.public_key, algorithms=AuthJWT.algorithm)
    except ExpiredSignatureError:
        raise TokenAbsentException
    except JWTError:
        raise TokenExpiredException
    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_423_LOCKED, detail="if not user_id")
    user = await UserDAO.find_one_or_none(id=int(user_id))
    if not user:
        raise IncorrectEmailOrPasswordException

    return user



