from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Position:
    x: float
    y: float


@dataclass
class Player:
    id: int
    name: str
    team_id: int
    team_name: str
    position: Optional[str] = None


@dataclass
class FreezeFramePlayer:
    location: Position
    teammate: bool
    actor: bool
    keeper: bool


@dataclass
class MatchEvent:
    id: str
    minute: int
    second: int
    type: str
    location: Optional[Position]
    team_id: int
    team_name: str
    player: Optional[Player]
    related_events: list = field(default_factory=list)
    end_location: Optional[Position] = None
    freeze_frame: list[FreezeFramePlayer] = field(default_factory=list)
    raw: dict = field(default_factory=dict)


@dataclass
class MatchInfo:
    id: str
    home_team: str
    away_team: str
    home_team_id: Optional[int] = None
    away_team_id: Optional[int] = None
    competition: str = ""
    season: str = ""
    date: str = ""
    home_formation: Optional[str] = None
    away_formation: Optional[str] = None


@dataclass
class LineupPlayer:
    player_id: int
    player_name: str
    jersey_number: int
    position: Optional[str] = None
    starting: bool = True
