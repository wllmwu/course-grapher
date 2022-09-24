import React from "react";
import type { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";
import type { Department } from "../../utils/data-schema";
import Page from "../../components/Page";
import styles from "../../styles/DepartmentsPage.module.css";
import cardStyles from "../../styles/LinkCard.module.css";

export const getStaticProps: GetStaticProps = async () => {
  const filePath = path.join(process.cwd(), "scraping/data/index.json");
  const index = JSON.parse(await fs.readFile(filePath, "utf-8"));
  return {
    props: {
      departments: index.departments,
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
  const letters = Object.keys(deptsByLetter);

  return (
    <Page>
      <Head>
        <title>Departments | GAPE</title>
      </Head>
      <h1>All Departments</h1>
      <p>
        This page lists all departments found in the catalog, ordered
        alphabetically. Click on a department to view its courses.
      </p>
      <div className={styles.cardListWrapper}>
        <div className={styles.cardList}>
          {letters.map((letter) => (
            <React.Fragment key={letter}>
              <h2 id={letter}>{letter}</h2>
              {deptsByLetter[letter].map((dept) => (
                <Link key={dept.code} href={`/departments/${dept.code}`}>
                  <a>
                    <div className={`${cardStyles.card} ${styles.card}`}>
                      <h3>{dept.code}</h3>
                      <p>{dept.name}</p>
                    </div>
                  </a>
                </Link>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </Page>
  );
}

export default DepartmentsPage;
