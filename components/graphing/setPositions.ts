import type {
  AnyGraphNode,
  BoundingBox,
  CourseGraphNode,
  CourseSetGraphNode,
} from "../../utils/graph-schema";

const X_INTERVAL = 200;
const Y_INTERVAL = 20;
const COURSE_X_TO_MIN_X = 10;
const COURSE_X_TO_MAX_X = 110;
const COURSE_HEIGHT = 20;
const SET_TOP_PADDING = 20;
const SET_BOTTOM_PADDING = 10;
const SET_HORIZONTAL_PADDING = 10;

/**
 * Sets `x`, `y`, `xIn`, `xOut`, `yMin`, and `yMax` where applicable on each
 * node in the given tree, laying out nodes such that subtrees do not overlap.
 * The root node is positioned at (0, 0) and prerequisites spread leftwards (in
 * the -*x* direction).
 *
 * @param root The root node of the prerequisite tree
 *
 * @returns An object with fields `xMin`, `xMax`, `yMin`, and `yMax`,
 * representing the bounding box of the tree after the nodes have been
 * positioned
 */
export function setPositions(root: CourseGraphNode) {
  const nextYCoordinates: number[] = [];
  positionCourse(root, 0, 0, nextYCoordinates);
  const yChange = -root.y;
  adjustPositions(root, yChange);
  const bounds: BoundingBox = {
    xMin: (nextYCoordinates.length - 1) * -X_INTERVAL,
    xMax: 0,
    yMin: yChange,
    yMax: Math.max(...nextYCoordinates) - Y_INTERVAL + yChange,
  };
  return bounds;
}

/**
 * Recursively sets node `x` and `y` coordinates, as well as `xIn`, `xOut`,
 * and `bounds` where applicable.
 *
 * A node's *x* coordinate is just a function of its "semantic depth" (depth in
 * the tree where course set nodes do not contribute to depth).
 *
 * A node's *y* coordinate is determined based on the provided estimate and the
 * *y* coordinates of its children.
 *
 * @param node The node to set the position of
 * @param depth The "semantic depth" of the current node
 * @param yEstimate The estimated *y* coordinate where the node's upper *y*
 * bound should be placed
 * @param nextYCoordinates An array containing the minimum *y* coordinate where
 * a new node's upper *y* bound can be placed for each level of the tree
 */
function positionCourse(
  node: CourseGraphNode,
  depth: number,
  yEstimate: number,
  nextYCoordinates: number[]
) {
  node.x = depth * -X_INTERVAL;
  if (depth === nextYCoordinates.length) {
    nextYCoordinates.push(Number.NEGATIVE_INFINITY);
  }
  const initialYMin = Math.max(yEstimate, nextYCoordinates[depth]);
  node.bounds = {
    xMin: node.x - COURSE_X_TO_MIN_X,
    xMax: node.x + COURSE_X_TO_MAX_X,
    yMin: initialYMin,
    yMax: initialYMin + COURSE_HEIGHT,
  };
  node.y = initialYMin + COURSE_HEIGHT / 2;

  if (node.state === "open" && node.child) {
    if (node.child.type === "course") {
      // single course
      positionCourse(node.child, depth + 1, node.bounds.yMin, nextYCoordinates);
    } else {
      // course set
      positionSet(node.child, depth + 1, node.bounds.yMin, nextYCoordinates);
    }
    const yDifference = node.child.y - node.y;
    node.y += yDifference;
    node.bounds.yMin += yDifference;
    node.bounds.yMax += yDifference;
  }
  node.xIn = node.bounds.xMin;
  node.xOut = node.bounds.xMax;
  nextYCoordinates[depth] = node.bounds.yMax + Y_INTERVAL;
}

/**
 * Recursively sets node `x` and `y` coordinates, as well as `xIn`, `xOut`,
 * and `bounds` where applicable.
 *
 * A node's *x* coordinate is just a function of its "semantic depth" (depth in
 * the tree where course set nodes do not contribute to depth).
 *
 * A node's *y* coordinate is determined based on the provided estimate and the
 * *y* coordinates of its children.
 *
 * @param node The node to set the position of
 * @param depth The "semantic depth" of the current node
 * @param yEstimate The estimated *y* coordinate where the node's upper *y*
 * bound should be placed
 * @param nextYCoordinates An array containing the minimum *y* coordinate where
 * a new node's upper *y* bound can be placed for each level of the tree
 */
function positionSet(
  node: CourseSetGraphNode,
  depth: number,
  yEstimate: number,
  nextYCoordinates: number[]
) {
  node.x = depth * -X_INTERVAL;
  if (depth === nextYCoordinates.length) {
    nextYCoordinates.push(Number.NEGATIVE_INFINITY);
  }
  const initialYMin = Math.max(
    yEstimate -
      ((node.children.length - 1) / 2) * (COURSE_HEIGHT + Y_INTERVAL) -
      SET_TOP_PADDING,
    nextYCoordinates[depth]
  );

  let nextY = initialYMin + SET_TOP_PADDING;
  let minChildX = node.x;
  let maxChildX = node.x;
  for (const child of node.children) {
    if (child.type === "course") {
      // single course
      positionCourse(child, depth, nextY, nextYCoordinates);
    } else {
      // course set
      positionSet(child, depth, nextY, nextYCoordinates);
    }
    if (child.bounds.xMin < minChildX) {
      minChildX = child.bounds.xMin;
    }
    if (child.bounds.xMax > maxChildX) {
      maxChildX = child.bounds.xMax;
    }
    nextY = nextYCoordinates[depth];
  }
  // `node.children` is assumed to have length at least 2
  const innerYMin = node.children[0].bounds.yMin;
  const innerYMax = node.children[node.children.length - 1].bounds.yMax;
  node.bounds = {
    xMin: minChildX - SET_HORIZONTAL_PADDING,
    xMax: maxChildX + SET_HORIZONTAL_PADDING,
    yMin: innerYMin - SET_TOP_PADDING,
    yMax: innerYMax + SET_BOTTOM_PADDING,
  };
  node.y = (innerYMin + innerYMax) / 2;
  node.xIn = node.bounds.xMin;
  if (node.amount === "all" && !node.isNested) {
    node.xOut = node.x + X_INTERVAL - SET_HORIZONTAL_PADDING * 2;
  } else {
    node.xOut = node.bounds.xMax;
  }
  nextYCoordinates[depth] = node.bounds.yMax + Y_INTERVAL;
}

/**
 * Recursively adjusts the *y* coordinates of each node in the subtree rooted at
 * the given node by the given amount.
 *
 * @param node The root of the subtree to adjust
 * @param yChange The change in *y* to apply to the subtree
 */
function adjustPositions(node: AnyGraphNode, yChange: number) {
  node.y += yChange;
  if (node.type === "course") {
    if (node.state === "open" && node.child) {
      adjustPositions(node.child, yChange);
    }
  } else {
    node.bounds.yMin += yChange;
    node.bounds.yMax += yChange;
    for (const child of node.children) {
      adjustPositions(child, yChange);
    }
  }
}
