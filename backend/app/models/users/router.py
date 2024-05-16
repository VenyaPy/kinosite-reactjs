from fastapi import APIRouter, Response

from backend.app.exceptions import (IncorrectEmailOrPasswordException,
                                    UserAlreadyExistsException)
from backend.app.models.users.schemas import SUserReg, SUserAuth
from backend.app.models.users.dao import UserDAO
from backend.app.models.users.security import get_password_hash, authenticate_user, create_access_token


router_auth = APIRouter(
    prefix="/auth",
    tags=["Регистрация и аутентификация"],
)


@router_auth.post("/register",
                  status_code=201,
                  summary="Регистрация")
async def register_user(user_data: SUserReg):
    have_user = await UserDAO.find_one_or_none(username=user_data.username)
    if have_user:
        raise UserAlreadyExistsException
    hashed_password = get_password_hash(user_data.password)
    await UserDAO.add(username=user_data.username,
                      email=user_data.email,
                      hashed_password=hashed_password)
    return {"status": "okey"}

@router_auth.post("/login",
                  status_code=201,
                  summary="Войти в аккаунт")
async def login_user(
        response: Response,
        user_data: SUserAuth
):
    user = await authenticate_user(user_data.username, user_data.password)
    access_token = create_access_token({"sub": str(user.id)})
    response.set_cookie("token_access", access_token, httponly=True)
    return {"access_token": access_token}


@router_auth.delete("/logout",
                    status_code=201,
                    summary="Выйти из аккаунта")
async def logout_user(response: Response):
    response.delete_cookie("token_access")


