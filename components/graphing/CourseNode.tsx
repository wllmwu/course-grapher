import React from "react";
import Link from "next/link";
import type { CourseGraphNode, RootGraphNode } from "../../utils/graph-schema";
import { slugifyCourseCode } from "../../utils";
import { TreeReducerAction } from "./treeReducer";
import TextWithBackground from "./TextWithBackground";

interface CourseNodeProps {
  node: CourseGraphNode | RootGraphNode;
  dispatch: React.Dispatch<TreeReducerAction>;
}

function CourseNode({ node, dispatch }: CourseNodeProps) {
  return (
    <TextWithBackground
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
  );
}

export default CourseNode;
