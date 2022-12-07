import React from "react";
import type {
  AnyGraphNode,
  CourseSetGraphNode,
} from "../../utils/graph-schema";
import { TreeReducerAction } from "./treeReducer";

interface CourseSetNodeProps {
  node: CourseSetGraphNode;
  dispatch: React.Dispatch<TreeReducerAction>;
}

function renderIncomingEdges(node: CourseSetGraphNode) {
  if (node.amount === "all" && !node.isNested) {
    return (
      <>
        {node.children.map((child: AnyGraphNode, index: number) => {
          let points = `${child.xOut},${child.y}`;
          points += `${child.xOut + 5},${child.y}`;
          points += `${node.xOut - 5},${node.y}`;
          points += `${node.xOut},${node.y}`;
          return (
            <polyline
              key={index}
              points={points}
              stroke="var(--cool-gray)"
              strokeWidth={2}
              fill="none"
            />
          );
        })}
      </>
    );
  } else {
    return (
      <rect
        x={node.bounds.xMin}
        y={node.bounds.yMin}
        width={node.bounds.xMax - node.bounds.xMin}
        height={node.bounds.yMax - node.bounds.yMin}
        fill="var(--accent-blue-darken)"
        rx={4}
        ry={4}
      />
    );
  }
}

function CourseSetNode({ node, dispatch }: CourseSetNodeProps) {
  return <g>{renderIncomingEdges(node)}</g>;
}

export default CourseSetNode;
