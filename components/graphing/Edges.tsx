import React from "react";
import styles from "../../styles/GraphViewer.module.css";

interface LineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function Line({ x1, y1, x2, y2 }: LineProps) {
  return <line className={styles.edge} x1={x1} y1={y1} x2={x2} y2={y2} />;
}

interface ConnectorProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  endSegmentLength: number;
}

function Connector({ x1, y1, x2, y2, endSegmentLength }: ConnectorProps) {
  let points = `${x1},${y1}`;
  points += ` ${x1 + endSegmentLength},${y1}`;
  points += ` ${x2 - endSegmentLength},${y2}`;
  points += ` ${x2},${y2}`;
  return <polyline className={styles.edge} points={points} fill="none" />;
}

function ArrowheadDefinition() {
  return (
    <marker
      id="arrowhead"
      markerWidth="4"
      markerHeight="3"
      refX="2"
      refY="1.5"
      orient="auto"
    >
      <polygon
        className={styles.edgeArrowhead}
        points="0,0 4,1.5 0,3"
        fill="var(--cool-gray)"
      />
    </marker>
  );
}

interface ArrowProps extends LineProps {}

function Arrow({ x1, y1, x2, y2 }: ArrowProps) {
  return (
    <line
      className={styles.edge}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      markerEnd="url(#arrowhead)"
    />
  );
}

const Edges = { Line, Connector, Arrow, ArrowheadDefinition };
export default Edges;
