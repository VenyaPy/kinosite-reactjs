from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File

from backend.app.exceptions import UserNotAuth, IncorrectPassword, PasswordError
from backend.app.models.users.model import Users
from backend.app.models.users.dao import UserDAO
from backend.app.models.users.dependencies import get_current_user
from backend.app.models.users.schemas import PasswordChangeRequest
from backend.app.models.users.security import verify_password, get_password_hash
from backend.app.tasks.tasks import process_pic

import uuid
import aiofiles


router_user = APIRouter(
    prefix="/users",
    tags=["Пользователи"],
)


@router_user.get("/profile",
                 summary="Получить данные о себе")
async def get_user_me(
        current_user: Users = Depends(get_current_user)
):
    return current_user


@router_user.post("/upload-photo", summary="Загрузить/обновить фото")
async def upload_user_photo(
    current_user: Users = Depends(get_current_user),
    file: UploadFile = File(...)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )

    file_extension = file.filename.split(".")[-1]
    if file_extension not in ("jpg", "jpeg", "png"):
        raise HTTPException(status_code=400, detail="Invalid file extension")

    file_name = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"app/models/images/save/{file_name}"

    async with aiofiles.open(file_path, 'wb') as out_file:
        while content := await file.read(1024):
            await out_file.write(content)

    await file.seek(0)

    update_result = await UserDAO.update(id=current_user.id, image=file_name)
    if update_result == 0:
        raise HTTPException(status_code=404, detail="Ошибка обновления данных пользователя")

    process_pic.delay(path=file_path)

    return {"message": "Фотография успешно обновлена"}


@router_user.patch("/password",
                   summary="Смена пароля")
async def change_password(
        request: PasswordChangeRequest,
        current_user: Users = Depends(get_current_user)
):
    if not current_user:
        raise UserNotAuth

    if not verify_password(request.old_password, current_user.hashed_password):
        raise IncorrectPassword

    new_password_hash = get_password_hash(request.new_password)

    change = await UserDAO.update(current_user.id, hashed_password=new_password_hash)

    if change is None:
        raise PasswordError

    return current_user
