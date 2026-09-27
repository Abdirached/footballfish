import math
from collections import defaultdict

COLS = "ABCDEFGHIJKL"
GRID_COLS = 12
GRID_ROWS = 8


def _to_grid(location):
    if not location:
        return None
    col_idx = min(int((location.x / 120) * GRID_COLS), GRID_COLS - 1)
    row_idx = min(int((location.y / 80) * GRID_ROWS), GRID_ROWS - 1)
    return col_idx, row_idx


def _tag(col, row):
    return f"{COLS[col]}{8 - row}"


def _players_in_zone(freeze_frame, team_name, match_info, event):
    home_positions = []
    away_positions = []
    for ff in freeze_frame:
        g = _to_grid(ff.location)
        if not g:
            continue
        if ff.teammate:
            home_positions.append(g)
        else:
            away_positions.append(g)
    return home_positions, away_positions


def _dist(c1, c2):
    return math.sqrt((c1[1] - c2[1]) ** 2 + (c1[0] - c2[0]) ** 2)


def analyze_superiority(events, match_info):
    home_name = match_info.home_team

    moments = []
    triangle_counts = {"home": 0, "away": 0}

    home_player_events = defaultdict(list)
    away_player_events = defaultdict(list)

    for idx, e in enumerate(events):
        if e.freeze_frame:
            home_in_zone = 0
            away_in_zone = 0
            for ff in e.freeze_frame:
                if ff.keeper:
                    continue
                g = _to_grid(ff.location)
                if not g:
                    continue
                if ff.teammate:
                    home_in_zone += 1
                else:
                    away_in_zone += 1

            if home_in_zone > 0 or away_in_zone > 0:
                diff = home_in_zone - away_in_zone
                if e.team_name != home_name:
                    diff = -diff

                if abs(diff) >= 2:
                    g = _to_grid(e.location) if e.location else None
                    zone = _tag(g[0], g[1]) if g else "?"
                    advantage = "HOME" if diff > 0 else "AWAY"

                    moments.append({
                        "event_idx": idx,
                        "minute": e.minute,
                        "zone": zone,
                        "home_players": home_in_zone,
                        "away_players": away_in_zone,
                        "advantage": advantage,
                        "diff": abs(diff),
                    })

        if e.player and e.location:
            g = _to_grid(e.location)
            if g:
                key = (g[0], g[1])
                if e.team_name == home_name:
                    home_player_events[e.player.name].append(key)
                else:
                    away_player_events[e.player.name].append(key)

    triangle_counts["home"] = _count_triangles(home_player_events)
    triangle_counts["away"] = _count_triangles(away_player_events)

    avg_home = 0
    avg_away = 0
    if moments:
        avg_home = round(sum(m["home_players"] for m in moments) / len(moments), 1)
        avg_away = round(sum(m["away_players"] for m in moments) / len(moments), 1)

    return {
        "moments": moments[:50],
        "triangles": triangle_counts,
        "avg_superiority": {"home": avg_home, "away": avg_away},
        "total_superiority_moments": len(moments),
    }


def _count_triangles(player_events):
    if len(player_events) < 3:
        return 0

    avg_positions = {}
    for pname, locs in player_events.items():
        if not locs:
            continue
        avg_x = sum(l[0] for l in locs) / len(locs)
        avg_y = sum(l[1] for l in locs) / len(locs)
        avg_positions[pname] = (avg_x, avg_y)

    if len(avg_positions) < 3:
        return 0

    players_list = list(avg_positions.values())
    triangles = 0
    for i in range(len(players_list)):
        for j in range(i + 1, len(players_list)):
            for k in range(j + 1, len(players_list)):
                d1 = _dist(players_list[i], players_list[j])
                d2 = _dist(players_list[j], players_list[k])
                d3 = _dist(players_list[i], players_list[k])
                max_side = max(d1, d2, d3)
                if max_side <= 5:
                    triangles += 1

    return triangles
