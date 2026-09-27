from data.factory import get_data_source
from .shape import analyze_shape
from .zones import analyze_zones
from .superiority import analyze_superiority
from .advice import generate_advice


def run_jdp_analysis(match_id):
    source = get_data_source()
    match_info = source.get_match_info(match_id)
    events = source.get_events(match_id)

    if not events:
        return {"error": "No events found"}

    shape = analyze_shape(events, match_info)
    zones = analyze_zones(events, match_info)
    superiority = analyze_superiority(events, match_info)
    advice = generate_advice(shape, zones, superiority, match_info)

    has_360 = source.has_360(match_id)

    return {
        "match_id": match_id,
        "match": {
            "home": match_info.home_team,
            "away": match_info.away_team,
            "competition": match_info.competition,
            "home_formation": match_info.home_formation,
            "away_formation": match_info.away_formation,
        },
        "has_360": has_360,
        "total_events": len(events),
        "total_events_with_ff": sum(1 for e in events if e.freeze_frame),
        "shape": shape,
        "zones": zones,
        "superiority": superiority,
        "advice": advice,
    }
