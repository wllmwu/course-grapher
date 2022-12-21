import React, { useContext } from "react";
import Link from "next/link";
import type { CourseGraphNode } from "../../utils/graph-schema";
import { slugifyCourseCode } from "../../utils";
import { TreeReducerAction } from "./treeReducer";
import GraphContext from "./GraphContext";
import Edges from "./Edges";
import TextWithBackground from "./TextWithBackground";
import styles from "../../styles/GraphViewer.module.css";

interface CourseNodeProps {
  node: CourseGraphNode;
  dispatch: React.Dispatch<TreeReducerAction>;
}

function CourseNode({ node, dispatch }: CourseNodeProps) {
  const { hasPointer } = useContext(GraphContext);
  const vertexRadius = hasPointer ? 8 : 10;
  let vertexClassName = styles.courseNodeVertex;
  let labelClassName = styles.courseNodeLabel;
  switch (node.state) {
    case "open":
      vertexClassName += ` ${styles.courseOpen}`;
      break;
    case "noPrereqs":
      vertexClassName += ` ${styles.courseNoPrereqs}`;
      break;
    case "unknown":
      vertexClassName += ` ${styles.courseUnknown}`;
      labelClassName += ` ${styles.courseUnknown}`;
      break;
  }
  return (
    <g>
      {node.child && node.state === "open" && (
        <Edges.Arrow
          x1={node.child.xOut}
          y1={node.child.y}
          x2={node.xIn - vertexRadius / 2}
          y2={node.y}
        />
      )}
      {!node.isNested && (
        <Edges.Line x1={node.x} y1={node.y} x2={node.xOut} y2={node.y} />
      )}
      <circle
        cx={node.x}
        cy={node.y}
        r={vertexRadius}
        className={vertexClassName}
        onClick={(event) => {
          dispatch({
            type: node.state === "closed" ? "open" : "close",
            payload: node,
          });
          event.preventDefault();
        }}
      />
      <TextWithBackground
        x={node.x + vertexRadius + 4}
        y={node.y}
        className={labelClassName}
      >
        <Link href={`/courses/${slugifyCourseCode(node.code)}`}>
          <a>{node.code}</a>
        </Link>
      </TextWithBackground>
    </g>
  );
}

export default CourseNode;
