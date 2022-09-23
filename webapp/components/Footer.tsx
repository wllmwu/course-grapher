import React from "react";
import Link from "next/link";
import styles from "../styles/Layout.module.css";

function Footer() {
  return (
    <footer>
      <div className={styles.footer}>
        <p>{"\u00a9"} 2022 William Wu</p>
        <p>
          This is a personal project, not affiliated with or endorsed by UC San
          Diego. However, I hope it is useful. :)
        </p>
        <p>
          Check out the GitHub repo here:{" "}
          <Link href="https://github.com/wllmwu/course-grapher">
            <a>github.com/wllmwu/course-grapher</a>
          </Link>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
