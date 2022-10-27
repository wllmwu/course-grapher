interface BaseGraphNode {
  type: string;
  x: number;
  y: number;
}

export interface CourseGraphNode extends BaseGraphNode {
  type: "course";
  code: string;
  requirementsTree?: CourseSetGraphNode;
}

export interface RootGraphNode extends CourseGraphNode {
  type: "root";
}

export interface CourseSetGraphNode extends BaseGraphNode {
  type: "set";
  amount: "all" | "one" | "two";
  children: GraphNode[];
}

export type GraphNode = CourseGraphNode | CourseSetGraphNode;
