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
    title: "About",
    link: "/about",
  },
];

function Header() {
  return (
    <header>
      <Link href="/">
        <a className={styles.headerBigLink}>GAPE</a>
      </Link>
      <p className={styles.headerSubtitle}>
        Graphical Assistant for Prerequisite Enrollment
      </p>
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
