import React from "react";
import Page from "../components/Page";
import SearchBar from "../components/SearchBar";
import styles from "../styles/Home.module.css";

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
    </Page>
  );
}

export default Home;
