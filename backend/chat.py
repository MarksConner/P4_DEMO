import json
from fastapi import APIRouter
from pydantic import BaseModel

from backend.llm_agent import ask_llm
from backend.mapbox import get_directions
from backend.schedule import Schedule
from backend.errors import ConflictError
from app.services.calendar_service import get_calendar_context


router = APIRouter()

schedule = Schedule()  #one global scheduler for now


class UserMessage(BaseModel):
    message: str
    location: str | None = None  #user's starting location


@router.post("")
def chat(data: UserMessage):
    #Giving the agent more context PREFERENCES SHOULD BE IMPORTED, THIS IS TEMPORARY
    calendar_context = {
        "existing_events": [ev.to_dict() for ev in schedule.events],
        "preferences": {
            "work_hours": {
                "start": "09:00",
                "end": "17:00",
                "days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
            },
            "no_late_meetings_after": "20:00"
        }
    }

    #ask the LLM
    llm_output = ask_llm(data.message, calendar_context=calendar_context)
    
    if not llm_output:
        return {"error": "LLM returned an empty response"}

    #convert LLM output to dict
    try:
        info = json.loads(llm_output)
    except Exception as e:
        return {"error": f"Invalid JSON from LLM: {e}", "raw": llm_output}

    intent = info.get("intent", "unknown")


    #handle add event

    if intent == "add_event":
        title = info.get("title", "Untitled Event")
        start = info.get("datetime")
        location = info.get("location")
        duration = int(info.get("duration_minutes", 60))
        flexible = info.get("flexible", False)

        #If model didn't give a concrete time, try window-based scheduling
        if start is None:
            earliest = info.get("earliest_start")
            latest = info.get("latest_end")

            if earliest and latest:
                slot = schedule.find_slot(earliest, latest, duration)
                if slot is None:
                    return {"Error": "No available time in that window."}
                else:
                    start_dt = slot
            else:
                return {"Error": "Event datetime missing and no time window provided"}
        else:
            start_dt = Schedule.parse_datetime(start)

        #compute travel time if starting location is provided
        travel_minutes = 0
        if data.location and location:
            travel = get_directions(data.location, location)
            travel_minutes = int(travel["routes"][0]["duration"] / 60)

        #add the event to the scheduler
        try:
            placed_event = schedule.add_event(
                name=title,
                start=start_dt,
                duration_minutes=duration,
                location=location,
                flexible=flexible,
                travel_time_min=travel_minutes
            )
        except ConflictError as e:
            return {"error": str(e)}

        return {
            "response": f"Event '{title}' scheduled!",
            "event": placed_event.to_dict(),
            "all_events": [ev.to_dict() for ev in schedule.events]
        }


    #handle traffic info

    elif intent == "traffic_info":
        if not data.location or not info.get("location"):
            return {"error": "Missing starting location or destination."}

        travel = get_directions(data.location, info["location"])
        eta = travel['routes'][0]['duration'] / 60
        return {
            "response": f"Traffic to {info['location']} is {eta:.1f} minutes."
        }

    #handle simple chatting
    elif intent == "chat":
        return {
            "response": info.get("response", "Hello! How can I help you?")
        }


    else:
        return {"response": "I didn't understand that, can you rephrase?"}