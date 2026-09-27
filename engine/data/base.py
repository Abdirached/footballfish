from abc import ABC, abstractmethod
from .types import MatchEvent, MatchInfo


class DataSource(ABC):
    @abstractmethod
    def get_match_info(self, match_id: str) -> MatchInfo:
        pass

    @abstractmethod
    def get_events(self, match_id: str) -> list[MatchEvent]:
        pass

    @abstractmethod
    def get_matches(self, competition_id: str = "", season_id: str = "") -> list[MatchInfo]:
        pass

    @abstractmethod
    def list_competitions(self) -> list[dict]:
        pass

    @abstractmethod
    def has_360(self, match_id: str) -> bool:
        pass
