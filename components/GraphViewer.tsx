import React, { useEffect, useReducer, useState } from "react";
import type { Course } from "../utils/data-schema";
import type { BoundingBox } from "../utils/graph-schema";
import * as cache from "../utils/frontend-cache";
import { treeReducer } from "./graphing/treeReducer";
import { makeGraph } from "./graphing/makeGraph";
import Edges from "./graphing/Edges";
import GraphNode from "./graphing/GraphNode";
import styles from "../styles/GraphViewer.module.css";

interface GraphViewerProps {
  root: Course;
}

const GRAPH_PADDING = 150;
const VIEW_SIZE = 600;

function GraphViewer({ root }: GraphViewerProps) {
  const [state, dispatch] = useReducer(treeReducer, null);
  const [viewX, setViewX] = useState(0);
  const [viewY, setViewY] = useState(0);
  const [isMouseDown, setMouseDown] = useState(false);

  useEffect(() => {
    async function loadGraph() {
      const rootNode = await makeGraph(root);
      dispatch({ type: "initialize", payload: rootNode });
    }
    loadGraph();
  }, [root]);

  if (!state) {
    return (
      <div className={styles.graphBox}>
        <p>Loading...</p>
      </div>
    );
  }

  const viewBox = `${viewX - VIEW_SIZE / 2} ${
    viewY - VIEW_SIZE / 2
  } ${VIEW_SIZE} ${VIEW_SIZE}`;

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
      <text x={0} y={50}>
        Click and drag to pan around the graph.
      </text>
      <text x={0} y={50} dy={30}>
        Click on the circle next to a course to show/hide its prerequisites.
      </text>
      <text x={0} y={50} dy={60}>
        Click on a course to visit its page.
      </text>
      <GraphNode node={state.tree} dispatch={dispatch} />
    </svg>
  );
}

export default GraphViewer;

interface IndependentGraphViewerProps {
  courseCode: string;
}

export function IndependentGraphViewer({
  courseCode,
}: IndependentGraphViewerProps) {
  const [course, setCourse] = useState<Course | null>(null);
  useEffect(() => {
    async function loadCourse() {
      setCourse(await cache.getCourse(courseCode));
    }
    loadCourse();
  }, [courseCode]);

  if (!course) {
    return (
      <div className={styles.graphBox}>
        <p>Loading...</p>
      </div>
    );
  }
  return <GraphViewer root={course} />;
}
