import React from "react";
import type { RootGraphNode } from "../../utils/graph-schema";

interface TreeReducerExpandAction {
  type: "expand";
  payload: number[];
}

interface TreeReducerCloseAction {
  type: "close";
  payload: number[];
}

export type TreeReducerAction =
  | TreeReducerExpandAction
  | TreeReducerCloseAction;

export function treeReducer(tree: RootGraphNode, action: TreeReducerAction) {
  switch (action.type) {
    case "expand":
      return tree;
    case "close":
      return tree;
    default:
      return tree;
  }
}
