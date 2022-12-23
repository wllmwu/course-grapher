import type { Course } from "./data-schema";

export const getCourseCodeDigits: (course: Course) => string = (course) => {
  const digitsMatch = course.code.match(/[0-9]+/g);
  if (!digitsMatch) {
    throw new Error(`Bad course code: ${course.code}`);
  }
  return digitsMatch[0];
};

export const courseComparator: (a: Course, b: Course) => number = (a, b) => {
  return courseCodeComparator(a.code, b.code);
};

export const courseCodeComparator: (a: string, b: string) => number = (
  a,
  b
) => {
  const [aSubject, aNumber] = a.split(" ");
  const [bSubject, bNumber] = b.split(" ");
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

export const slugifyCourseCode: (code: string) => string = (code) =>
  code.replace(" ", "_");

export const deslugifyCourseCode: (code: string) => string = (code) =>
  code.replace("_", " ");
