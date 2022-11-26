import React, { useEffect, useRef, useState } from "react";

interface TextWithBackgroundProps {
  x?: number;
  y?: number;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  fill?: string;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  verticalPadding?: number;
  horizontalPadding?: number;
  children?: React.ReactNode;
}

const VERTICAL_OFFSET_FACTOR = 0.3;

function TextWithBackground({
  x = 0,
  y = 0,
  fontSize = 16,
  fontWeight = "normal",
  fill = "#000",
  backgroundColor,
  borderRadius = 0,
  padding = 0,
  verticalPadding,
  horizontalPadding,
  children,
}: TextWithBackgroundProps) {
  const textRef = useRef<SVGTextElement | null>(null);
  const [textWidth, setTextWidth] = useState(0);
  const [textHeight, setTextHeight] = useState(0);

  useEffect(() => {
    if (textRef && textRef.current) {
      const textBounds = textRef.current.getBBox();
      setTextWidth(textBounds.width);
      setTextHeight(textBounds.height);
    }
  }, [textRef]);

  const textVerticalOffset = textHeight * VERTICAL_OFFSET_FACTOR;
  horizontalPadding = horizontalPadding ?? padding;
  verticalPadding = verticalPadding ?? padding;

  return (
    <>
      {backgroundColor && textWidth && (
        <rect
          x={x}
          y={y - textHeight / 2 - verticalPadding}
          width={textWidth + horizontalPadding * 2}
          height={textHeight + verticalPadding * 2}
          fill={backgroundColor}
          rx={borderRadius}
          ry={borderRadius}
        />
      )}
      <text
        ref={textRef}
        x={x + horizontalPadding}
        y={y + textVerticalOffset}
        fontSize={fontSize}
        fontWeight={fontWeight}
        fill={fill}
      >
        {children}
      </text>
    </>
  );
}

export default TextWithBackground;
