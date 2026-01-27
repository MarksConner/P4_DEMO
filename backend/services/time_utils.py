from __future__ import annotations
from datetime import datetime, timedelta
from typing import Iterable, List, Tuple
from .event import Event

# this function checks if two time intervals overlap (helpers for other functions)
def overlaps(start1: datetime, end1: datetime, start2: datetime, end2: datetime) -> bool:
    return start1 < end2 and start2 < end1

# this function uses the overlaps function to check if two events overlap
def event_overlaps(ev1: Event, ev2: Event) -> bool:
    return overlaps(ev1.start, ev1.end, ev2.start, ev2.end)


# this function just checks if the slot is free by iterating through all events
def is_free(start: datetime, end: datetime, events: Iterable[Event]) -> bool:
    for evnt in events:
        if overlaps(start, end, evnt.start, evnt.end):
            return False
    return True


# in this function, im returning a list of tuples represinting the start and end times of free slots
# I made the windows 15 minutes and increment by that time
def free_slots(
        events: List[Event],
        window_start: datetime,
        window_end: datetime,
        duration: timedelta,
        step: timedelta = timedelta(minutes = 15)
    ) -> List[Tuple[datetime, datetime]]:

    slots = []

    t = window_start
    while t + duration <= window_end:
        start = t
        end = t + duration
        if is_free(start, end, events):
            slots.append((start, end))
        t += step
    return slots
