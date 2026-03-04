import backend.mapbox as mapbox


class DummyResponse:
    def __init__(self, payload):
        self._payload = payload
        self._raised = False

    def json(self):
        return self._payload

    def raise_for_status(self):
        return None


def test_get_directions_mocks_requests(monkeypatch):
    def fake_get(url, timeout=20):
        assert "directions" in url
        return DummyResponse({"routes": [{"duration": 600.0}]})

    monkeypatch.setattr(mapbox.requests, "get", fake_get)
    monkeypatch.setattr(mapbox, "MAPBOX_TOKEN", "fake-token")

    data = mapbox.get_directions("0,0", "1,1")
    assert data["routes"][0]["duration"] == 600.0


def test_geocode_mocks_requests(monkeypatch):
    def fake_get(url, timeout=20):
        assert "geocoding" in url
        return DummyResponse({"features": [{"place_name": "Reno"}]})

    monkeypatch.setattr(mapbox.requests, "get", fake_get)
    monkeypatch.setattr(mapbox, "MAPBOX_TOKEN", "fake-token")

    data = mapbox.geocode("Reno")
    assert data["features"][0]["place_name"] == "Reno"