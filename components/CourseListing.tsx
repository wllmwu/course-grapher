import React from "react";
import Link from "next/link";
import type { Course } from "../utils/data-schema";
import { slugifyCourseCode } from "../utils";
import CourseDescription from "./CourseDescription";

interface CourseListingProps {
  course: Course;
}

function CourseListing({ course }: CourseListingProps) {
  return (
    <>
      <Link href={`/courses/${slugifyCourseCode(course.code)}`}>
        <a>
          <h3>{`${course.code}. ${course.title} (${course.units} units)`}</h3>
        </a>
      </Link>
      <CourseDescription text={course.description} />
    </>
  );
}

export default CourseListing;
