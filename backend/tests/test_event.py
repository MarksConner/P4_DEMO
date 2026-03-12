from datetime import datetime
from backend.event import Event


def test_event_to_dict_isoformat():
    start = datetime(2026, 3, 4, 10, 0, 0)
    end = datetime(2026, 3, 4, 11, 0, 0)

    ev = Event(
        id="abc",
        name="Test",
        start=start,
        end=end,
        location="Somewhere",
        priority=2,
        flexible=True,
        travel_time_min=12,
    )

    d = ev.to_dict()
    assert d["id"] == "abc"
    assert d["name"] == "Test"
    assert d["start"] == start.isoformat()
    assert d["end"] == end.isoformat()
    assert d["location"] == "Somewhere"
    assert d["priority"] == 2
    assert d["flexible"] is True
    assert d["travel_time_min"] == 12