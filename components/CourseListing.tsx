import React from "react";
import Link from "next/link";
import type { Course } from "../utils/data-schema";
import { slugifyCourseCode } from "../utils";
import CourseDescription from "./CourseDescription";

interface CourseListingProps {
  course: Course;
}

function CourseListing({ course }: CourseListingProps) {
  // TODO: pluralize "unit(s)" when possible
  return (
    <div id={slugifyCourseCode(course.code)}>
      <Link href={`/courses/${slugifyCourseCode(course.code)}`}>
        <a>
          <h3>{`${course.code}. ${course.title} (${course.units} units)`}</h3>
        </a>
      </Link>
      {course.successors && (
        <p>
          <strong>
            {`Prerequisite of ${course.successors.length} other course${
              course.successors.length !== 1 ? "s" : ""
            }`}
          </strong>
        </p>
      )}
      <CourseDescription text={course.description} />
    </div>
  );
}

export default CourseListing;
