import React from "react";
import type { CourseSetGraphNode } from "../../utils/graph-schema";
import { TreeReducerAction } from "./treeReducer";
import TextWithBackground from "./TextWithBackground";

interface CourseSetNodeProps {
  node: CourseSetGraphNode;
  dispatch: React.Dispatch<TreeReducerAction>;
}

function CourseSetNode({ node, dispatch }: CourseSetNodeProps) {
  return (
    <g>
      <TextWithBackground
        x={node.x}
        y={node.y}
        backgroundColor="var(--background)"
        horizontalPadding={4}
      >
        {node.amount}
      </TextWithBackground>
    </g>
  );
}

export default CourseSetNode;
