import { Course } from "./data-schema";
import { slugifyCourseCode } from ".";

const courseCache = new Map<string, Promise<Course | null> | Course | null>();

export async function getCourse(code: string) {
  if (!courseCache.has(code)) {
    loadCourse(code);
  }
  return courseCache.get(code) as Promise<Course | null> | Course | null;
}

/**
 * Asynchronously fetches the specified course, filling in the cache with the
 * pending `Promise`. When the fetch completes, the result (either the course
 * object or `null`) replaces the `Promise` in the cache and the `Promise`
 * itself also fulfills with that result. With this logic, we avoid making a
 * request for a course when other requests are already pending for the same
 * course.
 */
function loadCourse(code: string) {
  courseCache.set(
    code,
    fetchFromStaticFiles(code).then((result) => {
      courseCache.set(code, result);
      return result;
    })
  );
}

async function fetchFromStaticFiles(code: string) {
  try {
    const response = await fetch(`/data/${slugifyCourseCode(code)}.json`);
    if (!response.ok) {
      // some 404s are expected because the data are not perfectly consistent
      return null;
    }
    const json = await response.json();
    return json as Course;
  } catch {
    return null;
  }
}
