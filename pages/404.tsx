import React from "react";
import Head from "next/head";
import Page from "../components/Page";

function Error404Page() {
  return (
    <Page>
      <Head>
        <title>404 | GAPE</title>
      </Head>
      <h1>404 {"\u2014"} Not Found</h1>
      <p>
        Sorry, that page doesn&apos;t exist. If you were looking for a certain
        course, try searching the list of courses in the corresponding
        department page.
      </p>
    </Page>
  );
}

export default Error404Page;
