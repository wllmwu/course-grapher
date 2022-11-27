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

function incomingEdges(node: CourseSetGraphNode) {
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
    const firstChild = node.children[0];
    const lastChild = node.children[node.children.length - 1];
    const x1 = firstChild.xOut;
    const y1 = firstChild.y;
    const x2 = node.xIn - 10;
    const y2 = lastChild.y;
    return (
      <>
        <polyline
          points={`${x1},${y1} ${x2},${y1} ${x2},${y2} ${x1},${y2}`}
          stroke="var(--cool-gray)"
          strokeWidth={2}
          fill="none"
        />
        {node.children
          .slice(1, -1)
          .map((child: AnyGraphNode, index: number) => (
            <line
              key={index}
              x1={child.xOut}
              y1={child.y}
              x2={x2}
              y2={child.y}
              stroke="var(--cool-gray)"
              strokeWidth={2}
            />
          ))}
        <line
          x1={x2}
          y1={node.y}
          x2={node.xOut}
          y2={node.y}
          stroke="var(--cool-gray)"
          strokeWidth={2}
        />
      </>
    );
  }
}

function CourseSetNode({ node, dispatch }: CourseSetNodeProps) {
  const firstChild = node.children[0];
  const lastChild = node.children[node.children.length - 1];
  const x1 = firstChild.xOut;
  const y1 = firstChild.y;
  const x2 = node.xIn - 10;
  const y2 = lastChild.y;
  return (
    <g>
      {incomingEdges(node)}
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
