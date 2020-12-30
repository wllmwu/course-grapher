import requests
from bs4 import BeautifulSoup
import re
import json

CCF_PAGE_URL = "https://ucsd.edu/catalog/front/courses.html"
BASE_URL = "https://ucsd.edu/catalog/"

COURSE_CODE_REGEX = "[A-Z]{2,} [0-9]+[A-Z]{,2}(?:-[A-Z])?"
WHITESPACE_REGEX = r"\s+"
NUMBER_REGEX = "[0-9]+"
AND_REGEX = r"\s*and\s*"
OR_REGEX = r"\s*or\s*"
course_code_matcher = re.compile(COURSE_CODE_REGEX)
whitespace_matcher = re.compile(WHITESPACE_REGEX)
number_matcher = re.compile(NUMBER_REGEX)
and_matcher = re.compile(AND_REGEX)
or_matcher = re.compile(OR_REGEX)

dept_count = 0
#course_count = 0

# courses_dict JSON format:
# {
#   "DEPT 1": {               <-- course object
#     "title": "...",
#     "desc": "...",
#     "dept": "DEPT",
#     "prereqs": [            <-- groups joined by AND
#       ["PRE 1", "PRE 2"],   <-- prereq OR group
#       ["STUF 5", "STUF 99"],
#       "SMTH 1",             <-- single prereq (i.e. no alternatives)
#       ...
#     ],
#     "leadsto": [            <-- course is a prereq to these courses
#       "DEPT 100",
#       "STUF 20",
#       ...
#     ]
#   },
#   "DEPT 100": {             <-- course object etc.
#     ...
#   },
#   ...
# }
courses_dict = {}

def parse_links():
    global courses_dict, dept_count

    print("Parsing list of departments...")
    ccf_page = requests.get(CCF_PAGE_URL)
    soup = BeautifulSoup(ccf_page.content, "html.parser")

    # link set contains links to courses, faculty, degree programs contained in a
    # <span> tag with CSS class "courseFacLink"--we want the courses link
    link_sets = soup.find_all("span", class_="courseFacLink")
    for links in link_sets:
        # find an <a> tag (link) whose display text contains "courses"
        courses_link = links.find("a",
                                  string=lambda text: "courses" in text
                                      if text is not None else False)
        if courses_link is not None:
            # grab value of the "href" attribute (the URL of the desired page)
            courses_url = courses_link["href"]
            # it starts with "../" so slice that out
            courses_url = courses_url[3:]
            # then concatenate it with the base URL to get the full dept page URL
            courses_url = BASE_URL + courses_url

            #print(courses_url)

            # parse that page and add results to courses_dict
            dept_dict = parse_dept_page(courses_url)
            if dept_dict is not None:
                for course_code, course_dict in dept_dict.items():
                    if course_code not in courses_dict:
                        courses_dict[course_code] = course_dict
                print("  > Found", len(dept_dict), "courses,",
                      len(courses_dict), "total")
            dept_count += 1

            # temp
            #if dept_count == 50:
            #    break

def parse_dept_page(url):
    # parse dept abbreviation
    abbr_start = url.rfind("/") + 1
    abbr_end = url.rfind(".")
    dept_abbr = url[abbr_start:abbr_end]

    dept_dict = {}

    print("Parsing courses in department", dept_abbr)
    dept_page = requests.get(url)
    dept_soup = BeautifulSoup(dept_page.content, "html.parser")

    # parse course listings--find tags with CSS class "course-name"
    course_names = dept_soup.find_all(class_="course-name")
    for name_soup in course_names:
        course_data = parse_course(name_soup) # expecting (code, dict)
        if course_data is not None:
            (course_code, course_dict) = course_data
            number = int(number_matcher.findall(course_code)[0])
            if number >= 200: # ignore non-undergraduate courses
                break
            course_dict["dept"] = dept_abbr
            dept_dict[course_code] = course_dict

    if len(dept_dict) == 0:
        return None
    return dept_dict

