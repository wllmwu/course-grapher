import React, { useState } from "react";
import styles from "../styles/Search.module.css";

interface SearchBarProps {
  /**
   * Callback function to be called when the user enters a search query. The
   * query string will have no whitespace at the beginning or end when it is
   * passed to this callback, but no other transformations are performed.
   * @param query The search query that the user entered
   */
  onSubmit: (query: string) => void;
}

function SearchBar({ onSubmit }: SearchBarProps) {
  const [searchText, setSearchText] = useState("");
  return (
    <form
      onSubmit={(event) => {
        const query = searchText.trim();
        if (query.length > 0) {
          onSubmit(query);
        }
        event.preventDefault();
      }}
      className={styles.searchForm}
    >
      <input
        type="text"
        placeholder="Search for a course..."
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        className={styles.searchBar}
      />
    </form>
  );
}

export default SearchBar;
