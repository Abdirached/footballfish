from collections import defaultdict

COLS = "ABCDEFGHIJKL"
GRID_COLS = 12
GRID_ROWS = 8
HALFSPACE_COLS = {1, 2, 9, 10}
WING_COLS = {0, 11}
CENTRAL_COLS = {3, 4, 5, 6, 7, 8}
ZONE_14 = {"I4", "I5", "J4", "J5"}


def _to_grid(location):
    if not location:
        return None
    col_idx = min(int((location.x / 120) * GRID_COLS), GRID_COLS - 1)
    row_idx = min(int((location.y / 80) * GRID_ROWS), GRID_ROWS - 1)
    return col_idx, row_idx


def _tag(col, row):
    return f"{COLS[col]}{8 - row}"


def _col_phase(col):
    if col <= 3:
        return "buildup"
    if col <= 7:
        return "midfield"
    return "attacking"


def _row_band(row):
    if row == 0 or row == 7:
        return "wing"
    if row == 1 or row == 6:
        return "halfspace"
    return "central"


def analyze_zones(events, match_info):
    home_name = match_info.home_team
    away_name = match_info.away_team

    home_zones = _team_zones(events, home_name)
    away_zones = _team_zones(events, away_name)

    zone14_home = 0
    zone14_away = 0
    for e in events:
        if e.location:
            g = _to_grid(e.location)
            if g:
                tag = _tag(g[0], g[1])
                if tag in ZONE_14:
                    if e.team_name == home_name:
                        zone14_home += 1
                    elif e.team_name == away_name:
                        zone14_away += 1

    return {
        "home": {
            "zone_control": home_zones["control"],
            "halfspace_pct": home_zones["halfspace_pct"],
            "wing_pct": home_zones["wing_pct"],
            "central_pct": home_zones["central_pct"],
            "zone14_entries": zone14_home,
            "width_attack": home_zones["width_attack"],
            "depth_attack": home_zones["depth_attack"],
            "per_phase_volume": home_zones["per_phase"],
        },
        "away": {
            "zone_control": away_zones["control"],
            "halfspace_pct": away_zones["halfspace_pct"],
            "wing_pct": away_zones["wing_pct"],
            "central_pct": away_zones["central_pct"],
            "zone14_entries": zone14_away,
            "width_attack": away_zones["width_attack"],
            "depth_attack": away_zones["depth_attack"],
            "per_phase_volume": away_zones["per_phase"],
        },
    }


def _team_zones(events, team_name):
    team_events = [e for e in events if e.team_name == team_name]
    cell_counts = defaultdict(int)
    halfspace_count = 0
    wing_count = 0
    central_count = 0
    total = 0

    phase_counts = {"buildup": 0, "midfield": 0, "attacking": 0}

    positions = []
    for e in team_events:
        if e.location:
            g = _to_grid(e.location)
            if g:
                col, row = g
                tag = _tag(col, row)
                cell_counts[tag] += 1
                total += 1

                band = _row_band(row)
                if band == "halfspace":
                    halfspace_count += 1
                elif band == "wing":
                    wing_count += 1
                else:
                    central_count += 1

                phase_counts[_col_phase(col)] += 1
                positions.append((col, row))

    control = {}
    if total > 0:
        for r in range(GRID_ROWS):
            for c in range(GRID_COLS):
                tag = _tag(c, r)
                control[tag] = round(cell_counts.get(tag, 0) / total, 4)

    width = 0
    depth = 0
    if positions:
        cols = [p[0] for p in positions]
        rows = [p[1] for p in positions]
        width = round((max(cols) - min(cols)) / GRID_COLS, 2)
        depth = round((max(rows) - min(rows)) / GRID_ROWS, 2)

    half_pct = round(halfspace_count / total * 100, 1) if total else 0
    wing_pct = round(wing_count / total * 100, 1) if total else 0
    cent_pct = round(central_count / total * 100, 1) if total else 0

    total_phase = sum(phase_counts.values()) or 1
    per_phase = {
        k: round(v / total_phase * 100, 1)
        for k, v in phase_counts.items()
    }

    return {
        "control": control,
        "halfspace_pct": half_pct,
        "wing_pct": wing_pct,
        "central_pct": cent_pct,
        "width_attack": width,
        "depth_attack": depth,
        "per_phase": per_phase,
    }
