from dao.dao import BaseDAO
from models.users.model import Users


class UserDAO(BaseDAO):
    try:
        model = Users
    except Exception as e:
        print(e)