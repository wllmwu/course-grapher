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
 * representing the bounding box of the course nodes in the tree after the nodes
 * have been positioned
 */
export function setPositions(root: AnyGraphNode) {
  const nextYCoordinates: number[] = [];
  positionNode(root, 0, 0, nextYCoordinates);
  return getGraphBounds(root);
}

/**
 * Recursively sets node `x` and `y` coordinates, as well as `xIn`, `xOut`,
 * and `bounds`. Also updates `graphBounds` if necessary.
 *
 * A node's *x* coordinate is just a function of its "semantic depth" (depth in
 * the tree, where course set nodes do not contribute to depth).
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
 *
 * @returns The maximum distance that the subtree rooted at this node can be
 * shifted upwards (in the -*y* direction) while the rest of the tree stays
 * constant, after the subtree's own layout has been computed (may be any
 * non-negative value or `Infinity`)
 */
function positionNode(
  node: AnyGraphNode,
  depth: number,
  yEstimate: number,
  nextYCoordinates: number[]
) {
  if (node.type === "course") {
    return positionCourse(node, depth, yEstimate, nextYCoordinates);
  } else {
    return positionSet(node, depth, yEstimate, nextYCoordinates);
  }
}

function positionCourse(
  node: CourseGraphNode,
  depth: number,
  yEstimate: number,
  nextYCoordinates: number[]
) {
  // compute x and initial y and bounds
  node.x = depth * -X_INTERVAL;
  if (depth === nextYCoordinates.length) {
    nextYCoordinates.push(Number.NEGATIVE_INFINITY);
  }
  const initialYMin = Math.max(yEstimate, nextYCoordinates[depth]);
  const maxSelfAdjustment = initialYMin - nextYCoordinates[depth];
  node.y = initialYMin + COURSE_HEIGHT / 2;
  node.bounds = {
    xMin: node.x - COURSE_X_TO_MIN_X,
    xMax: node.x + COURSE_X_TO_MAX_X,
    yMin: initialYMin,
    yMax: initialYMin + COURSE_HEIGHT,
  };
  node.xIn = node.bounds.xMin;
  node.xOut = node.bounds.xMax;

  let maxSubtreeAdjustment = Number.POSITIVE_INFINITY;
  if (node.state === "open" && node.child) {
    // position child
    maxSubtreeAdjustment = positionNode(
      node.child,
      depth + 1,
      node.bounds.yMin,
      nextYCoordinates
    );
    // center this node on child
    const centerAdjustment = node.child.y - node.y;
    node.y += centerAdjustment;
    node.bounds.yMin += centerAdjustment;
    node.bounds.yMax += centerAdjustment;
    // adjust subtree if possible
    const subtreeAdjustment = Math.min(centerAdjustment, maxSubtreeAdjustment);
    if (subtreeAdjustment > 0) {
      adjustPositions(node, -subtreeAdjustment, depth, nextYCoordinates);
      maxSubtreeAdjustment -= subtreeAdjustment;
    }
  }

  nextYCoordinates[depth] = node.bounds.yMax + Y_INTERVAL;
  return Math.min(maxSelfAdjustment, maxSubtreeAdjustment);
}

function positionSet(
  node: CourseSetGraphNode,
  depth: number,
  yEstimate: number,
  nextYCoordinates: number[]
) {
  // compute x and initial y
  node.x = depth * -X_INTERVAL;
  if (depth === nextYCoordinates.length) {
    nextYCoordinates.push(Number.NEGATIVE_INFINITY);
  }
  const initialYMin = Math.max(yEstimate, nextYCoordinates[depth]);
  const maxSelfAdjustment = initialYMin - nextYCoordinates[depth];
  const topOffset =
    node.amount === "all" && !node.isNested ? 0 : SET_TOP_PADDING;

  // position children
  let nextY = initialYMin + topOffset;
  let minChildX = node.x;
  let maxChildX = node.x;
  let maxSubtreeAdjustment = Number.NaN;
  // `node.children` is assumed to have length at least 2
  for (const child of node.children) {
    const childMaxAdjustment = positionNode(
      child,
      depth,
      nextY,
      nextYCoordinates
    );
    if (isNaN(maxSubtreeAdjustment)) {
      // only take uppermost child's return value
      maxSubtreeAdjustment = childMaxAdjustment;
    }
    if (child.bounds.xMin < minChildX) {
      minChildX = child.bounds.xMin;
    }
    if (child.bounds.xMax > maxChildX) {
      maxChildX = child.bounds.xMax;
    }
    nextY = nextYCoordinates[depth];
  }

  // compute bounds and y
  const firstChildYMin = node.children[0].bounds.yMin;
  const lastChildYMax = node.children[node.children.length - 1].bounds.yMax;
  if (node.amount === "all" && !node.isNested) {
    node.bounds = {
      xMin: minChildX,
      xMax: maxChildX,
      yMin: firstChildYMin,
      yMax: lastChildYMax,
    };
    node.xIn = 0; // unused
    node.xOut = node.x + X_INTERVAL - SET_HORIZONTAL_PADDING * 2;
  } else {
    node.bounds = {
      xMin: minChildX - SET_HORIZONTAL_PADDING,
      xMax: maxChildX + SET_HORIZONTAL_PADDING,
      yMin: firstChildYMin - topOffset,
      yMax: lastChildYMax + SET_BOTTOM_PADDING,
    };
    node.xIn = node.bounds.xMin;
    node.xOut = node.bounds.xMax;
  }
  node.y = (node.bounds.yMin + node.bounds.yMax) / 2;
  nextYCoordinates[depth] = node.bounds.yMax + Y_INTERVAL;
  return Math.min(maxSelfAdjustment, maxSubtreeAdjustment);
}

/**
 * Recursively adjusts the *y* coordinates of each node in the subtree rooted at
 * the given node by the given amount. Also updates `nextYCoordinates`.
 *
 * @param node The root of the subtree to adjust
 * @param yChange The change in *y* to apply to the subtree
 * @param depth The "semantic depth" of the current node
 * @param nextYCoordinates An array containing the minimum *y* coordinate where
 * a new node's upper *y* bound can be placed for each level of the tree
 */
function adjustPositions(
  node: AnyGraphNode,
  yChange: number,
  depth: number,
  nextYCoordinates: number[]
) {
  node.y += yChange;
  node.bounds.yMin += yChange;
  node.bounds.yMax += yChange;
  if (node.type === "course") {
    if (node.state === "open" && node.child) {
      nextYCoordinates[depth] = node.bounds.yMax + Y_INTERVAL;
      adjustPositions(node.child, yChange, depth + 1, nextYCoordinates);
    }
  } else {
    for (const child of node.children) {
      adjustPositions(child, yChange, depth, nextYCoordinates);
    }
    nextYCoordinates[depth] = node.bounds.yMax + Y_INTERVAL;
  }
}

function getGraphBounds(rootNode: AnyGraphNode) {
  // TODO
  const bounds: BoundingBox = {
    xMin: -100,
    xMax: 100,
    yMin: -100,
    yMax: 100,
  };
  return bounds;
}
