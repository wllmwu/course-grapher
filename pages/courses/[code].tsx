import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import type { Course } from "../../utils/data-schema";
import { deslugifyCourseCode, parseJSONLines } from "../../utils";
import Page from "../../components/Page";
import GraphViewer from "../../components/GraphViewer";

function CoursePage() {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [deptLink, setDeptLink] = useState<string | null>(null);
  const code = useMemo(() => {
    const { code: codeSlug } = router.query;
    if (!codeSlug) {
      return null;
    }
    return deslugifyCourseCode(codeSlug as string);
  }, [router]);

  useEffect(() => {
    if (typeof code !== "string") {
      return;
    }
    fetch("../data/index.json")
      .then((response) => response.text())
      .then((text) => {
        const index = JSON.parse(text);
        const courseIndex = index.courses;
        const dept = courseIndex[code];
        setDeptLink(index.departments[dept].link);
        return fetch(`../data/${dept}.jsonl`);
      })
      .then((response) => response.text())
      .then((text) => {
        const courses = parseJSONLines(text) as Course[];
        for (const c of courses) {
          if (c.code === code) {
            setCourse(c);
            break;
          }
        }
      });
  }, [code, setCourse]);

  const catalogLink =
    deptLink &&
    course &&
    (course.anchor ? `${deptLink}#${course.anchor}` : deptLink);

  return (
    <Page>
      <Head>
        <title>{`${code} | GAPE`}</title>
      </Head>
      {course ? (
        <>
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
          <p>{course.description}</p>
          <h2>Prerequisites</h2>
          <GraphViewer root={course} />
        </>
      ) : (
        <p>Loading</p>
      )}
    </Page>
  );
}

export default CoursePage;
