import { useState } from "react";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useEngine } from "./hooks/useEngine.js";
import MatchSelector from "./components/MatchSelector.jsx";
import DepthSlider from "./components/DepthSlider.jsx";
import AdvicePanel from "./components/AdvicePanel.jsx";
import JdpMetrics from "./components/JdpMetrics.jsx";
import AnalysisDetails from "./components/AnalysisDetails.jsx";

export default function App() {
  const {
    matchMeta,
    matchId,
    setMatchId,
    depth,
    setDepth,
    aggression,
    setAggression,
    jdpData,
    jdpLoading,
  } = useEngine();

  const [selectedAdvice, setSelectedAdvice] = useState(null);

  return (
    <div className="w-screen h-screen bg-[#121212] text-[#e5e5e5] flex flex-col overflow-hidden">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-6 py-3 bg-surface border-b border-border flex-shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-amber-500 flex items-center justify-center shadow-[0_4px_12px_rgba(250,204,21,0.3)]">
            <Trophy size={20} className="text-[#121212]" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-lg font-black tracking-wider text-white">
              FOOTBALLFISH
            </div>
            <div className="text-[10px] text-text-dim tracking-wide uppercase">
              JdP — Positional Play Analysis Engine
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <MatchSelector value={matchId} onChange={setMatchId} />
          <DepthSlider
            depth={depth}
            aggression={aggression}
            onDepthChange={setDepth}
            onAggressionChange={setAggression}
          />
          <div className="text-right">
            <div className="text-text-dim text-[10px]">Match</div>
            <div className="font-bold text-[#eee]">
              {matchMeta?.home ?? "?"} vs {matchMeta?.away ?? "?"}
            </div>
          </div>
          <div className="px-2.5 py-1 bg-border rounded text-[10px] text-text-dim font-mono">
            {matchMeta?.competition ?? "Loading..."}
          </div>
          {jdpData?.has_360 && (
            <div className="px-2 py-1 bg-green-900/40 text-green-400 rounded text-[9px] border border-green-800 font-bold">
              360&deg;
            </div>
          )}
        </div>
      </motion.header>

      <main className="flex-1 flex gap-4 p-4 overflow-hidden">
        <div className="w-[260px] flex-shrink-0 overflow-hidden">
          <JdpMetrics jdp={jdpData} matchMeta={matchMeta} />
        </div>

        <div className="flex-1 overflow-hidden min-w-0">
          <AdvicePanel
            advice={jdpData?.advice}
            loading={jdpLoading}
            selectedAdvice={selectedAdvice}
            onSelectAdvice={setSelectedAdvice}
          />
        </div>

        <div className="w-[320px] flex-shrink-0 overflow-hidden">
          <AnalysisDetails
            jdp={jdpData}
            selectedAdvice={selectedAdvice}
            match={matchMeta}
          />
        </div>
      </main>
    </div>
  );
}
