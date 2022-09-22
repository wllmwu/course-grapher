import React from "react";
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
      <a href="/" className={styles.headerBigLink}>
        GAPE
      </a>
      <nav className={styles.navBar}>
        <ul className={styles.navBarLinkList}>
          {navBarLinks.map(({ title, link }) => (
            <li key={link} className={styles.navBarLinkItem}>
              <a href={link} className={styles.navBarLink}>
                {title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
