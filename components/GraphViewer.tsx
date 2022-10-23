import React, { useReducer } from "react";
import Link from "next/link";
import type { Course } from "../utils/data-schema";
import type { GraphNode } from "../utils/graph-schema";
import styles from "../styles/GraphViewer.module.css";

interface GraphViewerProps {
  root: Course;
}

interface TreeReducerExpandAction {
  type: "expand";
  payload: number[];
}

interface TreeReducerCloseAction {
  type: "close";
  payload: number[];
}

type TreeReducerAction = TreeReducerExpandAction | TreeReducerCloseAction;

function treeReducer(tree: GraphNode, action: TreeReducerAction) {
  return tree;
}

function GraphViewer({ root }: GraphViewerProps) {
  const [tree, dispatch] = useReducer(treeReducer, {
    type: "root",
    code: "TODO",
    x: 0,
    y: 0,
    children: [],
  });

  return (
    <svg
      width="100%"
      height="32rem"
      viewBox="-90 -50 100 100"
      preserveAspectRatio="xMaxYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.graphBox}
    ></svg>
  );
}

export default GraphViewer;
