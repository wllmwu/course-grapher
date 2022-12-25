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
      {node.state === "open" && node.child && (
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
      {node.state === "open" && node.coreqs && (
        <>
          <text
            x={node.x + vertexRadius + 4}
            y={node.y + 25}
            className={styles.setNodeLabel}
          >
            COREQUISITE(S)
          </text>
          {node.coreqs.map((coreq, index) => (
            <TextWithBackground
              key={coreq.code}
              x={node.x + vertexRadius + 4}
              y={node.y + (index + 1) * 30 + 10}
              className={
                coreq.exists
                  ? styles.courseNodeLabel
                  : `${styles.courseNodeLabel} ${styles.courseUnknown}`
              }
            >
              <Link href={`/courses/${slugifyCourseCode(coreq.code)}`}>
                <a>{coreq.code}</a>
              </Link>
            </TextWithBackground>
          ))}
        </>
      )}
    </g>
  );
}

export default CourseNode;
