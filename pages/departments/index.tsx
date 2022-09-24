import React from "react";
import type { GetStaticProps } from "next";
import Head from "next/head";
import { promises as fs } from "fs";
import path from "path";
import type { Department } from "../../utils/data-schema";
import Page from "../../components/Page";

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
  return (
    <Page>
      <Head>
        <title>Departments | GAPE</title>
      </Head>
      <h1>All Departments</h1>
      {Object.values(departments).map((dept) => (
        <div key={dept.code} id={dept.code}>
          <h3>{`${dept.code} | ${dept.name}`}</h3>
        </div>
      ))}
    </Page>
  );
}

export default DepartmentsPage;
