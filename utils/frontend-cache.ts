import { Course } from "./data-schema";
import { slugifyCourseCode } from ".";

const courseCache = new Map<string, Course | null>();
const BASE_PATH = "/course-grapher"; // TODO

export async function getCourse(code: string) {
  if (!courseCache.has(code)) {
    await loadCourse(code);
  }
  return courseCache.get(code) as Course | null;
}

async function loadCourse(code: string) {
  courseCache.set(code, await fetchFromStaticFiles(code));
}

async function fetchFromStaticFiles(code: string) {
  try {
    const response = await fetch(
      `${BASE_PATH}/data/${slugifyCourseCode(code)}.json`
    );
    if (!response.ok) {
      console.error(`Error retrieving ${code}: status ${response.status}`);
      return null;
    }
    const json = await response.json();
    return json as Course;
  } catch {
    return null;
  }
}
