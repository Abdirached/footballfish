import sys
import os
import json
import math
import argparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from data.factory import get_data_source
from data.types import MatchEvent

from model import (
    get_chess_coord,
    parse_coord,
    column_phase,
    build_xt_surface,
    compute_pass_network,
    compute_territory_control,
)

from jdp.pipeline import run_jdp_analysis

COLS = "ABCDEFGHIJKL"


def grade_event(evt, from_coord, to_coord, depth=5, aggression=0.5):
    if not from_coord or not to_coord:
        return {
            "grade": "Good", "symbol": "", "color": "#facc15",
            "icon": "CheckCircle", "xt": 0, "pressure": "Low", "successProb": 50,
        }

    from_p = parse_coord(from_coord)
    to_p = parse_coord(to_coord)
    if not from_p or not to_p:
        return {
            "grade": "Good", "symbol": "", "color": "#facc15",
            "icon": "CheckCircle", "xt": 0, "pressure": "Low", "successProb": 50,
        }

    from_col, from_row = from_p
    to_col, to_row = to_p

    dx = to_col - from_col
    dy = to_row - from_row
    dist = math.sqrt(dx * dx + dy * dy)
    max_dist = math.sqrt(11 * 11 + 7 * 7)

    xt_from = column_phase(from_col)
    xt_to = column_phase(to_col)
    xt_vals = {"buildup": 0.04, "midfield": 0.12, "attacking": 0.28}
    base_xt = xt_vals[xt_to] - xt_vals[xt_from]

    is_zone14 = to_coord in ("I4", "I5", "J4", "J5")
    zone14_bonus = 0.18 if is_zone14 else 0

    aggression_factor = 0.5 + aggression * 0.5
    xt = round((base_xt + zone14_bonus) * aggression_factor, 2)

    pressure = "High" if to_col > 7 else ("Medium" if to_col > 3 else "Low")
    pressure_risk = {"Low": 0.05, "Medium": 0.22, "High": 0.5}
    dist_factor = dist / max_dist
    progressive = 0.08 if dx > 0 else -0.05
    success_prob = max(5, min(97, round(
        (95 - dist_factor * 45 - pressure_risk[pressure] + progressive) * 100
    )))

    grade = "Good"
    symbol = ""
    color = "#facc15"
    icon = "CheckCircle"

    if xt >= 0.2 and success_prob <= 30:
        grade = "Brilliant"
        symbol = "!!"
        color = "#10b981"
        icon = "Sparkles"
    elif xt < -0.05 and pressure == "High" and xt_to == "buildup":
        grade = "Blunder"
        symbol = "??"
        color = "#ef4444"
        icon = "AlertTriangle"
    elif xt >= 0.1 and success_prob >= 70:
        grade = "Excellent"
        symbol = "!"
        color = "#facc15"
        icon = "CheckCircle"

    return {
        "grade": grade,
        "symbol": symbol,
        "color": color,
        "icon": icon,
        "xt": xt,
        "pressure": pressure,
        "successProb": success_prob,
    }


def generate_candidates(position, events, depth=5, aggression=0.5, top_n=3):
    candidates = []
    for col_idx in range(12):
        for row_idx in range(8):
            to_tag = f"{COLS[col_idx]}{8 - row_idx}"
            if to_tag == position:
                continue
            g = grade_event(None, position, to_tag, depth, aggression)
            score = g["xt"] * 100 + (100 - g["successProb"]) * 0.3
            if g["grade"] == "Brilliant":
                score += 50
            candidates.append({
                "move": f"{position} -> {to_tag}",
                "grade": g["grade"],
                "symbol": g["symbol"],
                "color": g["color"],
                "icon": g["icon"],
                "xt": g["xt"],
                "pressure": g["pressure"],
                "successProb": g["successProb"],
                "score": round(score, 1),
            })

    candidates.sort(key=lambda c: c["score"], reverse=True)
    return candidates[:top_n]


