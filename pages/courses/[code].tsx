import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
// import Link from "next/link";
import type { Course } from "../../utils/data-schema";
import { parseJSONLines } from "../../utils";
import Page from "../../components/Page";

function CoursePage() {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const { code } = router.query;

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

  return (
    <Page>
      <Head>
        <title>{`${code} | GAPE`}</title>
      </Head>
      {course ? (
        <>
          <h1>{`${course.code}. ${course.title} (${course.units} units)`}</h1>
          <p>{course.description}</p>
        </>
      ) : (
        <p>Loading</p>
      )}
    </Page>
  );
}

export default CoursePage;
