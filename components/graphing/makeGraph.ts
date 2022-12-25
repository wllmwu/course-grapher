import type { Course, PrerequisitesSet } from "../../utils/data-schema";
import type {
  CoreqInfo,
  CourseGraphNode,
  CourseSetGraphNode,
} from "../../utils/graph-schema";
import * as cache from "../../utils/frontend-cache";

/**
 * Creates a graph representing the given course's full prerequisite tree
 * (including prerequisites of prerequisites, as far back as possible). Uses
 * the frontend cache, so should not be run during the static build process.
 * Does **not** calculate node positions.
 *
 * @param course The root course whose prerequisites are to be graphed
 * @returns A `Promise` which resolves to the root node of the resulting graph
 */
export async function makeGraph(course: Course) {
  const root = await convertCourseToGraphNode(course.code, true, 0);
  if (root.state === "closed") {
    root.state = "open";
  }
  return root;
}

async function convertCourseToGraphNode(
  code: string,
  isNested: boolean,
  depth: number
) {
  const node = courseGraphNodeFactory(code, isNested);
  const course = await cache.getCourse(code);
  if (!course) {
    node.state = "unknown";
    return node;
  }
  if ((!course.prereqs && !course.coreqs) || depth > 15) {
    // depth limit is to stop infinite cycle edge case
    node.state = "noPrereqs";
    return node;
  }

  if (course.prereqs) {
    if (typeof course.prereqs === "string") {
      // single course
      node.child = await convertCourseToGraphNode(
        course.prereqs,
        false,
        depth + 1
      );
    } else {
      // course set
      node.child = await convertSetToGraphNode(
        course.prereqs,
        false,
        depth + 1
      );
    }
  }
  if (course.coreqs) {
    node.coreqs = await convertCorequisites(course.coreqs);
  }
  return node;
}

async function convertSetToGraphNode(
  set: PrerequisitesSet,
  isNested: boolean,
  depth: number
) {
  const node = setGraphNodeFactory(set.type, isNested);
  node.children = await Promise.all(
    set.courses.map(async (child) => {
      if (typeof child === "string") {
        // single course
        return convertCourseToGraphNode(
          child,
          isNested || set.type !== "all",
          depth
        );
      } else {
        // course set
        return convertSetToGraphNode(child, true, depth);
      }
    })
  );
  return node;
}

function courseGraphNodeFactory(code: string, isNested: boolean) {
  return <CourseGraphNode>{
    type: "course",
    code,
    child: null,
    coreqs: null,
    state: "closed",
    x: 0,
    y: 0,
    xIn: 0,
    xOut: 0,
    bounds: { xMin: 0, xMax: 0, yMin: 0, yMax: 0 },
    isNested,
  };
}

function setGraphNodeFactory(amount: "all" | "one" | "two", isNested: boolean) {
  return <CourseSetGraphNode>{
    type: "set",
    amount,
    children: [],
    x: 0,
    y: 0,
    xIn: 0,
    xOut: 0,
    bounds: { xMin: 0, xMax: 0, yMin: 0, yMax: 0 },
    isNested,
  };
}

async function convertCorequisites(coreqs: string | PrerequisitesSet) {
  const coreqsList: string[] = [];
  flattenCorequisites(coreqs, coreqsList);
  return Promise.all(
    coreqsList.map(async (coreqCode) => {
      const course = await cache.getCourse(coreqCode);
      return <CoreqInfo>{
        code: coreqCode,
        exists: course !== null,
      };
    })
  );
}

function flattenCorequisites(
  coreqs: string | PrerequisitesSet,
  result: string[]
) {
  if (typeof coreqs === "string") {
    result.push(coreqs);
  } else {
    for (const child of coreqs.courses) {
      if (typeof child === "string") {
        result.push(child);
      } else {
        flattenCorequisites(child, result);
      }
    }
  }
}
