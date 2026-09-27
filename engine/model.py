import json
import math
from collections import defaultdict

COLS = "ABCDEFGHIJKL"
GRID_COLS = 12
GRID_ROWS = 8


def get_chess_coord(location):
    if not location or len(location) < 2:
        return None
    x, y = location[0], location[1]
    col_idx = min(int((x / 120) * GRID_COLS), GRID_COLS - 1)
    row_idx = min(int((y / 80) * GRID_ROWS), GRID_ROWS - 1)
    return f"{COLS[col_idx]}{8 - row_idx}"


def parse_coord(coord):
    if not coord or len(coord) < 2:
        return None
    col = COLS.find(coord[0].upper())
    if col < 0:
        return None
    try:
        row = 8 - int(coord[1])
    except ValueError:
        return None
    if row < 0 or row >= GRID_ROWS:
        return None
    return col, row


def column_phase(col):
    if col <= 3:
        return "buildup"
    if col <= 7:
        return "midfield"
    return "attacking"


def row_band(row):
    if row == 0 or row == 7:
        return "wing"
    if row == 1 or row == 6:
        return "halfspace"
    return "central"


def build_xt_surface(events):
    shots = [e for e in events if e.get("type", {}).get("name") == "Shot"]
    if not shots:
        return [[0.04, 0.04, 0.04, 0.04, 0.12, 0.12, 0.12, 0.12, 0.28, 0.28, 0.28, 0.28]] * 8

    surface = [[0.0] * GRID_COLS for _ in range(GRID_ROWS)]
    for shot in shots:
        loc = shot.get("location")
        if not loc:
            continue
        coord = get_chess_coord(loc)
        p = parse_coord(coord)
        if not p:
            continue
        col, row = p
        outcome = shot.get("shot", {}).get("outcome", {}).get("name", "")
        is_goal = outcome == "Goal"
        surface[row][col] += 1.0 if is_goal else 0.03

    total = sum(sum(row) for row in surface)
    if total > 0:
        for r in range(GRID_ROWS):
            for c in range(GRID_COLS):
                surface[r][c] = round(surface[r][c] / total, 4)
    else:
        for r in range(GRID_ROWS):
            for c in range(GRID_COLS):
                phase = column_phase(c)
                vals = {"buildup": 0.04, "midfield": 0.12, "attacking": 0.28}
                surface[r][c] = vals[phase]
    return surface


def compute_pass_network(events):
    passes = [e for e in events if e.get("type", {}).get("name") == "Pass"]
    network = defaultdict(lambda: {"passes": 0, "connections": defaultdict(int)})

    for p in passes:
        player = p.get("player", {}).get("name", "Unknown")
        recipient = p.get("pass", {}).get("recipient", {}).get("name")
        if recipient:
            network[player]["connections"][recipient] += 1
            network[player]["passes"] += 1

    nodes = []
    edges = []
    for player, data in network.items():
        nodes.append({"id": player, "passes": data["passes"]})
        for target, count in data["connections"].items():
            edges.append({"from": player, "to": target, "count": count})

    return {"nodes": nodes, "edges": edges}


def compute_territory_control(events):
    cells = defaultdict(int)
    for e in events:
        loc = e.get("location")
        if not loc:
            continue
        coord = get_chess_coord(loc)
        p = parse_coord(coord)
        if not p:
            continue
        col, row = p
        team = e.get("team", {}).get("name", "neutral")
        cells[(col, row, team)] += 1

    home_team = None
    for e in events:
        team = e.get("team", {}).get("name")
        if team:
            home_team = team
            break
    if not home_team:
        return {"home": 50, "away": 50, "home_cells": [], "away_cells": []}

    home_cells = []
    away_cells = []
    for (col, row, team), count in cells.items():
        entry = {"col": col, "row": row, "count": count}
        if team == home_team:
            home_cells.append(entry)
        else:
            away_cells.append(entry)

    total_home = sum(c["count"] for c in home_cells)
    total_away = sum(c["count"] for c in away_cells)
    total = total_home + total_away
    home_pct = round((total_home / total) * 100) if total > 0 else 50

    return {
        "home": home_pct,
        "away": 100 - home_pct,
        "home_cells": home_cells,
        "away_cells": away_cells,
    }


def compute_jdp_zone_control(events, home_team):
    GRID_COLS = 12
    GRID_ROWS = 8
    home_control = [[0] * GRID_COLS for _ in range(GRID_ROWS)]
    away_control = [[0] * GRID_COLS for _ in range(GRID_ROWS)]

    for e in events:
        loc = e.get("location")
        if not loc:
            continue
        coord = get_chess_coord(loc)
        p = parse_coord(coord)
        if not p:
            continue
        col, row = p
        if e.get("team", {}).get("name") == home_team:
            home_control[row][col] += 1
        else:
            away_control[row][col] += 1

    return {"home": home_control, "away": away_control}
