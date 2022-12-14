import React from "react";
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import type { Department, Course } from "../../utils/data-schema";
import { readDataFile } from "../../utils/buildtime";
import {
  courseComparator,
  getCourseCodeDigits,
  slugifyCourseCode,
} from "../../utils";
import Page from "../../components/Page";
import styles from "../../styles/DepartmentsPage.module.css";

export const getStaticPaths: GetStaticPaths = async () => {
  if (process.env.SKIP_BUILD_STATIC_GENERATION) {
    // skip static prerendering in preview environments for faster builds
    return {
      paths: [],
      fallback: "blocking",
    };
  }
  const departmentsIndex = JSON.parse(await readDataFile("departments.json"));
  const paths = Object.keys(departmentsIndex).map((deptCode) => ({
    params: { code: deptCode },
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
  const departmentIndex = JSON.parse(
    await readDataFile("departments.json")
  ) as Record<string, Department>;
  const department = departmentIndex[context.params.code];
  if (!department) {
    return { notFound: true };
  }
  const coursePromises = department.courses.map(
    async (courseCode: string) =>
      JSON.parse(
        await readDataFile(`${slugifyCourseCode(courseCode)}.json`)
      ) as Course
  );
  const courses = await Promise.all(coursePromises);
  return {
    props: {
      department,
      courses,
    },
  };
};

interface DepartmentPageProps {
  department: Department;
  courses: Course[];
}

function DepartmentPage({ department, courses }: DepartmentPageProps) {
  courses.sort(courseComparator);
  const coursesByLevel: Record<string, Course[]> = {};
  for (const course of courses) {
    const digits = getCourseCodeDigits(course);
    let level;
    if (digits.length <= 2) {
      level = "Lower-division";
    } else {
      level = `${digits.charAt(0)}00s`;
    }
    if (coursesByLevel.hasOwnProperty(level)) {
      coursesByLevel[level].push(course);
    } else {
      coursesByLevel[level] = [course];
    }
  }
  const levels = Object.keys(coursesByLevel).sort();
  const last = levels.at(-1);
  if (last === "Lower-division") {
    levels.pop();
    levels.unshift(last);
  }

  return (
    <Page>
      <Head>
        <title>{`${department.name} | GAPE`}</title>
      </Head>
      <h1>
        {department.name} ({department.code})
      </h1>
      <p>
        This page lists all {courses.length} {department.code} courses found in
        the catalog. Click on a course to view its prerequisite graph, or visit
        the catalog page for this department at{" "}
        <Link href={department.link}>
          <a>{department.link}</a>
        </Link>
        .
      </p>
      <h2>Index</h2>
      <span className={styles.pageIndex}>
        {levels.map((level, index) => (
          <React.Fragment key={level}>
            {index > 0 && " | "}
            <Link href={`#${level}`}>
              <a>{level}</a>
            </Link>
          </React.Fragment>
        ))}
      </span>
      <div className={styles.cardListWrapper}>
        <div className={styles.cardList}>
          {levels.map((level) => (
            <React.Fragment key={level}>
              <h2 id={level}>{level}</h2>
              {coursesByLevel[level].map((course) => (
                <React.Fragment key={course.code}>
                  <Link href={`/courses/${slugifyCourseCode(course.code)}`}>
                    <a>
                      <h3>{`${course.code}. ${course.title} (${course.units} units)`}</h3>
                    </a>
                  </Link>
                  <p>{course.description}</p>
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </Page>
  );
}

export default DepartmentPage;
