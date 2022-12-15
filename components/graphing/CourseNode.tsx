import React from "react";
import Link from "next/link";
import type { CourseGraphNode } from "../../utils/graph-schema";
import { slugifyCourseCode } from "../../utils";
import { TreeReducerAction } from "./treeReducer";
import Edges from "./Edges";
import TextWithBackground from "./TextWithBackground";
import styles from "../../styles/GraphViewer.module.css";

interface CourseNodeProps {
  node: CourseGraphNode;
  dispatch: React.Dispatch<TreeReducerAction>;
}

function CourseNode({ node, dispatch }: CourseNodeProps) {
  return (
    <g>
      {node.child && (
        <Edges.Arrow
          x1={node.child.xOut}
          y1={node.child.y}
          x2={node.xIn}
          y2={node.y}
        />
      )}
      {!node.isNested && (
        <Edges.Line x1={node.x} y1={node.y} x2={node.xOut} y2={node.y} />
      )}
      <circle cx={node.x} cy={node.y} r={6} fill="var(--accent-blue)" />
      <TextWithBackground
        x={node.x + 10}
        y={node.y}
        className={styles.courseNodeLabel}
      >
        <Link href={`/courses/${slugifyCourseCode(node.code)}`}>
          <a>{node.code}</a>
        </Link>
      </TextWithBackground>
    </g>
  );
}

export default CourseNode;
