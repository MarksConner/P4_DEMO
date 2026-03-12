from typing import Optional
from app.db import SessionLocal
from app.models.calendar import Calendar
from app.models.events  import Events
from sqlalchemy import UUID
from datetime import datetime
from sqlalchemy.orm import Session

def create_calendar(session: Session, calendar_name: str,user_id: UUID, date_start: Optional[datetime] = None, date_end:Optional[datetime] = None, icsfile: Optional[str] = None)->Calendar:
    new_calendar = Calendar(    
    calendar_name=calendar_name, 
    date_start=date_start, 
    date_end = date_end, 
    user_id = user_id,
    icsfile  = icsfile
    )
    session.add(new_calendar)
    session.commit()
    session.refresh(new_calendar)

    return new_calendar

def add_event_to_calendar(session: Session,calendar_id: UUID, event_id:UUID):
    event = session.query(Events).filter(Events.event_id == event_id).first()
    if event is None:
        raise ValueError("Event not found")
     
    event.calendar_id = calendar_id
    session.commit()
    session.refresh(event)
    return event

def remove_event_from_calendar(session: Session,calendar_id: UUID, event_id: UUID)-> bool:
        
    event = session.query(Events).filter(Events.event_id == event_id).first()
    if event is None:
        raise ValueError("Event not found")
        
    session.delete(event)
    session.commit()

#Careful! Only updates provided parameters 
def update_calendar(session: Session,calendar_id: UUID,calendar_name: str | None = None,  date_start: datetime | None = None, date_end: datetime | None = None,  icsfile: str | None = None,):
   
    calendar = (session.query(Calendar).filter(Calendar.calendar_id == calendar_id).first())

    if calendar is None:
        raise ValueError("Calendar not found")
    
    if calendar_name is not None:
        calendar.calendar_name = calendar_name
    if date_start is not None:
        calendar.date_start = date_start
    if date_end is not None:
        calendar.date_end = date_end
    if icsfile is not None:
        calendar.icsfile = icsfile

    session.commit()
    session.refresh(calendar)
    return calendar


#updat/replace calendar icsfile with new one
def update_calendar_icsfile(session: Session, calendar_id: UUID, icsfile: str)->bool:
    calendar = (session.query(Calendar).filter(Calendar.calendar_id == calendar_id).first())
    
    if calendar is not None and icsfile is not None and icsfile != "":
        calendar.icsfile = icsfile
        session.commit()
        session.refresh(calendar)
        return True
    
    return False

def get_all_events_by_calendar_id(session: Session ,calendar_id: UUID)->list[Events]:
    events = session.query(Events).filter(Events.calendar_id == calendar_id).all()
    return events

def get_event_by_calendar_id(session: Session ,calendar_id: UUID,event_id: UUID)->Events:
    event = session.query(Events).filter(Events.event_id ==event_id, Events.calendar_id == calendar_id).first()
    if event is None:
        raise ValueError("Event not found")
    return event

def get_calendars_by_user_id(session: Session, user_id: UUID) -> list[Calendar]:
    calendars = session.query(Calendar).filter(Calendar.user_id == user_id).all()
    return calendars

# This function retrieves the context of a calendar, including its events, ordered by start time.
# Basically it returns a dictionary with a list of events for the calendar, where each event is represented as a dictionary with its details (id, name, start time, end time, location). This context can be used to display the calendar and its events in the frontend.
# it is returned as a dictionary because the calendar context may include more than just the list of events in the future, such as calendar settings, user preferences, etc. By returning a dictionary, we can easily expand the context to include additional information without changing the structure of the response.
def get_calendar_context(db: Session, calendar_id: str) -> dict:
    events = (
        db.query(Events)
        .filter(Events.calendar_id == calendar_id)
        .order_by(Events.start_time.asc())
        .all()
    )

    return {"events": [ { 
        "id": str(event.event_id),
                "name": event.title,
                "start": event.start_time.isoformat(),
                "end": event.end_time.isoformat(),
                "location": event.location,
            }
            for event in events
        ]
    }