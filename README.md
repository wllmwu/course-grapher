# Course Grapher

## Overview

A program that parses the UC San Diego online course catalog (<https://ucsd.edu/catalog/front/courses.html>) and creates a graph of prerequisites. Courses are parsed and stored in JSON Lines files, organized by department. Then a network graph is generated with courses as nodes and prerequisite relationships forming edges.

## Development

Minimum Python version: 3.10

### Getting started

In the `scraping` folder, create and activate a virtual environment:

```
cd scraping
python3 -m venv .venv
source .venv/bin/activate
```

The shell prompt will change to indicate that the environment has been activated. Then install requirements:

```
pip install -r requirements.txt
```

To update the requirements file, run `pip freeze > requirements.txt`.

### Running the web scraper

With the virtual environment activated, run this command:

```
python scrape.py
```

The script will crawl the course catalog and store data in the `scraping/data` folder. See options for logging by adding `-h` or `--help`.

### Running the webapp locally

Run the webapp on a local development server:

```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser to see the result.

## Sources

### Scraping

- Scrapy documentation: <https://docs.scrapy.org/en/latest/>
- Python `re` module documentation: <https://docs.python.org/3/library/re.html>
- Python `argparse` module documentation: <https://docs.python.org/3/library/argparse.html>
- Python `os` module documentation: <https://docs.python.org/3/library/os.html>
- JSON Lines format: <https://jsonlines.org>
- jsonlines documentation: <https://jsonlines.readthedocs.io/en/latest/>

### Webapp

- Next.js documentation: <https://nextjs.org/docs/getting-started>
- GitHub Pages documentation: <https://docs.github.com/en/pages>
- GitHub Actions documentation: <https://docs.github.com/en/actions>
