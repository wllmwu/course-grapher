import type { CourseGraphNode, BoundingBox } from "../../utils/graph-schema";
import { setPositions } from "./setPositions";

interface TreeReducerState {
  tree: CourseGraphNode;
  bounds: BoundingBox;
}

interface TreeReducerInitializeAction {
  type: "initialize";
  payload: CourseGraphNode;
}

interface TreeReducerOpenAction {
  type: "open";
  payload: CourseGraphNode;
}

interface TreeReducerCloseAction {
  type: "close";
  payload: CourseGraphNode;
}

export type TreeReducerAction =
  | TreeReducerInitializeAction
  | TreeReducerOpenAction
  | TreeReducerCloseAction;

export function treeReducer(
  state: TreeReducerState | null,
  action: TreeReducerAction
) {
  let newState: TreeReducerState;
  console.log(
    `reducer called on ${action.payload.code} with action ${action.type}`
  );
  switch (action.type) {
    case "initialize":
      const newTree = action.payload;
      newState = {
        tree: newTree,
        bounds: setPositions(newTree),
      };
      return newState;
    case "open":
      if (!state) {
        return state;
      }
      action.payload.state = "open";
      newState = {
        tree: state.tree,
        bounds: setPositions(state.tree),
      };
      return newState;
    case "close":
      if (!state) {
        return state;
      }
      action.payload.state = "closed";
      newState = {
        tree: state.tree,
        bounds: setPositions(state.tree),
      };
      return newState;
    default:
      return state;
  }
}
