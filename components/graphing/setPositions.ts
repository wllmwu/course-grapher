import type { AnyGraphNode, BoundingBox } from "../../utils/graph-schema";

const X_INTERVAL = -200;
const Y_INTERVAL = 40;
const COURSE_MAX_WIDTH = 110;
const HORIZONTAL_MARGIN = 10;
const VERTICAL_PADDING = 20;
const TOP_EXTRA_PADDING = 10;

/**
 * Recursively sets node `x` and `y` coordinates, as well as `xIn`, `xOut`,
 * and `bounds` where applicable.
 *
 * A node's *x* coordinate is just a function of its "semantic depth" (depth in
 * the tree where course set nodes do not contribute to depth).
 *
 * A node's *y* coordinate is determined based on the provided estimate and the
 * *y* coordinates of its children. The final *y* coordinate will always be
 * equal to or greater than `yEstimate`.
 *
 * @param node The node to set the position of
 * @param depth The "semantic depth" of the current node
 * @param yEstimate The estimated *y* coordinate where `node` should be placed
 * @param nextYCoordinates An array containing the minimum *y* coordinate where
 * a new node can be placed for each level of the tree
 */
function setPositionsHelper(
  node: AnyGraphNode,
  depth: number,
  yEstimate: number,
  nextYCoordinates: number[]
) {
  node.x = depth * X_INTERVAL;
  if (depth < nextYCoordinates.length) {
    node.y = Math.max(yEstimate, nextYCoordinates[depth]);
  } else {
    nextYCoordinates.push(0);
    node.y = yEstimate;
  }

  if (node.type === "course") {
    if (node.child) {
      setPositionsHelper(node.child, depth + 1, node.y, nextYCoordinates);
      node.y = node.child.y;
    }
    nextYCoordinates[depth] = node.y + Y_INTERVAL;
    node.xIn = node.x - HORIZONTAL_MARGIN;
    node.xOut = node.x + COURSE_MAX_WIDTH;
  } else {
    let nextY = Math.max(
      node.y - (node.children.length / 2) * Y_INTERVAL,
      nextYCoordinates[depth] + TOP_EXTRA_PADDING
    );
    let xMin = node.x;
    let xMax = node.x;
    for (const child of node.children) {
      setPositionsHelper(child, depth, nextY, nextYCoordinates);
      if (child.xIn < xMin) {
        xMin = child.xIn;
      }
      if (child.xOut > xMax) {
        xMax = child.xOut;
      }
      nextY = nextYCoordinates[depth];
    }
    node.bounds.xMin = xMin - HORIZONTAL_MARGIN;
    node.bounds.xMax = xMax + HORIZONTAL_MARGIN;
    // `node.children` is assumed to have length at least 2
    const firstChild = node.children[0];
    const lastChild = node.children[node.children.length - 1];
    node.bounds.yMin =
      (firstChild.type === "course" ? firstChild.y : firstChild.bounds.yMin) -
      (VERTICAL_PADDING + TOP_EXTRA_PADDING);
    node.bounds.yMax =
      (lastChild.type === "course" ? lastChild.y : lastChild.bounds.yMax) +
      VERTICAL_PADDING;
    node.y = (node.bounds.yMin + node.bounds.yMax) / 2;
    node.xIn = node.bounds.xMin;
    if (node.amount === "all" && !node.isNested) {
      node.xOut = node.x - X_INTERVAL - HORIZONTAL_MARGIN;
    } else {
      node.xOut = node.bounds.xMax;
    }
  }
}

/**
 * Sets `x`, `y`, `xIn`, `xOut`, `yMin`, and `yMax` where applicable on each
 * node in the given tree, laying out nodes such that subtrees do not overlap.
 *
 * @param root The root node of the prerequisite tree
 *
 * @returns An object with fields `xMin`, `xMax`, `yMin`, and `yMax`,
 * representing the bounding box of the tree after the nodes have been
 * positioned
 */
export function setPositions(root: AnyGraphNode) {
  const nextYCoordinates: number[] = [];
  setPositionsHelper(root, 0, 0, nextYCoordinates);
  const bounds: BoundingBox = {
    xMin: (nextYCoordinates.length - 1) * X_INTERVAL,
    xMax: 0,
    yMin: 0,
    yMax: Math.max(...nextYCoordinates) - Y_INTERVAL,
  };
  return bounds;
}
