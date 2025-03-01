import { cn } from "@/lib/utils";

type BinProgressProps = {
  progress: number;
  color?: string;
};

export function BinProgress(props: BinProgressProps) {
  return (
    <div className="h-full w-full bg-background">
      <div
        className="h-full"
        style={{
          width: `${Math.min(100, Math.max(0, props.progress * 100))}%`,
          transition: "width 0.3s ease-in-out",
          backgroundColor: props.color ?? "var(--accent-foreground)",
        }}
      >
        <span
          className={cn(
            "ml-2 font-mono font-bold text-lg",
            props.progress === 0 ? "text-accent-foreground" : "text-accent"
          )}
        >
          {props.progress * 100}%
        </span>
      </div>
    </div>
  );
}
