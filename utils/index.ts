import { Course } from "./data-schema";

export const parseJSONLines: (jsonLines: string) => object[] = (jsonLines) => {
  const objects: object[] = [];
  for (const jsonString of jsonLines.split("\n")) {
    if (jsonString.length === 0) {
      continue;
    }
    objects.push(JSON.parse(jsonString)); // JSON.parse throws if invalid syntax
  }
  return objects;
};

export const getCourseCodeDigits: (course: Course) => string = (course) => {
  const digitsMatch = course.code.match(/[0-9]+/g);
  if (!digitsMatch || digitsMatch.length !== 1) {
    throw new Error(`Bad course code: ${course.code}`);
  }
  return digitsMatch[0];
};
