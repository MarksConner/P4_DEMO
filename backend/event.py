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

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "start": self.start.isoformat(),
            "end": self.end.isoformat(),
            "location": self.location,
            "priority": self.priority,
            "flexible": self.flexible,
            "travel_time_min": self.travel_time_min,
        }