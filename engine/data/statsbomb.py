import json
import requests
from collections import defaultdict
from .base import DataSource
from .types import (
    MatchEvent, MatchInfo, Player, Position, FreezeFramePlayer,
)

GITHUB_RAW = "https://raw.githubusercontent.com/statsbomb/open-data/master/data"

STATSBOMB_COMPETITIONS_CACHE = None
STATSBOMB_MATCHES_CACHE = {}


class StatsBomb(DataSource):
    def get_match_info(self, match_id: str) -> MatchInfo:
        mi = MatchInfo(id=match_id, home_team="Home", away_team="Away")

        try:
            url = f"{GITHUB_RAW}/lineups/{match_id}.json"
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                lineups = resp.json()
                for team in lineups:
                    name = team.get("team_name", "")
                    if mi.home_team == "Home" or mi.home_team == name:
                        mi.home_team = name
                    elif name != mi.home_team:
                        mi.away_team = name
        except Exception:
            pass

        try:
            match_data = self._find_match(match_id)
            if match_data:
                home = match_data.get("home_team", {})
                away = match_data.get("away_team", {})
                comp = match_data.get("competition", {})
                mi.home_team = home.get("home_team_name") or home.get("team_name") or mi.home_team
                mi.away_team = away.get("away_team_name") or away.get("team_name") or mi.away_team
                mi.competition = comp.get("competition_name", "")
                mi.season = match_data.get("season", {}).get("season_name", "")
                mi.date = match_data.get("match_date", "")
        except Exception:
            pass

        return mi

    def get_events(self, match_id: str) -> list[MatchEvent]:
        url = f"{GITHUB_RAW}/events/{match_id}.json"
        resp = requests.get(url, timeout=15)
        raw_events = resp.json()

        three_sixty = self._load_360(match_id)
        ff_map = defaultdict(list)
        if three_sixty:
            for entry in three_sixty:
                ff_map[entry.get("event_uuid", "")] = [
                    FreezeFramePlayer(
                        location=Position(f["location"][0], f["location"][1]),
                        teammate=f.get("teammate", False),
                        actor=f.get("actor", False),
                        keeper=f.get("keeper", False),
                    )
                    for f in entry.get("freeze_frame", [])
                    if f.get("location")
                ]

        events = []
        team_names = {}
        for ev in raw_events:
            team_id = ev.get("team", {}).get("id", 0)
            team_name = ev.get("team", {}).get("name", "")
            if team_id:
                team_names[team_id] = team_name

            pid = ev.get("player", {}).get("id")
            player = None
            if pid:
                player = Player(
                    id=pid,
                    name=ev.get("player", {}).get("name", ""),
                    team_id=team_id,
                    team_name=team_name,
                    position=ev.get("position", {}).get("name") if ev.get("position") else None,
                )

            loc_data = ev.get("location")
            location = Position(loc_data[0], loc_data[1]) if loc_data and len(loc_data) >= 2 else None

            end_loc_data = ev.get("pass", {}).get("end_location") or ev.get("carry", {}).get("end_location")
            end_location = Position(end_loc_data[0], end_loc_data[1]) if end_loc_data and len(end_loc_data) >= 2 else None

            event_uuid = str(ev.get("id", ""))
            freeze = ff_map.get(event_uuid, [])

            if not freeze:
                shot_ff = ev.get("shot", {}).get("freeze_frame", [])
                if shot_ff:
                    freeze = [
                        FreezeFramePlayer(
                            location=Position(f["location"][0], f["location"][1]),
                            teammate=f.get("teammate", False),
                            actor=f.get("actor", False),
                            keeper=f.get("keeper", False),
                        )
                        for f in shot_ff if f.get("location")
                    ]

            events.append(MatchEvent(
                id=event_uuid,
                minute=ev.get("minute", 0),
                second=ev.get("second", 0),
                type=ev.get("type", {}).get("name", "Unknown"),
                location=location,
                team_id=team_id,
                team_name=team_name,
                player=player,
                end_location=end_location,
                freeze_frame=freeze,
                raw=ev,
            ))

        return events

    def get_matches(self, competition_id: str = "", season_id: str = "") -> list[MatchInfo]:
        if not competition_id:
            comps = self.list_competitions()
            if comps:
                c = comps[0]
                competition_id = str(c["competition_id"])
                season_id = str(c["season_id"])

        path = f"{competition_id}/{season_id}.json"
        url = f"{GITHUB_RAW}/matches/{path}"
        try:
            resp = requests.get(url, timeout=10)
            if resp.status_code != 200:
                return []
            data = resp.json()
            return [self._to_match_info(m) for m in data]
        except Exception:
            return []

    def list_competitions(self) -> list[dict]:
        global STATSBOMB_COMPETITIONS_CACHE
        if STATSBOMB_COMPETITIONS_CACHE is not None:
            return STATSBOMB_COMPETITIONS_CACHE

        url = f"{GITHUB_RAW}/competitions.json"
        try:
            resp = requests.get(url, timeout=10)
            if resp.status_code != 200:
                return []
            data = resp.json()
            result = []
            for c in data:
                comp_id = c.get("competition_id")
                season_id = c.get("season_id")
                comp_name = c.get("competition_name", "")
                season_name = c.get("season_name", "")
                country = c.get("country_name", "")
                result.append({
                    "competition_id": comp_id,
                    "season_id": season_id,
                    "competition_name": comp_name,
                    "season_name": season_name,
                    "country_name": country,
                    "has_360": c.get("match_available_360", 0) == 1,
                })
            STATSBOMB_COMPETITIONS_CACHE = result
            return result
        except Exception:
            return []

    def has_360(self, match_id: str) -> bool:
        match_data = self._find_match(match_id)
        if match_data:
            status = match_data.get("match_status_360", 0)
            if status == 1:
                return True
        return self._load_360(match_id) is not None

    def _find_match(self, match_id: str):
        cache_key = f"match_meta_{match_id}"
        if cache_key in STATSBOMB_MATCHES_CACHE:
            return STATSBOMB_MATCHES_CACHE[cache_key]

        comps = self.list_competitions()

        likely = [c for c in comps if c.get("season_name", "").startswith("202")]
        others = [c for c in comps if c not in likely]
        ordered = likely + others

        for comp in ordered:
            cid = comp["competition_id"]
            sid = comp["season_id"]
            mcache_key = f"matches_{cid}_{sid}"
            if mcache_key in STATSBOMB_MATCHES_CACHE:
                matches_data = STATSBOMB_MATCHES_CACHE[mcache_key]
            else:
                try:
                    url = f"{GITHUB_RAW}/matches/{cid}/{sid}.json"
                    resp = requests.get(url, timeout=5)
                    if resp.status_code != 200:
                        continue
                    matches_data = resp.json()
                    STATSBOMB_MATCHES_CACHE[mcache_key] = matches_data
                except Exception:
                    continue
            for m in matches_data:
                if str(m.get("match_id")) == match_id:
                    STATSBOMB_MATCHES_CACHE[cache_key] = m
                    return m
        return None

    def _to_match_info(self, m: dict) -> MatchInfo:
        home = m.get("home_team", {})
        away = m.get("away_team", {})
        competition_data = m.get("competition", m)
        return MatchInfo(
            id=str(m.get("match_id", "")),
            home_team=home.get("home_team_name") or home.get("team_name", ""),
            away_team=away.get("away_team_name") or away.get("team_name", ""),
            home_team_id=home.get("home_team_id") or home.get("team_id"),
            away_team_id=away.get("away_team_id") or away.get("team_id"),
            competition=competition_data.get("competition_name", ""),
            season=competition_data.get("season_name", ""),
            date=m.get("match_date", ""),
            home_formation=home.get("formation", ""),
            away_formation=away.get("formation", ""),
        )

    def _load_360(self, match_id: str):
        url = f"{GITHUB_RAW}/three-sixty/{match_id}.json"
        try:
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                return resp.json()
        except Exception:
            pass
        return None
