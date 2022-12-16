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

interface TreeReducerToggleAction {
  type: "toggle";
  payload: CourseGraphNode;
}

export type TreeReducerAction =
  | TreeReducerInitializeAction
  | TreeReducerToggleAction;

export function treeReducer(
  state: TreeReducerState | null,
  action: TreeReducerAction
) {
  let newState: TreeReducerState;
  switch (action.type) {
    case "initialize":
      const newTree = action.payload;
      newState = {
        tree: newTree,
        bounds: setPositions(newTree),
      };
      return newState;
    case "toggle":
      if (!state) {
        return state;
      }
      const node = action.payload;
      if (node.state === "closed") {
        node.state = "open";
      } else if (node.state === "open") {
        node.state = "closed";
      } else {
        // no change
        return state;
      }
      const newBounds = setPositions(state.tree);
      newState = {
        tree: state.tree,
        bounds: newBounds,
      };
      return newState;
    default:
      return state;
  }
}
