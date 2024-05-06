from backend.app.dao.dao import BaseDAO
from backend.app.models.users.model import Users


class ImageDAO(BaseDAO):
    try:
        model = Users
    except Exception as e:
        print(e)