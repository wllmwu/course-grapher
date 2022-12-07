import type { AnyGraphNode } from "../../utils/graph-schema";
import { setPositions } from "./setPositions";

interface TreeReducerState {
  tree: AnyGraphNode;
  bounds: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  };
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

export function treeStateInitializer(tree: AnyGraphNode) {
  const { xMin, xMax, yMin, yMax } = setPositions(tree);
  const state: TreeReducerState = {
    tree,
    bounds: { xMin, xMax, yMin, yMax },
  };
  return state;
}
