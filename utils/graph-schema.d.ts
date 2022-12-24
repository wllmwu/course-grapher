export interface BoundingBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/**
 * `BaseGraphNode` represents a generic node in a prerequisite tree graph.
 */
interface BaseGraphNode {
  /** The type of the node (extending interfaces declare literal values) */
  type: string;
  /** The *x* coordinate of the node */
  x: number;
  /** The *y* coordinate of the node */
  y: number;
  /**
   * The *x* coordinate where incoming edges should end (extending interfaces
   * may treat this value differently)
   */
  xIn: number;
  /**
   * The *x* coordinate where outgoing edges should start (extending interfaces
   * may treat this value differently)
   */
  xOut: number;
  /** The rectangle that bounds this node in the graph */
  bounds: BoundingBox;
  /** Whether the node's parent is a set */
  isNested: boolean;
}

export interface CourseGraphNode extends BaseGraphNode {
  type: "course";
  /** The course code */
  code: string;
  /**
   * The single prerequisite course or set of prerequisite courses, whichever is
   * applicable, or `null` if there are no prerequisites
   */
  child: AnyGraphNode | null;
  /**
   * The current state of the node as displayed in the graph; possible values
   * and their meanings are:
   * - `"closed"`: The course has prerequisites and they are currently hidden
   * - `"open"`: The course has prerequisites and they are currently shown
   * - `"noPrereqs"`: The course does not have prerequisites
   * - `"unknown"`: The course was not found in our data set
   */
  state: "closed" | "open" | "noPrereqs" | "unknown";
}

export interface CourseSetGraphNode extends BaseGraphNode {
  type: "set";
  /** The amount of courses required to be taken from this set */
  amount: "all" | "one" | "two";
  /**
   * The courses and child sets in this set - we may assume there are at least
   * two
   */
  children: AnyGraphNode[];
}

export type AnyGraphNode = CourseGraphNode | CourseSetGraphNode;
