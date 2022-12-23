import React from "react";
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import type { Course, Department } from "../../utils/data-schema";
import { readDataDirectory, readDataFile } from "../../utils/buildtime";
import * as cache from "../../utils/buildtime-cache";
import { courseCodeComparator, slugifyCourseCode } from "../../utils";
import Page from "../../components/Page";
import CourseDescription from "../../components/CourseDescription";
import GraphViewer from "../../components/GraphViewer";

export const getStaticPaths: GetStaticPaths = async () => {
  if (process.env.SKIP_BUILD_STATIC_GENERATION) {
    // skip static prerendering in preview environments for faster builds
    return {
      paths: [],
      fallback: "blocking",
    };
  }
  const courseCodeSlugs = await readDataDirectory();
  const index = courseCodeSlugs.indexOf("departments.json");
  if (index != -1) {
    courseCodeSlugs.splice(index, 1);
  }
  const paths = courseCodeSlugs.map((courseCode) => ({
    params: { code: courseCode.slice(0, -5) }, // remove ".json"
  }));
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  if (!context.params || typeof context.params.code !== "string") {
    return { notFound: true };
  }
  await cache.populateDepartments();
  const course = JSON.parse(
    await readDataFile(`${context.params.code}.json`)
  ) as Course;
  if (course.successors) {
    course.successors.sort(courseCodeComparator);
  }
  const department = cache.getDepartment(course.dept);
  return {
    props: {
      course,
      department,
    },
  };
};

interface CoursePageProps {
  course: Course;
  department: Department;
}

function CoursePage({ course, department }: CoursePageProps) {
  let catalogLink = department.link;
  if (course.anchor) {
    catalogLink += `#${course.anchor}`;
  }

  // TODO: pluralize "unit(s)" when possible
  return (
    <Page>
      <Head>
        <title>{`${course.code} | GrAPE`}</title>
      </Head>
      {course ? (
        <>
          <p>
            <Link href={`/departments/${department.code}`}>
              <a>{department.code} department</a>
            </Link>
          </p>
          <h1>{`${course.code}. ${course.title} (${course.units} units)`}</h1>
          {catalogLink && (
            <p>
              Link to catalog page:{" "}
              <Link href={catalogLink}>
                <a>{catalogLink}</a>
              </Link>
            </p>
          )}
          <h2>Description</h2>
          <CourseDescription text={course.description} />
          <h2>Prerequisite courses</h2>
          {course.prereqs ? (
            <GraphViewer root={course} />
          ) : (
            <p>{course.code} has no prerequisite courses.</p>
          )}
          <h2>Successor courses</h2>
          {course.successors ? (
            <>
              <p>
                {course.code} is a prerequisite for the following{" "}
                {course.successors.length} courses:
              </p>
              <ul>
                {course.successors.map((successorCode) => (
                  <li key={successorCode}>
                    <Link href={`/courses/${slugifyCourseCode(successorCode)}`}>
                      <a>{successorCode}</a>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>No courses have {course.code} as a prerequisite.</p>
          )}
        </>
      ) : (
        <p>Loading</p>
      )}
    </Page>
  );
}

export default CoursePage;
