import React from "react";
import type {
  AnyGraphNode,
  CourseSetGraphNode,
} from "../../utils/graph-schema";
import Edges from "./Edges";
import styles from "../../styles/GraphViewer.module.css";

interface CourseSetNodeProps {
  node: CourseSetGraphNode;
}

function renderIncomingEdges(node: CourseSetGraphNode) {
  if (node.amount === "all" && !node.isNested) {
    return (
      <>
        {node.children.map((child: AnyGraphNode, index: number) => (
          <Edges.Connector
            key={index}
            x1={child.xOut}
            y1={child.y}
            x2={node.xOut}
            y2={node.y}
            endSegmentLength={20}
          />
        ))}
      </>
    );
  } else {
    let label = "";
    switch (node.amount) {
      case "all":
        if (node.children.length === 2) {
          label = "TAKE BOTH";
        } else {
          label = "TAKE ALL";
        }
        break;
      case "one":
        label = "CHOOSE ONE";
        break;
      case "two":
        label = "CHOOSE TWO";
        break;
    }
    return (
      <>
        <rect
          x={node.bounds.xMin}
          y={node.bounds.yMin}
          width={node.bounds.xMax - node.bounds.xMin}
          height={node.bounds.yMax - node.bounds.yMin}
          rx={4}
          ry={4}
          className={styles.setNodeBox}
        />
        <text
          x={node.bounds.xMin + 5}
          y={node.bounds.yMin + 12}
          className={styles.setNodeLabel}
        >
          {label}
        </text>
      </>
    );
  }
}

function CourseSetNode({ node }: CourseSetNodeProps) {
  return <g>{renderIncomingEdges(node)}</g>;
}

export default CourseSetNode;
