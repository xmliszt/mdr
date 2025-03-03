// ThumbsDownIcon.tsx
"use client";

type ThumbsDownIconProps = {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
};

export const ThumbsDownIcon = ({
  width = 32,
  height = 64,
  color = "#FFFFFF",
  className = "",
}: ThumbsDownIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 64"
      width={width}
      height={height}
      className={className}
    >
      {/* Hand and thumb outline */}
      <path
        d="M 12 12 Q 14 8, 18 10 L 18 24 Q 16 26, 14 26 L 12 40 Q 10 42, 8 40 L 8 24 L 8 12"
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Wrist and sleeve with notch */}
      <path
        d="M 6 24 L 6 32 L 8 32 L 8 40 L 24 40 L 24 32 L 26 32 L 26 24 L 6 24"
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Vertical lines in sleeve */}
      <line x1="12" y1="32" x2="12" y2="40" stroke={color} strokeWidth={2} />
      <line x1="20" y1="32" x2="20" y2="40" stroke={color} strokeWidth={2} />
    </svg>
  );
};
