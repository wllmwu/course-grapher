import React from "react";
import Link from "next/link";
import { Course } from "../utils/data-schema";
import styles from "../styles/GraphViewer.module.css";

interface GraphViewerProps {
  root: Course;
}

function GraphViewer({ root }: GraphViewerProps) {
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
