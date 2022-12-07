import type { AnyGraphNode } from "../../utils/graph-schema";

interface TreeReducerState {
  tree: AnyGraphNode;
}

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

export function treeReducer(
  state: TreeReducerState,
  action: TreeReducerAction
) {
  switch (action.type) {
    case "expand":
      return state;
    case "close":
      return state;
    default:
      return state;
  }
}
