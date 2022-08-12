# Course Grapher

## Overview

A program that parses the UC San Diego online course catalog (<https://ucsd.edu/catalog/front/courses.html>) and creates a graph of prerequisites. Courses are parsed and stored in a JSON file, organized by department. Then a network graph is generated with courses as nodes and prerequisite relationships forming edges.

## Development

### Getting started

In the repository root, create and activate a virtual environment:

```
python3 -m venv .venv
source .venv/bin/activate
```

Then install requirements:

```
pip install -r requirements.txt
```

To update the requirements file, run `pip freeze > requirements.txt`.

## Sources

- BeautifulSoup documentation: <https://www.crummy.com/software/BeautifulSoup/bs4/doc/>
- Python `re` module documentation: <https://docs.python.org/3/library/re.html>
- Python `json` module documentation: <https://docs.python.org/3/library/json.html>
- RealPython - BeautifulSoup tutorial: <https://realpython.com/beautiful-soup-web-scraper-python/>
- RealPython - JSON tutorial: <https://realpython.com/python-json/>
- NetworkX documentation: <https://networkx.org/documentation/stable/index.html>
- Plotly reference: <https://plotly.com/python/reference/index/>
- Towards Data Science - NetworkX and Plotly tutorial: <https://towardsdatascience.com/tutorial-network-visualization-basics-with-networkx-and-plotly-and-a-little-nlp-57c9bbb55bb9>
