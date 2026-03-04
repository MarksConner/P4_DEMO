from datetime import datetime, timedelta
from backend.time_utils import overlaps, event_overlaps, is_free, free_slots
from backend.event import Event


def test_overlaps_true_and_false():
    a1 = datetime(2026, 3, 4, 10, 0)
    a2 = datetime(2026, 3, 4, 11, 0)
    b1 = datetime(2026, 3, 4, 10, 30)
    b2 = datetime(2026, 3, 4, 10, 45)
    c1 = datetime(2026, 3, 4, 11, 0)
    c2 = datetime(2026, 3, 4, 12, 0)

    assert overlaps(a1, a2, b1, b2) is True
    # touching at the boundary is NOT overlap in your logic
    assert overlaps(a1, a2, c1, c2) is False


def test_event_overlaps():
    e1 = Event("1", "A", datetime(2026, 3, 4, 10, 0), datetime(2026, 3, 4, 11, 0))
    e2 = Event("2", "B", datetime(2026, 3, 4, 10, 59), datetime(2026, 3, 4, 12, 0))
    e3 = Event("3", "C", datetime(2026, 3, 4, 11, 0), datetime(2026, 3, 4, 12, 0))

    assert event_overlaps(e1, e2) is True
    assert event_overlaps(e1, e3) is False


def test_is_free():
    events = [
        Event("1", "Busy", datetime(2026, 3, 4, 10, 0), datetime(2026, 3, 4, 11, 0))
    ]
    assert is_free(datetime(2026, 3, 4, 9, 0), datetime(2026, 3, 4, 10, 0), events) is True
    assert is_free(datetime(2026, 3, 4, 10, 30), datetime(2026, 3, 4, 10, 45), events) is False


def test_free_slots_returns_expected_windows():
    events = [
        Event("1", "Busy", datetime(2026, 3, 4, 10, 0), datetime(2026, 3, 4, 10, 30))
    ]
    window_start = datetime(2026, 3, 4, 9, 0)
    window_end = datetime(2026, 3, 4, 11, 0)
    duration = timedelta(minutes=30)

    slots = free_slots(events, window_start, window_end, duration, step=timedelta(minutes=30))
    # step=30 gives candidate starts at 9:00, 9:30, 10:00, 10:30
    # 10:00-10:30 is blocked, others should be free
    slot_starts = [s[0] for s in slots]

    assert datetime(2026, 3, 4, 9, 0) in slot_starts
    assert datetime(2026, 3, 4, 9, 30) in slot_starts
    assert datetime(2026, 3, 4, 10, 0) not in slot_starts
    assert datetime(2026, 3, 4, 10, 30) in slot_starts