from __future__ import annotations
from dataclasses import replace
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import uuid4

from .event import Event
from .errors import ConflictError
from .time_utils import event_overlaps

class Schedule:
    def __init__ (self):
        self._events: list[Event] = []

    @property
    def events(self) -> list[Event]:
        return list(self._events)
    
    def get(self, event_id: str) -> Event:
        for evnt in self._events:
            if evnt.id == event_id:
                return evnt
        raise KeyError(f"No event with id {event_id} found.")

    def add_event(
        self,
        name: str,
        start: datetime,
        duration_minutes: int,
        location: str | None = None,
        priority: int = 0,
        flexible: bool = False,
        travel_time_min: int = 0,
        allow_conflicts: bool = False,
    ) -> Event:
        # here I am just setting the end time based on the duration
        end = start + timedelta(minutes = duration_minutes)
        
        # here I am creating a new event and setting all it's perameters appropriately
        new_event = Event(
            id=str(uuid4()),
            name=name,
            start=start,
            end=end,
            location=location,
            priority=priority,
            flexible=flexible,
            travel_time_min=travel_time_min,
        )
        # I am checking for conflicts because almost all events should not overlap
        # I raise an error if it conflicts unless allow_conflicts is set to true
        if not allow_conflicts:
            conflicts = [evnt for evnt in self._events if event_overlaps(evnt, new_event)]
            if conflicts:
                raise ConflictError(new_event = new_event, conflicts = conflicts)
            
        # I am now adding the event to the list of ._events and sorting it based on start time
        self._events.append(new_event)
        self._events.sort(key = lambda evnt: evnt.start)
        return new_event
    
    # removing is simple, I get the count of events before and after to ensure one was removed
    def remove_event(self, event_id: str) -> bool:
        before_count = len(self._events)
        # here I am using a list comprehension to remove the appropriate event
        self._events = [evnt for evnt in self._events if evnt.id != event_id]
        return len(self._events) < before_count
    
    
    # moving an event is similar to adding, but I have to keep the same duration
    def move_event(self, event_id: str, new_start: datetime, allow_conflicts: bool = False) -> Event:
        evnt = self.get(event_id)
        duration = evnt.end - evnt.start
        end = new_start + duration
        # the replace function from dataclasses is useful here to create a new event with the updated times
        moved = replace(evnt, start = new_start, end = end)

        if not allow_conflicts:
            for other in self._events:
                if other.id == event_id:
                    continue
                if event_overlaps(other, moved):
                    raise ConflictError(new_event = moved, conflicts = [other])
        
        self._events = [evnt if evnt.id != event_id else moved for evnt in self._events]
        self._events.sort(key = lambda evnt: evnt.start)

        return moved

            


    # Old code below for reference




    #     start_dt = datetime.fromisoformat(start)
    #     end_dt = start_dt + timedelta(minutes=duration_minutes)



    #     new_event = Event(eventName, start_dt, end_dt, location, flexible)

    #     #apply travel buffer BEFORE it
    #     if travel_time > 0:
    #         new_event.apply_travel(travel_time)

    #     #try inserting
    #     self.resolve_conflicts(new_event)
    #     self.events.append(new_event)
    #     self.events.sort(key=lambda e: e.start)

    #     return new_event.to_dict()

    # def resolve_conflicts(self, new_event):
    #     for ev in self.events:
    #         if not self.overlaps(ev, new_event):
    #             continue

    #         if ev.flexible:
    #             #move flexible event 30 minutes after new event
    #             shift = (new_event.end - ev.start) + timedelta(minutes=30)
    #             ev.start += shift
    #             ev.end += shift
    #         else:
    #             #hard conflict with non-flexible event: move new_event instead
    #             shift = (ev.end - new_event.start) + timedelta(minutes=15)
    #             new_event.start += shift
    #             new_event.end += shift

    # def overlaps(self, ev1, ev2):
    #     return not (ev1.end <= ev2.start or ev2.end <= ev1.start)

    # def get_day(self, date_str):
    #     day_start = datetime.fromisoformat(date_str)
    #     result = []
    #     for ev in self.events:
    #         if ev.start.date() == day_start.date():
    #             result.append(ev.to_dict())
    #     return result

    # def get_month(self, year, month):
    #     output = []
    #     for ev in self.events:
    #         if ev.start.year == year and ev.start.month == month:
    #             output.append(ev.to_dict())
    #     return output

    # #Helper that searches for first free fitting slot
    # def find_slot(self, earliest_start_iso, latest_end_iso, duration_minutes):
    #     earliest = datetime.fromisoformat(earliest_start_iso)
    #     latest = datetime.fromisoformat(latest_end_iso)
    #     duration = timedelta(minutes=duration_minutes)

    #     #Only considering that day/window
    #     candidates = [e for e in self.events if e.start.date() == earliest.date()]
    #     candidates.sort(key=lambda e: e.start)

    #     #Start with earliest start as the current start
    #     current_start = earliest

    #     for ev in candidates:
    #         #If event is before current start, skip
    #         if ev.end <=current_start:
    #             continue
            
    #         #If there is a gap between current start and ev's start, check for fit
    #         if ev.start - current_start >= duration:
    #             #Gap found
    #             if current_start + duration <= latest:
    #                 return current_start

    #             #Move current start to after this event has already ended
    #             if ev.end > current_start:
    #                 current_start = ev.end

    #     #Check after last event in candidates
    #     if latest - current_start >= duration:
    #         return current_start
    #     return None
