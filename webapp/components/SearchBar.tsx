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
        pushSearchPage(searchText);
        event.preventDefault();
      }}
    >
      <input
        type="text"
        placeholder="Search for a course..."
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
      />
    </form>
  );
}

export default SearchBar;
