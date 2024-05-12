from fastapi import Depends, Request, HTTPException, status, Header
from jose import ExpiredSignatureError, JWTError, jwt

from backend.app.exceptions import IncorrectEmailOrPasswordException, TokenExpiredException, TokenAbsentException
from backend.app.config import AuthJWT
from typing import Optional
import logging
logger = logging.getLogger(__name__)


from backend.app.models.users.security import UserDAO


def get_token(request: Request, authorization: Optional[str] = Header(None)):
    token = request.cookies.get("token_access")
    if not token and authorization:
        token_type, _, token_value = authorization.partition(' ')
        if token_type.lower() == 'bearer' and token_value:
            token = token_value
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Вы не авторизованы")
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
        logger.error(f"JWT token does not contain a user ID: {token}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User ID missing from token")
    user = await UserDAO.find_one_or_none(id=int(user_id))
    if not user:
        raise IncorrectEmailOrPasswordException

    return user



