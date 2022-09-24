import React from "react";
import Head from "next/head";
import Link from "next/link";
import Page from "../components/Page";
import SearchBar from "../components/SearchBar";
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
  return (
    <Page>
      <Head>
        <title>Home | GAPE</title>
      </Head>
      <h1 className={styles.center}>Welcome to GAPE!</h1>
      <p className={styles.center}>
        The Graphical Assistant for Prerequisite Enrollment can help you
        navigate UC San Diego&apos;s complex course prerequisites. Search for a
        course below or visit the list of departments to get started.
      </p>
      <SearchBar />
      <h2>Quick Links</h2>
      <ul className={styles.quickLinkList}>
        {quickLinks.map(({ title, description, link }) => (
          <li key={link} className={styles.quickLinkItem}>
            <LinkCard title={title} subtitle={description} href={link} />
          </li>
        ))}
      </ul>
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
