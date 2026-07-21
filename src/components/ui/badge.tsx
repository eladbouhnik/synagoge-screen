export type BadgeTone = "neutral" | "gold" | "warning" | "danger" | "success";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  gold: "bg-[oklch(0.93_0.05_88)] text-[oklch(0.42_0.08_86)]",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-700",
  success: "bg-emerald-100 text-emerald-800",
};

interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ tone = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${toneClasses[tone]} ${className}`}>
      {children}
    </span>
  );
}
