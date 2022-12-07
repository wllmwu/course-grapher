import React, { useMemo, useReducer } from "react";
import type { Course } from "../utils/data-schema";
import type { CourseGraphNode } from "../utils/graph-schema";
import { treeReducer, treeStateInitializer } from "./graphing/treeReducer";
import GraphNode from "./graphing/GraphNode";
import styles from "../styles/GraphViewer.module.css";

interface GraphViewerProps {
  root: Course;
}

const testTree: CourseGraphNode = {
  type: "course",
  code: "CSE 100",
  x: 0,
  y: 0,
  xIn: -25,
  xOut: 0,
  isNested: true,
  child: {
    type: "set",
    amount: "all",
    x: -50,
    y: 0,
    xIn: -75,
    xOut: -25,
    bounds: { xMin: 0, xMax: 0, yMin: 0, yMax: 0 },
    isNested: false,
    children: [
      {
        type: "set",
        amount: "one",
        x: -150,
        y: -100,
        xIn: -150,
        xOut: -100,
        bounds: { xMin: 0, xMax: 0, yMin: 0, yMax: 0 },
        isNested: false,
        children: [
          {
            type: "course",
            code: "CSE 21",
            x: -300,
            y: -150,
            xIn: -325,
            xOut: -175,
            isNested: true,
          },
          {
            type: "course",
            code: "MATH 154",
            x: -300,
            y: -100,
            xIn: -325,
            xOut: -175,
            isNested: true,
          },
          {
            type: "course",
            code: "MATH 184",
            x: -300,
            y: -50,
            xIn: -325,
            xOut: -175,
            isNested: true,
          },
          {
            type: "course",
            code: "COMM 222MM",
            x: 0,
            y: 0,
            xIn: 0,
            xOut: 0,
            isNested: true,
          },
        ],
      },
      {
        type: "course",
        code: "CSE 12",
        x: -275,
        y: 0,
        xIn: -325,
        xOut: -175,
        isNested: false,
      },
      {
        type: "course",
        code: "CSE 15L",
        x: -275,
        y: 50,
        xIn: -325,
        xOut: -175,
        isNested: false,
      },
      {
        type: "set",
        amount: "one",
        x: -150,
        y: 125,
        xIn: -150,
        xOut: -100,
        bounds: { xMin: 0, xMax: 0, yMin: 0, yMax: 0 },
        isNested: false,
        children: [
          {
            type: "course",
            code: "CSE 30",
            x: -300,
            y: 100,
            xIn: -325,
            xOut: -175,
            isNested: true,
          },
          {
            type: "set",
            amount: "all",
            x: 0,
            y: 0,
            xIn: 0,
            xOut: 0,
            bounds: { xMin: 0, xMax: 0, yMin: 0, yMax: 0 },
            isNested: true,
            children: [
              {
                type: "course",
                code: "ECE 15",
                x: -300,
                y: 150,
                xIn: -325,
                xOut: -175,
                isNested: true,
              },
              {
                type: "course",
                code: "ECE 16",
                x: -300,
                y: 150,
                xIn: -325,
                xOut: -175,
                isNested: true,
              },
            ],
          },
        ],
      },
    ],
  },
};

const GRAPH_PADDING = 150;

function GraphViewer({ root }: GraphViewerProps) {
  const [state, dispatch] = useReducer(
    treeReducer,
    testTree,
    treeStateInitializer
  );
  const viewBox = useMemo(() => {
    const x = state.bounds.xMin - GRAPH_PADDING;
    const y = state.bounds.yMin - GRAPH_PADDING;
    const width = state.bounds.xMax - x + GRAPH_PADDING;
    const height = state.bounds.yMax - y + GRAPH_PADDING;
    return `${x} ${y} ${width} ${height}`;
  }, [state]);

  return (
    <svg
      width="100%"
      height="32em"
      viewBox={viewBox}
      preserveAspectRatio="xMaxYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.graphBox}
    >
      <GraphNode node={state.tree} dispatch={dispatch} />
    </svg>
  );
}

export default GraphViewer;
