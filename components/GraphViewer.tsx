import React, { useReducer } from "react";
import Link from "next/link";
import type { Course } from "../utils/data-schema";
import { treeReducer } from "./graphing/treeReducer";
import CourseNode from "./graphing/CourseNode";
import styles from "../styles/GraphViewer.module.css";

interface GraphViewerProps {
  root: Course;
}

function GraphViewer({ root }: GraphViewerProps) {
  const [tree, dispatch] = useReducer(treeReducer, {
    type: "root",
    code: "TODO",
    x: 0,
    y: 0,
  });

  return (
    <svg
      width="100%"
      height="32em"
      viewBox="-450 -250 500 500"
      preserveAspectRatio="xMaxYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.graphBox}
    >
      <CourseNode node={tree} dispatch={dispatch} />
      <circle cx={0} cy={0} r={2} />
    </svg>
  );
}

export default GraphViewer;
