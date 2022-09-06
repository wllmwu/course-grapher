# Course Grapher

## Overview

A program that parses the UC San Diego online course catalog (<https://ucsd.edu/catalog/front/courses.html>) and creates a graph of prerequisites. Courses are parsed and stored in JSON Lines files, organized by department. Then a network graph is generated with courses as nodes and prerequisite relationships forming edges.

## Development

Minimum Python version: 3.10

### Getting started

In the repository root, create and activate a virtual environment:

```
python3 -m venv .venv
source .venv/bin/activate
```

The shell prompt will change to indicate that the environment has been activated. Then install requirements:

```
pip install -r requirements.txt
```

To update the requirements file, run `pip freeze > requirements.txt`.

### Running the web scraper

With the virtual environment activated, run this command in the repository root:

```
python scraping/scrape.py
```

See options for logging by adding `-h` or `--help`.

## Sources

- Scrapy documentation: <https://docs.scrapy.org/en/latest/>
- Python `re` module documentation: <https://docs.python.org/3/library/re.html>
- Python `argparse` module documentation: <https://docs.python.org/3/library/argparse.html>