def analyze_match(match_id, depth=5, aggression=0.5):
    try:
        source = get_data_source()
        raw_events = source.get_events(match_id)

        raw_dicts = [e.raw for e in raw_events if e.raw]

        xt_surface = build_xt_surface(raw_dicts)
        territory = compute_territory_control(raw_dicts)
        pass_network = compute_pass_network(raw_dicts)

        passes = [r for r in raw_dicts if r.get("type", {}).get("name") == "Pass"]

        max_passes = min(len(passes), 150)
        graded = []
        running_advantage = 50

        for p in passes[:max_passes]:
            from_coord = get_chess_coord(p.get("location"))
            end_loc = p.get("pass", {}).get("end_location", p.get("location"))
            to_coord = get_chess_coord(end_loc)
            player = p.get("player", {}).get("name", "Unknown")
            pass_type = p.get("pass", {}).get("height", {}).get("name", "")
            action_type = f"{pass_type} Pass" if pass_type else "Pass"

            g = grade_event(p, from_coord, to_coord, depth, aggression)

            if g["grade"] == "Brilliant":
                running_advantage += g["xt"] * 60 + 4
            elif g["grade"] == "Excellent":
                running_advantage += g["xt"] * 40 + 2
            elif g["grade"] == "Good":
                running_advantage += g["xt"] * 20
            elif g["grade"] == "Blunder":
                running_advantage += g["xt"] * 50 - 3

            running_advantage = max(2, min(98, running_advantage))

            graded.append({
                "id": f"evt_{p.get('id', 'unknown')}",
                "player": player,
                "type": action_type,
                "move": f"{from_coord} -> {to_coord}",
                "evaluation": g["grade"],
                "advantage": round(running_advantage),
                "metrics": {
                    "xT": f"{'+' if g['xt'] >= 0 else ''}{g['xt']:.2f}",
                    "pressure": g["pressure"],
                    "successProb": f"{g['successProb']}%",
                },
                "insight": (
                    f"{g['grade']} ({g['symbol']}) — {from_coord} → {to_coord}: "
                    f"ΔxT {g['xt']:.2f}, {g['pressure']} pressure, "
                    f"{g['successProb']}% success probability."
                ),
            })

        jdp = run_jdp_analysis(match_id)

        match_info = source.get_match_info(match_id)

        result = {
            "meta": {
                "home": match_info.home_team,
                "away": match_info.away_team,
                "competition": match_info.competition,
            },
            "matchId": match_id,
            "depth": depth,
            "aggression": aggression,
            "events": graded,
            "advantage": round(running_advantage),
            "pass_network": pass_network,
            "territory": territory,
            "xt_surface": xt_surface,
            "jdp": jdp,
        }

        print(json.dumps(result))
    except Exception as e:
        import traceback
        print(json.dumps({"error": str(e), "traceback": traceback.format_exc()}), file=sys.stderr)
        print(json.dumps({"error": str(e)}))


def run_jdp_only(match_id):
    try:
        jdp = run_jdp_analysis(match_id)
        print(json.dumps({"jdp": jdp}))
    except Exception as e:
        import traceback
        print(json.dumps({"error": str(e), "traceback": traceback.format_exc()}), file=sys.stderr)
        print(json.dumps({"error": str(e)}))


def list_competitions():
    try:
        source = get_data_source()
        comps = source.list_competitions()
        print(json.dumps(comps))
    except Exception as e:
        print(json.dumps({"error": str(e)}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--match-id", default="3869685")
    parser.add_argument("--depth", type=int, default=5)
    parser.add_argument("--aggression", type=float, default=0.5)
    parser.add_argument("--jdp-only", action="store_true", help="Only run JdP analysis")
    parser.add_argument("--list-comps", action="store_true", help="List available competitions")

    args = parser.parse_args()

    if args.list_comps:
        list_competitions()
    elif args.jdp_only:
        run_jdp_only(args.match_id)
    else:
        analyze_match(args.match_id, args.depth, args.aggression)
