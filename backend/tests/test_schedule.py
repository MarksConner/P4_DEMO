import pytest
from datetime import datetime
from backend.schedule import Schedule
from backend.errors import ConflictError


def test_parse_datetime_handles_z_suffix():
    dt = Schedule.parse_datetime("2026-03-04T10:00:00Z")
    assert dt == datetime(2026, 3, 4, 10, 0, 0)


def test_add_event_adds_and_sorts(fresh_schedule):
    s = fresh_schedule
    e2 = s.add_event(name="Second", start=datetime(2026, 3, 4, 12, 0), duration_minutes=60)
    e1 = s.add_event(name="First", start=datetime(2026, 3, 4, 10, 0), duration_minutes=60)

    assert [e.name for e in s.events] == ["First", "Second"]
    assert e1.id != e2.id


def test_add_event_conflict_raises(fresh_schedule):
    s = fresh_schedule
    s.add_event(name="A", start=datetime(2026, 3, 4, 10, 0), duration_minutes=60)

    with pytest.raises(ConflictError):
        s.add_event(name="B", start=datetime(2026, 3, 4, 10, 30), duration_minutes=30)


def test_add_event_allow_conflicts_true(fresh_schedule):
    s = fresh_schedule
    s.add_event(name="A", start=datetime(2026, 3, 4, 10, 0), duration_minutes=60)
    s.add_event(name="B", start=datetime(2026, 3, 4, 10, 30), duration_minutes=30, allow_conflicts=True)
    assert len(s.events) == 2


def test_remove_event(fresh_schedule):
    s = fresh_schedule
    e = s.add_event(name="A", start=datetime(2026, 3, 4, 10, 0), duration_minutes=60)
    assert s.remove_event(e.id) is True
    assert s.remove_event(e.id) is False


def test_move_event_updates_times_and_keeps_duration(fresh_schedule):
    s = fresh_schedule
    e = s.add_event(name="A", start=datetime(2026, 3, 4, 10, 0), duration_minutes=90)

    moved = s.move_event(e.id, datetime(2026, 3, 4, 12, 0))
    assert moved.start == datetime(2026, 3, 4, 12, 0)
    assert moved.end == datetime(2026, 3, 4, 13, 30)


def test_find_slot_returns_first_free_slot(fresh_schedule):
    s = fresh_schedule
    # busy from 10:00 to 11:00
    s.add_event(name="Busy", start=datetime(2026, 3, 4, 10, 0), duration_minutes=60)

    slot = s.find_slot("2026-03-04T09:00:00", "2026-03-04T12:00:00", 60)
    # earliest 9-10 should be free (first)
    assert slot == datetime(2026, 3, 4, 9, 0)