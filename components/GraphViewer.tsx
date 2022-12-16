import React, { useEffect, useReducer } from "react";
import type { Course } from "../utils/data-schema";
import { treeReducer } from "./graphing/treeReducer";
import { makeGraph } from "./graphing/makeGraph";
import Edges from "./graphing/Edges";
import GraphNode from "./graphing/GraphNode";
import styles from "../styles/GraphViewer.module.css";

interface GraphViewerProps {
  root: Course;
}

const GRAPH_PADDING = 150;

function GraphViewer({ root }: GraphViewerProps) {
  const [state, dispatch] = useReducer(treeReducer, null);
  useEffect(() => {
    async function loadGraph() {
      const rootNode = await makeGraph(root);
      dispatch({ type: "initialize", payload: rootNode });
    }
    loadGraph();
  }, [root]);

  if (!state) {
    return <p>Loading...</p>;
  }

  const x = state.bounds.xMin - GRAPH_PADDING;
  const y = state.bounds.yMin - GRAPH_PADDING;
  const width = state.bounds.xMax - x + GRAPH_PADDING;
  const height = state.bounds.yMax - y + GRAPH_PADDING;
  const viewBox = `${x} ${y} ${width} ${height}`;

  return (
    <svg
      width="100%"
      height="32em"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.graphBox}
    >
      <defs>
        <Edges.ArrowheadDefinition />
      </defs>
      <GraphNode node={state.tree} dispatch={dispatch} />
    </svg>
  );
}

export default GraphViewer;
