import { useState, useEffect } from "react";
import { ChevronDown, Globe, Calendar, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API = "/api/matches";

const FALLBACK_COMPS = [
  { competition_id: 43, season_id: 3, competition_name: "FIFA World Cup", season_name: "2022", country_name: "International", has_360: true },
  { competition_id: 55, season_id: 27, competition_name: "UEFA Euro", season_name: "2024", country_name: "Europe", has_360: true },
  { competition_id: 11, season_id: 106, competition_name: "La Liga", season_name: "2020/2021", country_name: "Spain", has_360: true },
  { competition_id: 9, season_id: 107, competition_name: "1. Bundesliga", season_name: "2023/2024", country_name: "Germany", has_360: true },
];

const FALLBACK_MATCHES = [
  { id: "3869685", home: "ARG", away: "FRA", competition: "FIFA World Cup 2022 — Final", date: "2022-12-18" },
  { id: "3869684", home: "CRO", away: "MAR", competition: "FIFA World Cup 2022 — 3rd Place", date: "2022-12-17" },
  { id: "3869678", home: "ARG", away: "CRO", competition: "FIFA World Cup 2022 — Semi-Final", date: "2022-12-13" },
  { id: "3869679", home: "FRA", away: "MAR", competition: "FIFA World Cup 2022 — Semi-Final", date: "2022-12-14" },
];

export default function MatchSelector({ value, onChange }) {
  const [comps, setComps] = useState(FALLBACK_COMPS);
  const [selectedComp, setSelectedComp] = useState(null);
  const [matches, setMatches] = useState(FALLBACK_MATCHES);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState("match");

  useEffect(() => {
    fetch(`${API}/competitions`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setComps(data);
      })
      .catch(() => {});
  }, []);

  const current = matches.find((m) => m.id === value);

  const selectCompetition = (comp) => {
    setSelectedComp(comp);
    setPhase("loading");
    fetch(`${API}/${comp.competition_id}/${comp.season_id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMatches(data);
          if (data[0]) onChange(data[0].id);
        }
        setPhase("match");
      })
      .catch(() => {
        setMatches(FALLBACK_MATCHES);
        setPhase("match");
      });
  };

  const label = current
    ? `${current.home} vs ${current.away}`
    : "Select Match";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-border rounded-md text-xs text-text hover:bg-[#333] transition-colors"
      >
        <Globe size={12} className="text-accent" />
        <span className="font-mono font-bold">{label}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 top-full mt-1 w-80 bg-[#1f1f1f] border border-border rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto"
          >
            {phase === "loading" && (
              <div className="p-4 text-xs text-text-dim text-center">Loading matches...</div>
            )}

            {phase === "match" && selectedComp && (
              <div className="sticky top-0 bg-[#1f1f1f] border-b border-border">
                <button
                  onClick={() => { setSelectedComp(null); setPhase("comp"); }}
                  className="w-full text-left px-4 py-2 text-[10px] text-accent hover:bg-[#262626] transition-colors"
                >
                  ← Back to competitions
                </button>
                <div className="px-4 py-1.5 text-[9px] uppercase tracking-wider text-text-dim font-bold">
                  {selectedComp.competition_name} {selectedComp.season_name}
                </div>
              </div>
            )}

            {(phase === "comp" || !selectedComp) && comps.map((comp) => (
              <button
                key={`${comp.competition_id}-${comp.season_id}`}
                onClick={() => selectCompetition(comp)}
                className="w-full text-left px-4 py-3 text-xs border-b border-border last:border-b-0 transition-colors hover:bg-[#262626] flex items-center gap-3"
              >
                <Trophy size={14} className="text-accent flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-text truncate">
                    {comp.competition_name}
                  </div>
                  <div className="text-text-dim text-[10px] mt-0.5">
                    {comp.season_name}
                    {comp.has_360 && (
                      <span className="ml-2 text-green-400 text-[9px]">· 360°</span>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {phase === "match" && selectedComp && matches.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onChange(m.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-xs border-b border-border last:border-b-0 transition-colors ${
                  m.id === value ? "bg-accent/10 border-l-2 border-l-accent" : "hover:bg-[#262626]"
                }`}
              >
                <div className="font-bold text-text">
                  {m.home} vs {m.away}
                </div>
                <div className="text-text-dim text-[10px] mt-0.5">{m.competition || selectedComp.competition_name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar size={9} className="text-text-dim" />
                  <span className="text-text-dim text-[9px] font-mono">{m.date || "?"}</span>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
