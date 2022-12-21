import React, { useEffect, useReducer, useState } from "react";
import type { Course } from "../utils/data-schema";
import type { BoundingBox } from "../utils/graph-schema";
import * as cache from "../utils/frontend-cache";
import { treeReducer } from "./graphing/treeReducer";
import { makeGraph } from "./graphing/makeGraph";
import GraphContext from "./graphing/GraphContext";
import Edges from "./graphing/Edges";
import GraphNode from "./graphing/GraphNode";
import styles from "../styles/GraphViewer.module.css";

interface GraphViewerProps {
  root: Course;
}

const GRAPH_PADDING = 150;

function GraphViewer({ root }: GraphViewerProps) {
  const [state, dispatch] = useReducer(treeReducer, null);
  const [hasPointer, setHasPointer] = useState(true);
  const [viewX, setViewX] = useState(0);
  const [viewY, setViewY] = useState(0);
  const [isMouseDown, setMouseDown] = useState(false);
  // because changes in touch position aren't provided, unlike mouse movement,
  // we have to track it ourselves
  const [currentTouchID, setCurrentTouchID] = useState(0);
  const [lastTouchX, setLastTouchX] = useState(0);
  const [lastTouchY, setLastTouchY] = useState(0);

  useEffect(() => {
    // initialize the graph
    async function loadGraph() {
      const rootNode = await makeGraph(root);
      dispatch({ type: "initialize", payload: rootNode });
    }
    loadGraph();
  }, [root]);

  useEffect(() => {
    // check whether the primary input device is a pointer (proxy for mouse vs.
    // touchscreen/mobile)
    function checkQuery(event: MediaQueryListEvent) {
      setHasPointer(event.matches);
    }
    const pointerQuery = matchMedia("(pointer: fine) and (hover: hover)");
    setHasPointer(pointerQuery.matches);
    pointerQuery.addEventListener("change", checkQuery);
    return () => pointerQuery.removeEventListener("change", checkQuery);
  }, []);

  if (!state) {
    return (
      <div className={styles.graphBox}>
        <p>Loading...</p>
      </div>
    );
  }

  const viewSize = hasPointer ? 600 : 350;
  const viewBox = `${viewX - viewSize / 2} ${
    viewY - viewSize / 2
  } ${viewSize} ${viewSize}`;

  const graphBounds: BoundingBox = {
    xMin: state.bounds.xMin - GRAPH_PADDING,
    xMax: state.bounds.xMax + GRAPH_PADDING * 2, // room for help text
    yMin: state.bounds.yMin - GRAPH_PADDING,
    yMax: state.bounds.yMax + GRAPH_PADDING,
  };

  const handleDrag = (xChange: number, yChange: number) => {
    if (!isMouseDown) {
      return;
    }
    let newX = viewX - xChange;
    let newY = viewY - yChange;
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
  };

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.graphBox}
      onMouseDown={(event) => {
        event.preventDefault();
        setMouseDown(true);
      }}
      onMouseUp={() => setMouseDown(false)}
      onMouseLeave={() => setMouseDown(false)}
      onMouseMove={(event) => {
        event.preventDefault();
        handleDrag(event.movementX, event.movementY);
      }}
      onTouchStart={(event) => {
        if (!isMouseDown) {
          // `event.changedTouches` is a list of touches that became active in
          // this `touchstart` event
          const newTouch = event.changedTouches[0];
          setMouseDown(true);
          setCurrentTouchID(newTouch.identifier);
          setLastTouchX(newTouch.clientX);
          setLastTouchY(newTouch.clientY);
        }
      }}
      onTouchMove={(event) => {
        if (isMouseDown) {
          for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            if (touch.identifier === currentTouchID) {
              handleDrag(
                touch.clientX - lastTouchX,
                touch.clientY - lastTouchY
              );
              setLastTouchX(touch.clientX);
              setLastTouchY(touch.clientY);
              break;
            }
          }
        }
      }}
      onTouchEnd={(event) => {
        if (isMouseDown) {
          for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            if (touch.identifier === currentTouchID) {
              setMouseDown(false);
              break;
            }
          }
        }
      }}
      onTouchCancel={(event) => {
        if (isMouseDown) {
          for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            if (touch.identifier === currentTouchID) {
              setMouseDown(false);
              break;
            }
          }
        }
      }}
    >
      <defs>
        <Edges.ArrowheadDefinition />
      </defs>
      <text x={0} y={50}>
        {hasPointer ? "Click" : "Tap"} and drag to pan around the graph.
      </text>
      <text x={0} y={50} dy={30}>
        {hasPointer ? "Click" : "Tap"} on the circle next to a course to
        show/hide its prerequisites.
      </text>
      <text x={0} y={50} dy={60}>
        {hasPointer ? "Click" : "Tap"} on a course to visit its page.
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
