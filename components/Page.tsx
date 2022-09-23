import React from "react";
import styles from "../styles/Page.module.css";

interface PageProps {
  children: React.ReactNode;
}

function Page({ children }: PageProps) {
  return <div className={styles.content}>{children}</div>;
}

export default Page;
