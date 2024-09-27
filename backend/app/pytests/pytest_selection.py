from fastapi.testclient import TestClient
from models.section.router import movies_section


client = TestClient(movies_section)