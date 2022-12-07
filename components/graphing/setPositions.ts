import type { AnyGraphNode } from "../../utils/graph-schema";

const X_INTERVAL = -200;
const Y_INTERVAL = 50;
const COURSE_MAX_WIDTH = 100;
const NODE_MARGIN = 10;

/**
 * Recursively sets node `x` and `y` coordinates, as well as `xIn`, `xOut`,
 * `yMin`, and `yMax` where applicable.
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
 * a node can be placed for each level of the tree
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
    node.xIn = node.x - NODE_MARGIN;
    node.xOut = node.x + COURSE_MAX_WIDTH + NODE_MARGIN;
  } else {
    let nextY = Math.max(
      node.y - (node.children.length / 2) * Y_INTERVAL,
      nextYCoordinates[depth]
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
    node.xIn = xMin - NODE_MARGIN;
    node.xOut = xMax + NODE_MARGIN;
    const firstChild = node.children[0];
    const lastChild = node.children[node.children.length - 1];
    node.yMin =
      (firstChild.type === "course" ? firstChild.y : firstChild.yMin) -
      NODE_MARGIN;
    node.yMax =
      (lastChild.type === "course" ? lastChild.y : lastChild.yMax) +
      NODE_MARGIN;
    node.y = (node.yMin + node.yMax) / 2;
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
  return {
    xMin: (nextYCoordinates.length - 1) * X_INTERVAL,
    xMax: 0,
    yMin: 0,
    yMax: Math.max(...nextYCoordinates) - Y_INTERVAL,
  };
}
