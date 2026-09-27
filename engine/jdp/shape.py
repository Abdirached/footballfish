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


def _col_phase(col):
    if col <= 3:
        return "buildup"
    if col <= 7:
        return "midfield"
    return "attacking"


def analyze_shape(events, match_info):
    home_name = match_info.home_team
    away_name = match_info.away_team

    home_events = [e for e in events if e.team_name == home_name]
    away_events = [e for e in events if e.team_name == away_name]

    home_shape = _team_shape(home_events, home_name)
    away_shape = _team_shape(away_events, away_name)

    return {
        "home": {
            "formation": match_info.home_formation or home_shape.get("detected_formation", ""),
            "avg_positions": home_shape["avg_positions"],
            "compactness": home_shape["compactness"],
            "stretch": home_shape["stretch"],
            "line_distances": home_shape["line_distances"],
            "centroid": home_shape["centroid"],
            "player_heatmap": home_shape["heatmap"],
        },
        "away": {
            "formation": match_info.away_formation or away_shape.get("detected_formation", ""),
            "avg_positions": away_shape["avg_positions"],
            "compactness": away_shape["compactness"],
            "stretch": away_shape["stretch"],
            "line_distances": away_shape["line_distances"],
            "centroid": away_shape["centroid"],
            "player_heatmap": away_shape["heatmap"],
        },
    }


def _team_shape(team_events, team_name):
    player_locs = defaultdict(list)
    for e in team_events:
        if e.player and e.location:
            player_locs[e.player.name].append((e.location.x, e.location.y))

    avg_positions = {}
    for pname, locs in player_locs.items():
        if not locs:
            continue
        avg_x = sum(l[0] for l in locs) / len(locs)
        avg_y = sum(l[1] for l in locs) / len(locs)
        grid = _to_grid(type("loc", (), {"x": avg_x, "y": avg_y})())
        if grid:
            avg_positions[pname] = {
                "x": round(avg_x, 1),
                "y": round(avg_y, 1),
                "col": grid[0],
                "row": grid[1],
                "tag": _tag(grid[0], grid[1]),
            }

    positions_xy = [(p["x"], p["y"]) for p in avg_positions.values()]
    centroid = _centroid(positions_xy) if positions_xy else {"x": 60, "y": 40}
    compactness = _compactness(positions_xy, centroid) if positions_xy else 0
    stretch = _stretch(positions_xy) if positions_xy else {"vertical": 0, "horizontal": 0}
    line_distances = _line_distances(avg_positions) if avg_positions else []

    heatmap = [[0] * GRID_COLS for _ in range(GRID_ROWS)]
    for e in team_events:
        if e.location and _to_grid(e.location):
            c, r = _to_grid(e.location)
            if 0 <= c < GRID_COLS and 0 <= r < GRID_ROWS:
                heatmap[r][c] += 1

    if sum(sum(r) for r in heatmap) > 0:
        total = sum(sum(r) for r in heatmap)
        for r in range(GRID_ROWS):
            for c in range(GRID_COLS):
                heatmap[r][c] = round(heatmap[r][c] / total, 4)

    return {
        "avg_positions": avg_positions,
        "compactness": round(compactness, 2),
        "stretch": stretch,
        "line_distances": line_distances,
        "centroid": {"col": round(centroid["x"] / 10, 1), "row": round(centroid["y"] / 10, 1)},
        "heatmap": heatmap,
        "detected_formation": _detect_formation(avg_positions),
    }


def _centroid(xy_list):
    if not xy_list:
        return {"x": 60, "y": 40}
    return {"x": sum(p[0] for p in xy_list) / len(xy_list), "y": sum(p[1] for p in xy_list) / len(xy_list)}


def _compactness(xy_list, centroid):
    if not xy_list or len(xy_list) < 2:
        return 0
    variances = [((p[0] - centroid["x"]) ** 2 + (p[1] - centroid["y"]) ** 2) for p in xy_list]
    return math.sqrt(sum(variances) / len(variances)) / 40


def _stretch(xy_list):
    if not xy_list or len(xy_list) < 2:
        return {"vertical": 0, "horizontal": 0}
    xs = [p[0] for p in xy_list]
    ys = [p[1] for p in xy_list]
    return {
        "vertical": round((max(ys) - min(ys)) / 80, 2),
        "horizontal": round((max(xs) - min(xs)) / 120, 2),
    }


def _line_distances(avg_positions):
    players = list(avg_positions.values())
    if len(players) < 2:
        return []
    lines = defaultdict(list)
    for p in players:
        phase = _col_phase(p["col"])
        lines[phase].append(p)
    distances = []
    for phase in ["buildup", "midfield", "attacking"]:
        if phase in lines and len(lines[phase]) >= 2:
            ys = [p["y"] for p in lines[phase]]
            xs = [p["x"] for p in lines[phase]]
            distances.append({
                "phase": phase,
                "avg_y": round(sum(ys) / len(ys), 1),
                "spread": round((max(ys) - min(ys)) / 80, 2),
            })
    return distances


def _detect_formation(avg_positions):
    if len(avg_positions) < 8:
        return ""
    players = list(avg_positions.values())
    lines = defaultdict(list)
    for p in players:
        phase = _col_phase(p["col"])
        lines[phase].append(p)
    counts = []
    for phase in ["buildup", "midfield", "attacking"]:
        if phase in lines:
            count = len(lines[phase])
            if count > 0:
                counts.append(str(count))
        else:
            counts.append("0")
    return "-".join(counts) if counts else ""
