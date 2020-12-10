# Course Grapher

## Overview

A program that parses the UC San Diego online course catalog (<https://ucsd.edu/catalog/front/courses.html>) and creates a graph of prerequisites. Courses are parsed and stored in a JSON file, organized by department. Then a network graph is generated with courses as nodes and prerequisite relationships forming edges.

## TODO: How to use it

May create executables so it works without requiring user to install dependencies

## Sources

* BeautifulSoup documentation: <https://www.crummy.com/software/BeautifulSoup/bs4/doc/>
* Python `re` module documentation: <https://docs.python.org/3/library/re.html>
* Python `json` module documentation: <https://docs.python.org/3/library/json.html>
* RealPython - BeautifulSoup tutorial: <https://realpython.com/beautiful-soup-web-scraper-python/>
* RealPython - JSON tutorial: <https://realpython.com/python-json/>
* NetworkX documentation: <https://networkx.org/documentation/stable/index.html>
* Plotly Express documentation: <https://plotly.com/python/plotly-express/>
* Towards Data Science - NetworkX and Plotly tutorial: <https://towardsdatascience.com/tutorial-network-visualization-basics-with-networkx-and-plotly-and-a-little-nlp-57c9bbb55bb9>
