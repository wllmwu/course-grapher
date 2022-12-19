import React from "react";
import Head from "next/head";
import Link from "next/link";
import Page from "../components/Page";
import styles from "../styles/HomePage.module.css";

function AboutPage() {
  return (
    <Page>
      <Head>
        <title>About | GrAPE</title>
      </Head>
      <h1 className={styles.center}>About GrAPE</h1>
      <p>
        The Graphical Assistant for Prerequisite Enrollment (GrAPE) is a course
        planning tool for UC San Diego students. The name is inspired by CAPE,
        the Course And Professor Evaluations which students submit at the end of
        each quarter. Just as CAPE can be helpful when choosing courses to
        enroll in, I hope that GrAPE proves useful to other students in deciding
        which courses to take and in what order.
      </p>
      <p>
        On this page, I explain my method, means, and motivation for this
        project, in the reverse order.
      </p>
      <h2>Motivation</h2>
      <p>
        My primary motivation for developing this project was my own experience
        navigating the complex course prerequisites in the CSE department. The
        online UCSD catalog lists prerequisites for all courses, but in a format
        that is difficult for humans to read. For example, consider the
        prerequisites in the description of{" "}
        <Link href="https://catalog.ucsd.edu/courses/CSE.html#cse100">
          <a>CSE 100, Advanced Data Structures</a>
        </Link>
        :
      </p>
      <blockquote cite="https://catalog.ucsd.edu/courses/CSE.html#cse100">
        <strong>Prerequisites:</strong> CSE 21 or MATH 154 or MATH 184 or MATH
        188 and CSE 12 and CSE 15L and CSE 30 or ECE 15.
      </blockquote>
      <p>
        It&apos;s not immediately obvious how one is supposed to interpret this.
        Does &quot;and&quot; or &quot;or&quot; have greater precedence? Is there
        associativity? How can I remember this easily, and do the same for
        dozens of other courses that I need to take?
      </p>
      <p>The actual meaning is as follows:</p>
      <ul>
        <li>Take one of CSE 21, MATH 154, MATH 184, or MATH 188; and</li>
        <li>Take CSE 12; and</li>
        <li>Take CSE 15L; and</li>
        <li>Take one of CSE 30 or ECE 15.</li>
      </ul>
      <p>
        Imagine keeping track of all that, in addition to the requirements for
        the preceding courses, such as CSE 21 and CSE 30. There are thousands of
        courses with prerequisites (I know thanks to this project), and their
        catalog descriptions are all written in a similar manner. It is not easy
        to quickly understand what is required for each one until you&apos;re
        very familiar with the relevant majors and departments.
      </p>
      <p>
        Besides that, the catalog itself is sometimes out of date. Another way
        to see the prerequisites for different courses is to use the UCSD
        student portal. The requirements listed there are accurate and also
        slightly more organized in a tabular format, but you can only view one
        course at a time and you must sign in on every visit.
      </p>
      <p>
        While trying to plan my four years of undergraduate study in my first
        couple quarters at UCSD, I was frustrated by how complicated and opaque
        the system of prerequisites seemed. I think these issues are especially
        evident for STEM subjects due to the need for foundational knowledge in
        each course and the high level of interconnectedness between departments
        (note how MATH and ECE courses are accepted alternative prerequisites
        for CSE 100, which is either required or an elective for some majors in
        those departments). But the same problems appear in all places where
        there are these complex prerequisite mazes.
      </p>
      <p>
        I had the idea that it would be much easier to deal with these
        requirements if the information were presented differently. In
        particular, the data lends itself well to a dependency graph structure,
        which fellow computer science students will be familiar with now or
        soon. With that in mind, I set out to create an application that
        displayed course prerequisites as graphs in order to help students like
        me who might prefer to visualize them in this way.
      </p>
      <h2>Means</h2>
      <p>
        One thing I enjoy about this project is that I am able to apply some of
        the concepts from the computer science courses I have taken. Namely, I
        credit Dr. Jhala&apos;s CSE 130 (programming languages) and CSE 131
        (compilers), Dr. Micciancio&apos;s CSE 105 (computability), Dr.
        Kane&apos;s CSE 101 (algorithms), and Dr. Porter&apos;s CSE 142
        (architecture), as well as all of the other great and knowledgeable
        professors in our CSE department whose courses prepared me for those
        ones&mdash;indeed, were prerequisites for those ones.
      </p>
      <p>
        In addition, my work as a member of Triton Software Engineering, a UCSD
        student org where we volunteer to create software for local nonprofits,
        equipped me with the web development skills I needed to put everything
        here together.
      </p>
      <p>
        Major components of this project&apos;s tech stack include{" "}
        <Link href="https://scrapy.org">
          <a>Scrapy</a>
        </Link>{" "}
        for scraping the course catalog and{" "}
        <Link href="https://nextjs.org">
          <a>Next.js</a>
        </Link>{" "}
        and{" "}
        <Link href="https://pages.github.com">
          <a>GitHub Pages</a>
        </Link>{" "}
        for hosting the frontend website.
      </p>
      <h2>Method</h2>
      <p>
        If you skim through the course catalog for a while, you might notice
        that there really is a set of rules which most of the prerequisite lists
        follow. Some departments have slight variations and many courses are
        inconsistent, or even have typos, but they tend to look like &quot;(A or
        B or C) and (X or Y or Z)&quot;, without the parentheses. This means the
        entire catalog is a collection of what one might call
        &quot;mostly-structured&quot; data, and with a little effort I can
        standardize it for easier interpretation by us students. Thus, GrAPE
        works as follows&hellip;.
      </p>
      <p>
        The first step is to obtain the data. I wrote a Python program using the
        Scrapy framework to crawl the course catalog and, with a <em>lot</em> of
        regular expressions, extract information about each course into a set of
        JSON files. My program then runs some postprocessing to analyze
        relationships among courses and properly format the data. This scraping
        step is surprisingly fast thanks to Scrapy&apos;s parallelization,
        typically finishing in less than 3 seconds including postprocessing.
      </p>
      <p>
        The next step is to build the frontend. Next.js is primarily designed
        for static websites, meaning there is no dynamic content customized for
        different users by a server. In other words, there is no database and no
        backend server which can retrieve information and perform computations
        before your browser receives the pages of this site. This restriction
        both simplifies the hosting process and introduces some challenges, but
        the data we&apos;re dealing with do not change often, so I decided to go
        with the completely static site. I have Next.js generate the HTML for
        every single page upfront, reading data from the JSON files previously
        created, and then upload it to GitHub Pages. This step is reasonably
        fast, generally taking about 2 minutes on GitHub&apos;s servers to build
        over 6,000 pages.
      </p>
      <p>
        The final step takes place in your browser. To shorten the build process
        as well as page load times, I leave some pages only partially generated
        by Next.js, and the rest is filled in by JavaScript that runs when you
        open them. The interactive graph viewers on each course page, for
        example, load the course&apos;s prerequisites and generate the graph in
        real time. I believe the frontend JavaScript also runs reasonably fast,
        and I&apos;m happy that I was able to accomplish this without any
        bloated third-party libraries.
      </p>
      <h2>Contributing and Permissions</h2>
      <p>
        GrAPE is a personal project which I created on my own time. You can view
        my code in the public{" "}
        <Link href="https://github.com/wllmwu/course-grapher">
          <a>GitHub repository</a>
        </Link>
        , but it is currently not licensed and I retain all rights to it. With
        that said, there are more features I hope to add or improve, so if
        you&apos;d like to contribute then please reach out (see below) and I
        may add a license and guidelines.
      </p>
      <p>
        Similarly, if you&apos;re interested in using my data for research or
        anything of the sort, then feel free to contact me. :)
      </p>
      <h2>About the Author</h2>
      <p>
        My name is William Wu and I&apos;m a computer science student at UC San
        Diego. I chose to study CS in order to learn more about how modern
        technology works, in both theory and practice, and how I could build
        things for others to use and enjoy (like this project). Check out my
        personal website at{" "}
        <Link href="https://williamwu.site">
          <a>williamwu.site</a>
        </Link>{" "}
        for more of my work and projects as well as contact information.
      </p>
    </Page>
  );
}

export default AboutPage;
