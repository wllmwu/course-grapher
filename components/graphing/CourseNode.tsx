import React from "react";
import Link from "next/link";
import type { CourseGraphNode, RootGraphNode } from "../../utils/graph-schema";
import { TreeReducerAction } from "./treeReducer";

interface CourseNodeProps {
  node: CourseGraphNode | RootGraphNode;
  dispatch: React.Dispatch<TreeReducerAction>;
}

function CourseNode({ node }: CourseNodeProps) {
  return <text>{node.code}</text>;
}

export default CourseNode;
