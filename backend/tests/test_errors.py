from datetime import datetime
from backend.errors import ConflictError
from backend.event import Event


def test_conflict_error_string_format():
    new_event = Event(
        id="n",
        name="New",
        start=datetime(2026, 3, 4, 10, 0),
        end=datetime(2026, 3, 4, 11, 0),
    )
    conflict1 = Event(
        id="c1",
        name="Existing1",
        start=datetime(2026, 3, 4, 10, 30),
        end=datetime(2026, 3, 4, 11, 30),
    )
    conflict2 = Event(
        id="c2",
        name="Existing2",
        start=datetime(2026, 3, 4, 9, 45),
        end=datetime(2026, 3, 4, 10, 15),
    )

    err = ConflictError(new_event=new_event, conflicts=[conflict1, conflict2])
    s = str(err)

    assert "Schedule conflict" in s
    assert "New" in s
    assert "Existing1" in s
    assert "Existing2" in s
    assert conflict1.start.isoformat() in s
    assert conflict1.end.isoformat() in s