import React, { useReducer } from "react";
import type { Course } from "../utils/data-schema";
import type { CourseGraphNode } from "../utils/graph-schema";
import { treeReducer } from "./graphing/treeReducer";
import GraphNode from "./graphing/GraphNode";
import styles from "../styles/GraphViewer.module.css";

interface GraphViewerProps {
  root: Course;
}

const testTree: CourseGraphNode = {
  type: "course",
  code: "TODO",
  x: 0,
  y: 0,
  requirements: {
    type: "set",
    amount: "all",
    x: -100,
    y: 0,
    children: [
      {
        type: "set",
        amount: "one",
        x: -200,
        y: -100,
        children: [
          {
            type: "course",
            code: "CSE 21",
            x: -300,
            y: -150,
          },
          {
            type: "course",
            code: "MATH 154",
            x: -300,
            y: -100,
          },
          {
            type: "course",
            code: "MATH 184",
            x: -300,
            y: -50,
          },
        ],
      },
      {
        type: "course",
        code: "CSE 12",
        x: -200,
        y: 0,
      },
      {
        type: "course",
        code: "CSE 15L",
        x: -200,
        y: 50,
      },
      {
        type: "set",
        amount: "one",
        x: -200,
        y: 125,
        children: [
          {
            type: "course",
            code: "CSE 30",
            x: -300,
            y: 100,
          },
          {
            type: "course",
            code: "ECE 15",
            x: -300,
            y: 150,
          },
        ],
      },
    ],
  },
};

function GraphViewer({ root }: GraphViewerProps) {
  const [state, dispatch] = useReducer(treeReducer, { tree: testTree });

  return (
    <svg
      width="100%"
      height="32em"
      viewBox="-450 -250 500 500"
      preserveAspectRatio="xMaxYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.graphBox}
    >
      <GraphNode node={state.tree} dispatch={dispatch} />
    </svg>
  );
}

export default GraphViewer;
