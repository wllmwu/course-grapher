import React from "react";
import type { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import type { Department } from "../../utils/data-schema";
import { readDataFile } from "../../utils/buildtime";
import Page from "../../components/Page";
import LinkCard from "../../components/LinkCard";
import styles from "../../styles/DepartmentsPage.module.css";

export const getStaticProps: GetStaticProps = async () => {
  const departmentIndex = JSON.parse(await readDataFile("departments.json"));
  return {
    props: {
      departments: departmentIndex,
    },
  };
};

interface DepartmentsPageProps {
  departments: Record<string, Department>;
}

function DepartmentsPage({ departments }: DepartmentsPageProps) {
  const deptsByLetter: Record<string, Department[]> = {};
  for (const dept of Object.values(departments)) {
    const firstLetter = dept.code.charAt(0);
    if (deptsByLetter.hasOwnProperty(firstLetter)) {
      deptsByLetter[firstLetter].push(dept);
    } else {
      deptsByLetter[firstLetter] = [dept];
    }
  }
  const letters = Object.keys(deptsByLetter).sort();

  return (
    <Page>
      <Head>
        <title>Departments | GrAPE</title>
      </Head>
      <h1>All Departments</h1>
      <p>
        This page lists all departments found in the catalog, ordered
        alphabetically. Click on a department to view its courses.
      </p>
      <h2>Index</h2>
      <span className={styles.pageIndex}>
        {letters.map((letter, index) => (
          <React.Fragment key={letter}>
            {index > 0 && " | "}
            <Link href={`#${letter}`}>
              <a>{letter}</a>
            </Link>
          </React.Fragment>
        ))}
      </span>
      <div className={styles.cardListWrapper}>
        <div className={styles.cardList}>
          {letters.map((letter) => (
            <React.Fragment key={letter}>
              <h2 id={letter}>{letter}</h2>
              {deptsByLetter[letter].map((dept) => (
                <LinkCard
                  key={dept.code}
                  title={dept.code}
                  subtitle={`${dept.name} | ${dept.courses.length} courses`}
                  href={`/departments/${dept.code}`}
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

export default DepartmentsPage;
