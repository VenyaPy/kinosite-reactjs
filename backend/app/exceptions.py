from fastapi import HTTPException, status


class FilmsException(HTTPException):
    status_code = 500
    detail = ""

    def __init__(self):
        super().__init__(status_code=self.status_code, detail=self.detail)


class UserAlreadyExistsException(FilmsException):
    status_code = status.HTTP_409_CONFLICT
    detail = "Пользователь уже существует"


class UserNotAuth(FilmsException):
    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Вы не авторизованы"


class IncorrectEmailOrPasswordException(FilmsException):
    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Неверная почта или пароль"


class TokenExpiredException(FilmsException):
    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Срок действия токена истек"


class PasswordError(FilmsException):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
    detail = "Произошла ошибка при обновлении пароля"


class TokenAbsentException(FilmsException):
    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Токен отсутствует"


class IncorrectPasswordOrLogin(FilmsException):
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Неверный пароль или логин"


class OnlyForAdmins(FilmsException):
    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Вы не администратор"


class IncorrectTokenFormatException(FilmsException):
    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Неверный формат токена"


class IncorrectPassword:
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Неверный пароль"