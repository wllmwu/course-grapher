import React, { useEffect, useMemo, useState } from "react";
import type { GetStaticProps } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import type { Course } from "../utils/data-schema";
import { deslugifyCourseFile, getCourseCodeSlugs } from "../utils/buildtime";
import * as cache from "../utils/frontend-cache";
import { courseComparator } from "../utils";
import Page from "../components/Page";
import SearchBar from "../components/SearchBar";
import CourseListing from "../components/CourseListing";
import styles from "../styles/HomePage.module.css";

export const getStaticProps: GetStaticProps = async () => {
  const courseCodeSlugs = await getCourseCodeSlugs();
  return {
    props: {
      courseCodes: courseCodeSlugs
        .map((slug) => deslugifyCourseFile(slug))
        .sort(),
    },
  };
};

interface SearchPageProps {
  courseCodes: string[];
}

const MIN_QUERY_LENGTH = 2;

function SearchPage({ courseCodes }: SearchPageProps) {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<Course[] | null>(null);
  const [isLoading, setLoading] = useState(false);
  const userSearchText = useMemo<string | null>(() => {
    const query = router.query.q;
    if (!query) {
      return null;
    }
    let searchText: string;
    if (typeof query === "string") {
      searchText = query;
    } else if (query.length > 0) {
      searchText = query[0];
    } else {
      return null;
    }
    if (searchText.length < MIN_QUERY_LENGTH) {
      return null;
    }
    return searchText;
  }, [router.query.q]);

  useEffect(() => {
    async function loadResults() {
      if (!userSearchText) {
        return;
      }
      setLoading(true);
      const searchText = userSearchText
        .trim()
        .replaceAll(/[^A-z0-9\s]/g, "")
        .replaceAll(/\s+/g, " ")
        .toUpperCase();
      const resultCodes = await searchCourseCodes(searchText, courseCodes);
      const fetchedResults = await Promise.all(
        resultCodes.map((code) => cache.getCourse(code))
      );
      const results = fetchedResults.filter(
        (value) => value !== null
      ) as Course[];
      results.sort(courseComparator);
      setSearchResults(results);
      setLoading(false);
    }
    loadResults();
  }, [courseCodes, userSearchText]);

  return (
    <Page>
      <Head>
        <title>Search | GrAPE</title>
      </Head>
      <h1 className={styles.center}>Search Courses</h1>
      <SearchBar
        initialValue={userSearchText ?? ""}
        disabled={isLoading}
        onSubmit={(query: string) => {
          query = encodeURIComponent(query);
          router.push(`/search?q=${query}`, undefined, { shallow: true });
        }}
      />
      <h2>
        {isLoading
          ? "Loading..."
          : searchResults && `${searchResults.length} results`}
      </h2>
      {searchResults && searchResults.length > 0 && (
        <>
          <p>
            Click on a course to visit its page and see its connections to other
            courses.
          </p>
          {searchResults.map((course) => (
            <CourseListing key={course.code} course={course} />
          ))}
        </>
      )}
    </Page>
  );
}

async function searchCourseCodes(query: string, courseCodes: string[]) {
  let low = 0;
  let high = courseCodes.length;
  let mid = 0;
  let found = false;
  while (low < high) {
    mid = Math.floor((low + high) / 2);
    if (courseCodes[mid].startsWith(query)) {
      found = true;
      break;
    }
    const comparison = query.localeCompare(courseCodes[mid]);
    if (comparison < 0) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }
  if (!found) {
    return [] as string[];
  }
  low = mid;
  while (low > 0) {
    low--;
    if (!courseCodes[low].startsWith(query)) {
      low++;
      break;
    }
  }
  high = mid + 1;
  while (high < courseCodes.length) {
    high++;
    if (!courseCodes[high - 1].startsWith(query)) {
      high--;
      break;
    }
  }
  return courseCodes.slice(low, high);
}

export default SearchPage;
