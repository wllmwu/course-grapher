import React from "react";
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";
import type { Department, Course } from "../../utils/data-schema";
import { parseJSONLines } from "../../utils/jsonlines";
import Page from "../../components/Page";
// import LinkCard from "../../components/LinkCard";
// import styles from "../../styles/DepartmentPage.module.css";

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
      </p>
      {courses.map((course) => (
        <p key={course.code}>{course.code}</p>
      ))}
    </Page>
  );
}

export default DepartmentPage;
