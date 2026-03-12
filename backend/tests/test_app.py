from fastapi.routing import APIRoute
from backend.app import app

def test_app_has_chat_route():
    paths = {r.path for r in app.router.routes if isinstance(r, APIRoute)}
    assert "/chat" in paths