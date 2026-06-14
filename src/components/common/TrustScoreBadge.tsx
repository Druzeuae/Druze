import { cn } from "@/lib/utils";

export function TrustScoreBadge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const dims = { sm: 36, md: 48, lg: 64 }[size];
  const stroke = { sm: 3, md: 4, lg: 5 }[size];
  const radius = (dims - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 80 ? "#16A34A" : score >= 50 ? "#D4AF37" : "#94A3B8";

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: dims, height: dims }}
      title={`Trust Score: ${score}/100`}
    >
      <svg width={dims} height={dims} className="-rotate-90">
        <circle cx={dims / 2} cy={dims / 2} r={radius} stroke="#E5E7EB" strokeWidth={stroke} fill="none" />
        <circle
          cx={dims / 2}
          cy={dims / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className={cn("absolute font-bold text-foreground", size === "sm" ? "text-[10px]" : size === "md" ? "text-xs" : "text-sm")}>
        {score}
      </span>
    </div>
  );
}
