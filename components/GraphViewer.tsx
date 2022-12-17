import React, { useEffect, useReducer, useState } from "react";
import type { Course } from "../utils/data-schema";
import type { BoundingBox } from "../utils/graph-schema";
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
  const [viewX, setViewX] = useState(0);
  const [viewY, setViewY] = useState(0);
  const [viewSize, setViewSize] = useState(600);
  const [isMouseDown, setMouseDown] = useState(false);

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

  const viewBox = `${viewX - viewSize / 2} ${
    viewY - viewSize / 2
  } ${viewSize} ${viewSize}`;

  const graphBounds: BoundingBox = {
    xMin: state.bounds.xMin - GRAPH_PADDING,
    xMax: state.bounds.xMax + GRAPH_PADDING,
    yMin: state.bounds.yMin - GRAPH_PADDING,
    yMax: state.bounds.yMax + GRAPH_PADDING,
  };

  const handleDrag = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!isMouseDown) {
      return;
    }
    let newX = viewX - event.movementX;
    let newY = viewY - event.movementY;
    if (newX < graphBounds.xMin) {
      newX = graphBounds.xMin;
    } else if (newX > graphBounds.xMax) {
      newX = graphBounds.xMax;
    }
    if (newY < graphBounds.yMin) {
      newY = graphBounds.yMin;
    } else if (newY > graphBounds.yMax) {
      newY = graphBounds.yMax;
    }
    setViewX(newX);
    setViewY(newY);
    event.preventDefault();
  };

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.graphBox}
      onMouseDown={(event) => {
        setMouseDown(true);
        event.preventDefault();
      }}
      onMouseUp={() => setMouseDown(false)}
      onMouseLeave={() => setMouseDown(false)}
      onMouseMove={handleDrag}
    >
      <defs>
        <Edges.ArrowheadDefinition />
      </defs>
      <GraphNode node={state.tree} dispatch={dispatch} />
    </svg>
  );
}

export default GraphViewer;
