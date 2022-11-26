interface BaseGraphNode {
  type: string;
  x: number;
  y: number;
}

export interface CourseGraphNode extends BaseGraphNode {
  type: "course";
  code: string;
  requirements?: AnyGraphNode;
}

export interface CourseSetGraphNode extends BaseGraphNode {
  type: "set";
  amount: "all" | "one" | "two";
  children: AnyGraphNode[];
}

export type AnyGraphNode = CourseGraphNode | CourseSetGraphNode;
