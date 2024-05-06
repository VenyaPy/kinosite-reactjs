from fastapi.testclient import TestClient
from backend.app.models.section.router import movies_section


client = TestClient(movies_section)