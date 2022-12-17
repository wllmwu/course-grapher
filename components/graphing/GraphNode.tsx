import React from "react";
import { AnyGraphNode } from "../../utils/graph-schema";
import { TreeReducerAction } from "./treeReducer";
import CourseNode from "./CourseNode";
import CourseSetNode from "./CourseSetNode";

interface GraphNodeProps {
  node: AnyGraphNode;
  dispatch: React.Dispatch<TreeReducerAction>;
}

function GraphNode({ node, dispatch }: GraphNodeProps) {
  return (
    <g>
      {node.type === "course" ? (
        <>
          <CourseNode node={node} dispatch={dispatch} />
          {node.state === "open" && node.child && (
            <GraphNode node={node.child} dispatch={dispatch} />
          )}
        </>
      ) : (
        <>
          <CourseSetNode node={node} />
          {node.children.map((child: AnyGraphNode, index: number) => (
            <GraphNode key={index} node={child} dispatch={dispatch} />
          ))}
        </>
      )}
    </g>
  );
}

export default GraphNode;
