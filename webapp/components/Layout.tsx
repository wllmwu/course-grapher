import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import styles from "../styles/Layout.module.css";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.background}>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
