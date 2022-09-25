import React from "react";
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";
import type { Department, Course } from "../../utils/data-schema";
import {
  courseComparator,
  getCourseCodeDigits,
  parseJSONLines,
} from "../../utils";
import Page from "../../components/Page";
import LinkCard from "../../components/LinkCard";
import styles from "../../styles/DepartmentsPage.module.css";

export const getStaticPaths: GetStaticPaths = async () => {
  if (process.env.SKIP_BUILD_STATIC_GENERATION) {
    // skip static prerendering in preview environments for faster builds
    return {
      paths: [],
      fallback: "blocking",
    };
  }
  const filePath = path.join(process.cwd(), "scraping/data/index.json");
  const index = JSON.parse(await fs.readFile(filePath, "utf-8"));
  const paths = Object.keys(index.departments).map((deptCode) => ({
    params: { code: deptCode },
  }));
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  if (!context.params || typeof context.params.code !== "string") {
    return {
      notFound: true,
    };
  }
  const deptCode = context.params.code;
  const filePath = path.join(process.cwd(), `scraping/data/${deptCode}.jsonl`);
  const courses = parseJSONLines(await fs.readFile(filePath, "utf-8"));
  const department = courses.shift();
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
        This page lists all {department.code} courses found in the catalog.
        Click on a course to view its prerequisite graph, or visit the catalog
        page for this department at{" "}
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
                <LinkCard
                  key={course.code}
                  title={course.code}
                  subtitle={`${course.title} | ${course.units} units`}
                  href={`/courses/${encodeURIComponent(course.code)}`}
                  className={styles.card}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </Page>
  );
}

export default DepartmentPage;
