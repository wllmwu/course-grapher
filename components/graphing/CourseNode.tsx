import React from "react";
import Link from "next/link";
import type { CourseGraphNode } from "../../utils/graph-schema";
import { slugifyCourseCode } from "../../utils";
import { TreeReducerAction } from "./treeReducer";
import TextWithBackground from "./TextWithBackground";

interface CourseNodeProps {
  node: CourseGraphNode;
  dispatch: React.Dispatch<TreeReducerAction>;
}

function CourseNode({ node, dispatch }: CourseNodeProps) {
  return (
    <g>
      <circle cx={node.x} cy={node.y} r={4} fill="var(--accent-blue)" />
      <TextWithBackground
        x={node.x + 10}
        y={node.y}
        fontWeight="bold"
        backgroundColor="var(--accent-blue)"
        borderRadius={4}
        horizontalPadding={4}
        verticalPadding={2}
      >
        <Link href={`/courses/${slugifyCourseCode(node.code)}`}>
          <a>{node.code}</a>
        </Link>
      </TextWithBackground>
    </g>
  );
}

export default CourseNode;
