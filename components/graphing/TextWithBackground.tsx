import React, { useEffect, useRef, useState } from "react";

interface TextWithBackgroundProps {
  x?: number;
  y?: number;
  className: string;
  children?: React.ReactNode;
}

const VERTICAL_OFFSET_FACTOR = 0.3;

/**
 * Renders an SVG `<text>` element with a `<rect>` behind it to emulate text
 * with a background. The `<text>` is vertically centered on `y` and
 * horizontally left-aligned to `x`. The `<rect>` is automatically sized and
 * positioned to fit the `<text>`. The specified CSS class is applied to the
 * `<text>` element, with the following properties then converted and applied to
 * the `<rect>`:
 * - `background-color`
 * - `border-radius`
 * - `padding-top` (used as vertical padding)
 * - `padding-left` (used as horizontal padding)
 *
 * It is recommended to set the `font-size` property to a constant (e.g. `16px`)
 * instead of something in terms of `em` or `rem`, so that the SVG appears
 * consistent at different browser zoom levels.
 */
function TextWithBackground({
  x = 0,
  y = 0,
  className,
  children,
}: TextWithBackgroundProps) {
  const textRef = useRef<SVGTextElement | null>(null);
  const [textWidth, setTextWidth] = useState(0);
  const [textHeight, setTextHeight] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState("#0000");
  const [borderRadius, setBorderRadius] = useState(0);
  const [verticalPadding, setVerticalPadding] = useState(0);
  const [horizontalPadding, setHorizontalPadding] = useState(0);

  useEffect(() => {
    if (textRef && textRef.current) {
      // based on example at https://codepen.io/yesworld/pen/poJzydw
      const textBounds = textRef.current.getBBox();
      const computedStyle = getComputedStyle(textRef.current);
      setTextWidth(textBounds.width);
      setTextHeight(textBounds.height);
      setBackgroundColor(computedStyle["backgroundColor"]);
      setBorderRadius(parseInt(computedStyle["borderRadius"]));
      setVerticalPadding(parseInt(computedStyle["paddingTop"]));
      setHorizontalPadding(parseInt(computedStyle["paddingLeft"]));
    }
  }, [children, textRef]);

  const textVerticalOffset = textHeight * VERTICAL_OFFSET_FACTOR;

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
        className={className}
      >
        {children}
      </text>
    </>
  );
}

export default TextWithBackground;
