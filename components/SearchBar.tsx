import React, { useEffect, useState } from "react";
import styles from "../styles/Search.module.css";

interface SearchBarProps {
  initialValue?: string;
  /** Defaults to 2 */
  minimumQueryLength?: number;
  /**
   * Callback function to be called when the user enters a search query. Only
   * called if the query is at least as long as `minimumQueryLength`. The query
   * string will have no whitespace at the beginning or end when it is passed
   * to this callback, but no other transformations are performed.
   * @param query The search query that the user entered
   */
  onSubmit: (query: string) => void;
}

function SearchBar({
  initialValue = "",
  minimumQueryLength = 2,
  onSubmit,
}: SearchBarProps) {
  const [searchText, setSearchText] = useState(initialValue);
  useEffect(() => setSearchText(initialValue), [initialValue]);
  return (
    <form
      onSubmit={(event) => {
        const query = searchText.trim();
        if (query.length >= minimumQueryLength) {
          onSubmit(query);
        }
        event.preventDefault();
      }}
      className={styles.searchForm}
    >
      <label htmlFor="searchBar">
        <p className={styles.searchLabel}>Search by course code</p>
      </label>
      <input
        id="searchBar"
        type="search"
        placeholder="cse 100"
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        className={styles.searchBar}
      />
    </form>
  );
}

export default SearchBar;
