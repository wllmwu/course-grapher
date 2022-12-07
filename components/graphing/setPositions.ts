import type {
  AnyGraphNode,
  CourseGraphNode,
  CourseSetGraphNode,
} from "../../utils/graph-schema";

const X_INTERVAL = -200;
const Y_INTERVAL = 50;
const COURSE_MAX_WIDTH = 100;
const NODE_MARGIN = 10;

/**
 * Recursively sets node `x` and `y` coordinates, as well as `xIn`, `xOut`,
 * `yMin`, and `yMax` where applicable.
 *
 * A node's *x*-coordinate is just a function of its "semantic depth" (depth in
 * the tree where course set nodes do not contribute to depth).
 *
 * A node's *y*-coordinate is determined based on the provided estimate and the
 * *y*-coordinates of its children. The final *y*-coordinate will always be
 * equal to or greater than `yEstimate`.
 *
 * @param node The node to set the position of
 * @param depth The "semantic depth" of the current node
 * @param yEstimate The estimated *y*-coordinate where `node` should be placed
 * @param maxYCoordinates An array containing the current maximum *y* coordinates used for each level of the tree
 */
function setPositionsHelper(
  node: AnyGraphNode,
  depth: number,
  yEstimate: number,
  maxYCoordinates: number[]
) {
  node.x = depth * X_INTERVAL;
  if (depth < maxYCoordinates.length) {
    node.y = Math.max(yEstimate, maxYCoordinates[depth] + Y_INTERVAL);
  } else {
    maxYCoordinates.push(0);
    node.y = yEstimate;
  }

  if (node.type === "course") {
    if (node.child) {
      setPositionsHelper(node.child, depth + 1, node.y, maxYCoordinates);
      node.y = node.child.y;
    }
    maxYCoordinates[depth] = node.y;
    node.xIn = node.x - NODE_MARGIN;
    node.xOut = node.x + COURSE_MAX_WIDTH + NODE_MARGIN;
  } else {
    let nextY = Math.max(
      node.y - (node.children.length / 2) * Y_INTERVAL,
      maxYCoordinates[depth] + Y_INTERVAL
    );
    let xMin = node.x;
    let xMax = node.x;
    for (const child of node.children) {
      setPositionsHelper(child, depth, nextY, maxYCoordinates);
      if (child.xIn < xMin) {
        xMin = child.xIn;
      }
      if (child.xOut > xMax) {
        xMax = child.xOut;
      }
      nextY = maxYCoordinates[depth] + Y_INTERVAL;
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

export function setPositions(root: AnyGraphNode) {
  setPositionsHelper(root, 0, 0, []);
}
