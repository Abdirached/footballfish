import { useCallback, useEffect, useState } from "react";
import { mockEvents, MATCH_META } from "../data/mockEvents.js";

const API = "/api";
const FALLBACK_META = { home: "ARG", away: "FRA", competition: "FIFA World Cup 2022 — Final" };

export function useEngine() {
  const [matchId, setMatchId] = useState("3869685");
  const [loading, setLoading] = useState(true);
  const [matchMeta, setMatchMeta] = useState(FALLBACK_META);
  const [depth, setDepth] = useState(5);
  const [aggression, setAggression] = useState(0.5);
  const [jdpData, setJdpData] = useState(null);
  const [jdpLoading, setJdpLoading] = useState(false);

  const fetchJdp = useCallback(async (id) => {
    setJdpLoading(true);
    setLoading(true);
    try {
      const res = await fetch(`${API}/analysis/${id}/jdp`);
      if (!res.ok) throw new Error("JdP API error");
      const data = await res.json();
      if (data.jdp) {
        setJdpData(data.jdp);
        const m = data.jdp.match || {};
        setMatchMeta({
          home: m.home || FALLBACK_META.home,
          away: m.away || FALLBACK_META.away,
          competition: m.competition || FALLBACK_META.competition,
        });
      } else {
        throw new Error("No JdP data");
      }
    } catch {
      setJdpData(null);
      setMatchMeta(MATCH_META);
    } finally {
      setJdpLoading(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJdp(matchId);
  }, [matchId, fetchJdp]);

  return {
    events: mockEvents,
    graded: [],
    selected: null,
    selectedIdx: null,
    advantage: 50,
    loading,
    matchMeta,
    matchId,
    setMatchId: (id) => { setMatchId(id); setJdpData(null); },
    depth,
    setDepth,
    aggression,
    setAggression,
    selectIndex: () => {},
    next: () => {},
    prev: () => {},
    candidates: [],
    jdpData,
    jdpLoading,
    fetchJdp,
  };
}
