import React from "react";
import Link from "next/link";
import styles from "../styles/LinkCard.module.css";

interface LinkCardProps {
  title: string;
  subtitle: string;
  href: string;
  className?: string;
}

function LinkCard({ title, subtitle, href, className }: LinkCardProps) {
  if (className) {
    className = `${styles.card} ${className}`;
  } else {
    className = styles.card;
  }
  return (
    <Link href={href}>
      <a className={styles.link}>
        <div className={className}>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </a>
    </Link>
  );
}

export default LinkCard;
