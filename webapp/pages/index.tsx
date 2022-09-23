import React from "react";
import Link from "next/link";
import Page from "../components/Page";
import SearchBar from "../components/SearchBar";
import styles from "../styles/Home.module.css";

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

function Home() {
  return (
    <Page>
      <h1 className={styles.center}>Welcome to GAPE!</h1>
      <p className={styles.center}>
        The Graphical Assistant for Prerequisite Enrollment can help you
        navigate UC San Diego's complex course prerequisites. Search for a
        course below or visit the list of departments to get started.
      </p>
      <SearchBar />
      <h2>Quick Links</h2>
      <ul className={styles.quickLinkList}>
        {quickLinks.map(({ title, description, link }) => (
          <li key={link} className={styles.quickLinkItem}>
            <Link href={link}>
              <a>
                <div className={styles.quickLinkBox}>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </a>
            </Link>
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

export default Home;
