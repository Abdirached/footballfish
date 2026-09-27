import { Sparkles, AlertTriangle, CheckCircle } from "lucide-react";

const ICONS = { Sparkles, AlertTriangle, CheckCircle };

export default function EvalBadge({ grade, symbol, color, icon, size = 14 }) {
  const Icon = ICONS[icon] || CheckCircle;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-extrabold tracking-wide uppercase whitespace-nowrap"
      style={{
        color,
        backgroundColor: color + "22",
        border: `1px solid ${color}55`,
      }}
    >
      <Icon size={size} strokeWidth={2.5} />
      {grade}
      {symbol && (
        <span className="font-mono opacity-90">{symbol}</span>
      )}
    </span>
  );
}
