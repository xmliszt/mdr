type BinProgressProps = {
  progress: number;
  color?: string;
};

export function BinProgress(props: BinProgressProps) {
  return (
    <div className="relative h-full w-full bg-background">
      <div
        className="absolute left-0 top-0 h-full"
        style={{
          width: `${Math.min(100, Math.max(0, props.progress * 100))}%`,
          transition: "width 0.5s ease-in-out",
          backgroundColor: props.color ?? "var(--accent-foreground)",
        }}
      />
      <svg className="ml-1 absolute left-0 top-0 h-full w-[50px]">
        <text
          x="0"
          y="55%"
          className="font-bold text-base fill-accent"
          stroke="var(--accent-foreground)"
          strokeWidth="2"
          paintOrder="stroke"
          dominantBaseline="middle"
        >
          {Math.round(props.progress * 100)}%
        </text>
      </svg>
    </div>
  );
}
