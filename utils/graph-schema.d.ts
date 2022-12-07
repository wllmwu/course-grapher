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
}

export interface CourseGraphNode extends BaseGraphNode {
  type: "course";
  /** The course code */
  code: string;
  /**
   * The single prerequisite course or set of prerequisite courses, whichever is
   * applicable, or `undefined` if there are no prerequisites.
   */
  child?: AnyGraphNode;
}

export interface CourseSetGraphNode extends BaseGraphNode {
  type: "set";
  /** The amount of courses required to be taken from this set */
  amount: "all" | "one" | "two";
  /** The courses in this set */
  children: AnyGraphNode[];
  /**
   * The lower *y* bound (upper edge) of this set's bounding box in the graph
   */
  yMin: number;
  /**
   * The upper *y* bound (lower edge) of this set's bounding box in the graph
   */
  yMax: number;
  /** Whether this set's parent is another set */
  nested: boolean;
}

export type AnyGraphNode = CourseGraphNode | CourseSetGraphNode;
