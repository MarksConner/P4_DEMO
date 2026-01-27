from dataclasses import dataclass
from datetime import datetime

@dataclass(frozen=True)
class Event:
    id: str
    name: str
    start: datetime
    end: datetime
    location: str | None = None
    priority: int = 0            # higher = more important
    flexible: bool = False
    travel_time_min: int = 0
