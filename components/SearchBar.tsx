import React, { useCallback, useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Search.module.css";

function SearchBar() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");

  const pushSearchPage = useCallback(
    (query: string) => {
      query = encodeURIComponent(query);
      router.push(`/search?q=${query}`);
    },
    [router]
  );

  return (
    <form
      onSubmit={(event) => {
        const query = searchText.trim();
        if (query.length > 0) {
          pushSearchPage(query);
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
