import pytest
from fastapi.testclient import TestClient

from backend.app import app
from backend.schedule import Schedule


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture()
def fresh_schedule():
    # helper schedule instance for unit tests
    return Schedule()