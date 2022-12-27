import React from "react";
import Link from "next/link";
import styles from "../styles/Layout.module.css";

const navBarLinks = [
  {
    title: "Home",
    link: "/",
  },
  {
    title: "Departments",
    link: "/departments",
  },
  {
    title: "Search",
    link: "/search",
  },
  {
    title: "About",
    link: "/about",
  },
];

function Header() {
  return (
    <header>
      <Link href="/">
        <a className={styles.headerBigLink}>
          <h1>GrAPE</h1>
          <h2>Graphical Assistant for Prerequisite Enrollment</h2>
        </a>
      </Link>
      <nav className={styles.navBar}>
        <ul className={styles.navBarLinkList}>
          {navBarLinks.map(({ title, link }) => (
            <li key={link} className={styles.navBarLinkItem}>
              <Link href={link}>
                <a className={styles.navBarLink}>{title}</a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
