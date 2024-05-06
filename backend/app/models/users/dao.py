from backend.app.dao.dao import BaseDAO
from backend.app.models.users.model import Users


class UserDAO(BaseDAO):
    try:
        model = Users
    except Exception as e:
        print(e)