import sys
import json
import networkx as nx
import plotly.graph_objects as go

courses_dict = {}

# read from courses.json
try:
    with open("courses.json", "r") as file:
        courses_dict = json.load(file)
except FileNotFoundError:
    sys.exit("Could not find courses.json")
except json.JSONDecodeError:
    sys.exit("Malformed JSON in courses.json")

courses_graph = nx.Graph()

def populate_graph():
    global courses_dict, courses_graph

    # add nodes
    for dept_dict in courses_dict:
        for course_code in dept_dict:
            courses_graph.add_node(course_code, size=1)

    # add edges
    for dept_dict in courses_dict:
        for course_code, course_dict in dept_dict.items():
            if "prereqs" in course_dict:
                for prereq_code in course_dict["prereqs"]:
                    courses_graph.add_edge(course_code, prereq_code)
                    # also increment size of the prereq node
                    if prereq_code in courses_graph:
                        courses_graph[prereq_code]["size"] += 1
