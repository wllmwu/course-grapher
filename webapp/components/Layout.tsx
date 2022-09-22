import React from "react";
import Header from "./Header";
import styles from "../styles/Layout.module.css";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.background}>
      <Header />
      <main>{children}</main>
    </div>
  );
}

export default Layout;
