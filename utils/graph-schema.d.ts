interface BaseGraphNode {
  type: string;
  x: number;
  y: number;
  children: GraphNode[];
}

export interface CourseGraphNode extends BaseGraphNode {
  type: "course";
  code: string;
}

export interface RootGraphNode extends CourseGraphNode {
  type: "root";
}

export interface AlternativesGraphNode extends BaseGraphNode {
  type: "alts";
  amount: "one" | "two";
}

export type GraphNode = CourseGraphNode | RootGraphNode | AlternativesGraphNode;
