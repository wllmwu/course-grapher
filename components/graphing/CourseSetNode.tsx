import React from "react";
import type {
  AnyGraphNode,
  CourseSetGraphNode,
} from "../../utils/graph-schema";
import { TreeReducerAction } from "./treeReducer";
import TextWithBackground from "./TextWithBackground";

interface CourseSetNodeProps {
  node: CourseSetGraphNode;
  dispatch: React.Dispatch<TreeReducerAction>;
}

function renderIncomingEdges(node: CourseSetGraphNode) {
  if (node.amount === "all") {
    return (
      <>
        {node.children.map((child: AnyGraphNode, index: number) => (
          <polyline
            key={index}
            points={`${child.xOut},${child.y} ${child.xOut + 10},${child.y} ${
              node.xIn - 10
            },${node.y} ${node.xIn},${node.y}`}
            stroke="var(--cool-gray)"
            strokeWidth={2}
            fill="none"
          />
        ))}
      </>
    );
  } else {
    return (
      <rect
        x={node.xIn}
        y={node.yMin}
        width={node.xOut - node.xIn}
        height={node.yMax - node.yMin}
        fill="var(--accent-blue-darken)"
        rx={4}
        ry={4}
      />
    );
  }
}

function CourseSetNode({ node, dispatch }: CourseSetNodeProps) {
  return (
    <g>
      {renderIncomingEdges(node)}
      <TextWithBackground
        x={node.x}
        y={node.y}
        fill="var(--cool-gray)"
        backgroundColor="var(--background)"
        horizontalPadding={2}
      >
        {node.amount}
      </TextWithBackground>
    </g>
  );
}

export default CourseSetNode;