def parse_course(name_soup):
    # text should generally be of the form "DEPT ###. Course Title (#)"
    # of course, there are many inconsistencies
    name_text = name_soup.get_text()
    name_text = whitespace_matcher.sub(" ", name_text)

    # parse course code and title
    code_match = course_code_matcher.search(name_text) # returns a Match object
    if code_match is not None:
        course_code = code_match.group()
        title_start = code_match.end() + 2 # skip character after code
        title_end = name_text.find("(")
        if title_end == -1:
            title_end = len(name_text)
        course_title = name_text[title_start:title_end].strip().replace("\n", "")
    else:
        print("Bad format course code:", name_text)
        return None

    # will return tuple (course_code, course_dict)
    course_dict = {"title": course_title}

    #print(course_code, ':', course_title)

    if name_soup.next_sibling is None:
        print("Couldn't find description for", course_code)
        return None

    # parse course description and prerequisites--tags and CSS classes are
    # inconsistent, so we have to traverse the DOM manually
    desc_soup = name_soup.next_sibling.next_sibling # next_sibling is
    # actually the newline after the closing tag, and the next next_sibling
    # is the tag containing the description
    if desc_soup is not None:
        course_desc = desc_soup.get_text()
        #print(course_desc)

        # get the <strong> tag within the description--this is the label
        # "Prerequisites:" or occasionally "Corequisite:"
        prereq_label = desc_soup.strong
        if prereq_label is not None and "req" in prereq_label.get_text():
            # get the text that comes after the label and parse it
            prereq_text = str(prereq_label.next_sibling)
            course_prereqs = parse_prerequisites(prereq_text)
            if len(course_prereqs) > 0:
                course_dict["prereqs"] = course_prereqs

    return (course_code, course_dict)

def parse_prerequisites(text):
    search_text = text

    # ignore anything before first course code
    first_match = course_code_matcher.search(search_text)
    if first_match is None:
        return []
    else:
        search_text = search_text[first_match.start():]

    # ignore anything after first semicolon or period
    end_index = find_stop_punct(search_text)
    if end_index != -1:
        search_text = search_text[:end_index]

    # ignore anything after last course code
    last_match = None
    for match in course_code_matcher.finditer(search_text):
        last_match = match
    if last_match is None:
        return []
    else:
        search_text = search_text[:last_match.end()]

    # replace any commas with appropriate conjunction
    comma_index = search_text.rfind(",")
    if comma_index != -1:
        or_match = or_matcher.match(search_text[comma_index+1:]) # match() must
        # start at beginning
        if or_match is not None:
            search_text = search_text.replace(",", " or")
        else:
            # by default, assume commas represent "and"
            search_text = search_text.replace(",", " and")

    # build list of prereqs
    prereqs = []
    for group in and_matcher.split(search_text):
        code_list = course_code_matcher.findall(group)
        if len(code_list) == 1:
            code = code_list[0]
            if code[-2] == "-":
                prereqs[len(prereqs):] = expand_course_range(code)
            else:
                prereqs.append(code)
        elif len(code_list) > 1:
            i = 0
            while i < len(code_list):
                code = code_list[i]
                if code[-2] == "-":
                    expanded = expand_course_range(code)
                    code_list[i:i+1] = expanded
                    i += len(expanded)
                else:
                    i += 1
            prereqs.append(code_list)
    return prereqs

def find_stop_punct(string):
    for i in range(len(string)):
        if string[i] == ";" or string[i] == ".":
            return i
    return -1

def expand_course_range(code):
    expanded = []
    base, start_letter, end_letter = code[:-3], code[-3], code[-1]
    for letter in range(ord(start_letter), ord(end_letter) + 1):
        expanded.append(base + chr(letter))
    return expanded

def process_successors():
    global courses_dict
    print("Processing successors...")
    for course_code, course_dict in courses_dict.items():
        if "prereqs" in course_dict:
            prereqs = course_dict["prereqs"]
            for item in prereqs:
                if isinstance(item, list):
                    for prereq in item:
                        set_successor(prereq, course_code)
                else:
                    set_successor(item, course_code)

def set_successor(prereq_code, successor_code):
    global courses_dict
    prereq_dict = courses_dict.get(prereq_code)
    if prereq_dict is not None:
        if "leadsto" in prereq_dict:
            prereq_dict["leadsto"].append(successor_code)
        else:
            prereq_dict["leadsto"] = [successor_code]

parse_links()

print("Found", dept_count, "departments")
print("Found", len(courses_dict), "courses total")

process_successors()

with open("courses.json", "w") as file:
    json.dump(courses_dict, file, indent=1, separators=(",", ":"))

print("Done")
