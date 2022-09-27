import { Course } from "./data-schema";

export const parseJSONLines: (jsonLines: string) => any[] = (jsonLines) => {
  const objects = [];
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
  if (!digitsMatch) {
    throw new Error(`Bad course code: ${course.code}`);
  }
  return digitsMatch[0];
};

export const courseComparator: (a: Course, b: Course) => number = (a, b) => {
  const [aSubject, aNumber] = a.code.split(" ");
  const [bSubject, bNumber] = b.code.split(" ");
  if (aSubject !== bSubject) {
    return aSubject.localeCompare(bSubject);
  }
  const aInt = parseInt(aNumber);
  const bInt = parseInt(bNumber);
  if (aInt !== bInt) {
    return aInt - bInt;
  }
  return aNumber.localeCompare(bNumber);
};
