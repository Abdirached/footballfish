COLS = "ABCDEFGHIJKL"
GRID_COLS = 12
GRID_ROWS = 8
ZONE_14 = {"I4", "I5", "J4", "J5"}
HALFSPACE_Rows = {1, 6}


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


def generate_advice(shape, zones, superiority, match_info):
    advice = []

    home_shape = shape.get("home", {})
    away_shape = shape.get("away", {})
    home_zones = zones.get("home", {})
    away_zones = zones.get("away", {})

    _check_compactness(advice, home_shape, "home")
    _check_compactness(advice, away_shape, "away")
    _check_width(advice, home_zones, "home")
    _check_width(advice, away_zones, "away")
    _check_halfspace(advice, home_zones, "home")
    _check_halfspace(advice, away_zones, "away")
    _check_zone14(advice, home_zones, "home")
    _check_zone14(advice, away_zones, "away")
    _check_line_distances(advice, home_shape, "home")
    _check_line_distances(advice, away_shape, "away")
    _check_superiority(advice, superiority, "home")
    _check_superiority(advice, superiority, "away")

    advice.sort(key=lambda a: {"high": 0, "medium": 1, "low": 2}.get(a["priority"], 3))
    return advice


def _check_compactness(advice, team_shape, team_key):
    compactness = team_shape.get("compactness", 0)
    label = "HOME" if team_key == "home" else "AWAY"

    if compactness > 0.7:
        advice.append({
            "type": "shape",
            "priority": "medium",
            "message": f"{label}: Team is too spread out (compactness {compactness}). "
                       "Reduce distances between lines to compress play.",
            "zone": "",
        })
    elif compactness < 0.25 and team_shape.get("avg_positions"):
        advice.append({
            "type": "shape",
            "priority": "medium",
            "message": f"{label}: Team is too compact ({compactness}). "
                       "Stretch the pitch to create space.",
            "zone": "",
        })


def _check_width(advice, team_zones, team_key):
    width = team_zones.get("width_attack", 0)
    label = "HOME" if team_key == "home" else "AWAY"

    if width < 0.4:
        advice.append({
            "type": "shape",
            "priority": "high",
            "message": f"{label}: Attacking width is too narrow ({width}). "
                       "Fullbacks should push high and wide to stretch the opposition block.",
            "zone": "A8",
        })
    elif width < 0.6:
        advice.append({
            "type": "shape",
            "priority": "low",
            "message": f"{label}: Width could be better ({width}). "
                       "Consider wider positioning from wide players.",
            "zone": "L1",
        })


def _check_halfspace(advice, team_zones, team_key):
    halfspace_pct = team_zones.get("halfspace_pct", 0)
    label = "HOME" if team_key == "home" else "AWAY"

    if halfspace_pct < 15:
        advice.append({
            "type": "zones",
            "priority": "high",
            "message": f"{label}: Low half-space occupation ({halfspace_pct}%). "
                       "Half-spaces are crucial for creating passing lanes between lines. "
                       "Fullbacks interior and wingers drifting inside.",
            "zone": "E3",
        })
    elif halfspace_pct > 50:
        advice.append({
            "type": "zones",
            "priority": "low",
            "message": f"{label}: Heavy half-space focus ({halfspace_pct}%). "
                       "Good, but ensure width is maintained to avoid congestion.",
            "zone": "",
        })


def _check_zone14(advice, team_zones, team_key):
    entries = team_zones.get("zone14_entries", 0)
    label = "HOME" if team_key == "home" else "AWAY"

    if entries < 5:
        advice.append({
            "type": "zones",
            "priority": "high",
            "message": f"{label}: Only {entries} Zone 14 entries. "
                       "Zone 14 is the key creative area. "
                       "Players should target the space between opposition lines.",
            "zone": "I4",
        })
    elif entries > 20:
        advice.append({
            "type": "zones",
            "priority": "low",
            "message": f"{label}: Strong Zone 14 presence ({entries} entries). "
                       "Continue exploiting the centre.",
            "zone": "J5",
        })


def _check_line_distances(advice, team_shape, team_key):
    lines = team_shape.get("line_distances", [])
    label = "HOME" if team_key == "home" else "AWAY"

    if len(lines) >= 2:
        for i in range(len(lines) - 1):
            gap = abs(lines[i + 1].get("avg_y", 0) - lines[i].get("avg_y", 0))
            if gap > 30:
                advice.append({
                    "type": "shape",
                    "priority": "high",
                    "message": f"{label}: Large gap between {lines[i]['phase']} and {lines[i+1]['phase']} lines "
                               f"({round(gap)}m). Team is stretching vertically - risk of isolation.",
                    "zone": "",
                })
            elif gap < 5 and gap > 0:
                advice.append({
                    "type": "shape",
                    "priority": "medium",
                    "message": f"{label}: Very small gap between {lines[i]['phase']} and {lines[i+1]['phase']} "
                               f"({round(gap)}m). Consider more vertical spacing.",
                    "zone": "",
                })


def _check_superiority(advice, superiority, team_key):
    moments = superiority.get("moments", [])
    team_moments = [m for m in moments if m.get("advantage") == ("HOME" if team_key == "home" else "AWAY")]
    label = "HOME" if team_key == "home" else "AWAY"

    if len(team_moments) < 5:
        advice.append({
            "type": "superiority",
            "priority": "high",
            "message": f"{label}: Few numerical superiority situations ({len(team_moments)}). "
                       "Create overloads by shifting numbers to the ball side.",
            "zone": "",
        })
    elif len(team_moments) > 30:
        advice.append({
            "type": "superiority",
            "priority": "low",
            "message": f"{label}: Strong superiority creation ({len(team_moments)} moments). "
                       "Converting these into chances should be the focus.",
            "zone": "",
        })
