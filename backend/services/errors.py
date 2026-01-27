from __future__ import annotations
from dataclasses import dataclass
from typing import List
from .event import Event

@dataclass
class ConflictError(Exception):
    new_event: Event
    conflicts: List[Event]

    # I generated this format from AI since I am unfamiliar with the OpenAI API for errors
    def __str__(self) -> str:
        conflicts_str = ", ".join(
            f"{e.name}({e.start.isoformat()}–{e.end.isoformat()})"
            for e in self.conflicts
        )
        return f"Schedule conflict for '{self.new_event.name}': {conflicts_str}"
