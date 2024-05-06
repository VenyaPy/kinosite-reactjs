from pydantic import BaseModel, EmailStr, Field, field_validator
from fastapi.security import HTTPBasic


class SUserAuth(BaseModel):
    username: str = Field(..., min_length=3, max_length=25)
    password: str = Field(...)


class SUserReg(SUserAuth):
    email: EmailStr


class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str


class NewImageRequest(BaseModel):
    new_image: str
