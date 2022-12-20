import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Page from "../components/Page";
import SearchBar from "../components/SearchBar";
import { IndependentGraphViewer } from "../components/GraphViewer";
import LinkCard from "../components/LinkCard";
import styles from "../styles/HomePage.module.css";

const quickLinks = [
  {
    title: "Department List",
    description: "Every department with courses in the catalog",
    link: "/departments",
  },
  {
    title: "General Catalog",
    description: "The official online course catalog from UCSD",
    link: "https://catalog.ucsd.edu/front/courses.html",
  },
  {
    title: "TritonLink",
    description: "The place to go for all our student needs",
    link: "https://students.ucsd.edu",
  },
  {
    title: "CAPE",
    description: "Course And Professor Evaluations gathered every quarter",
    link: "https://cape.ucsd.edu",
  },
];

function HomePage() {
  const router = useRouter();
  return (
    <Page>
      <Head>
        <title>Course Grapher for UCSD Students | GrAPE</title>
      </Head>
      <h1 className={styles.center}>Welcome to GrAPE!</h1>
      <p className={styles.center}>
        The Graphical Assistant for Prerequisite Enrollment can help you
        navigate UC San Diego&apos;s complex course prerequisites. Search for a
        course below or visit the list of departments to get started.
      </p>
      <SearchBar
        onSubmit={(query: string) => {
          query = encodeURIComponent(query);
          router.push(`/search?q=${query}`);
        }}
      />
      <h2>Quick Links</h2>
      <ul className={styles.quickLinkList}>
        {quickLinks.map(({ title, description, link }) => (
          <li key={link} className={styles.quickLinkItem}>
            <LinkCard title={title} subtitle={description} href={link} />
          </li>
        ))}
      </ul>
      <h2>Example</h2>
      <p>
        To illustrate how GrAPE visualizes course prerequisites, here&apos;s the
        graph for{" "}
        <Link href="/courses/CSE_100">
          <a>CSE 100</a>
        </Link>{" "}
        (Advanced Data Structures). You can view an interactive graph like this
        for any course at UCSD that has prerequisites&mdash;just search for it
        above.
      </p>
      <IndependentGraphViewer courseCode="CSE 100" />
      <h2>Note</h2>
      <p>
        All department and course information on this site is generated
        automatically based on the contents of the official catalog. There may
        be errors and discrepancies, so be sure to check the catalog, WebReg,
        department websites, etc. when planning your courses, and ask an advisor
        if anything is in doubt.
      </p>
    </Page>
  );
}

export default HomePage;
