import React from "react";

interface TextWithBackgroundProps {
  x?: number;
  y?: number;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  fill?: string;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  children?: React.ReactNode;
}

const VERTICAL_OFFSET_FACTOR = 5 / 16;

function TextWithBackground({
  x = 0,
  y = 0,
  fontSize = 16,
  fontWeight = "normal",
  fill = "#000",
  backgroundColor,
  borderRadius,
  padding,
  children,
}: TextWithBackgroundProps) {
  return (
    <text
      x={x}
      y={y + fontSize * VERTICAL_OFFSET_FACTOR}
      fontSize={fontSize}
      fontWeight={fontWeight}
      fill={fill}
    >
      {children}
    </text>
  );
}

export default TextWithBackground;
