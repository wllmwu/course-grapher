import requests
from bs4 import BeautifulSoup
import re
import json

CCF_PAGE_URL = 'https://ucsd.edu/catalog/front/courses.html'
BASE_URL = 'https://ucsd.edu/catalog/'

dept_count = 0
course_count = 0

# courses_dict JSON format:
# {
#   "DEPT": {                   <-- dept object
#     "DEPT 1": {               <-- course object
#       "title": "...",
#       "desc": "...",
#       "prereqs": [
#         "PRE 1", "PRE 2", ... <-- all prerequisites, no clustering
#       ]
#     },
#     "DEPT 100": {             <-- course object etc.
#       ...
#     }
#   },
#   "STUF": {                   <-- dept object etc.
#     ...
#   }
# }
courses_dict = {}

def parse_links():
    global courses_dict, dept_count

    ccf_page = requests.get(CCF_PAGE_URL)
    soup = BeautifulSoup(ccf_page.content, 'html.parser')

    # link set contains links to courses, faculty, degree programs contained in a
    # <span> tag with CSS class "courseFacLink"--we want the courses link
    link_sets = soup.find_all('span', class_='courseFacLink')
    for links in link_sets:
        # find an <a> tag (link) whose display text contains "courses"
        courses_link = links.find('a',
                                  string=lambda text: 'courses' in text
                                      if text is not None else False)
        if courses_link is not None:
            # grab value of the "href" attribute (the URL of the desired page)
            courses_url = courses_link['href']
            # it starts with "../" so slice that out
            courses_url = courses_url[3:]
            # then concatenate it with the base URL to get the full dept page URL
            courses_url = BASE_URL + courses_url

            #print(courses_url)

            # parse that page and add results to courses_dict
            (dept_abbr, dept_dict) = parse_dept_page(courses_url)
            courses_dict[dept_abbr] = dept_dict
            dept_count += 1

            # temp
            if dept_count == 3:
                break

def parse_dept_page(url):
    global course_count

    # parse dept abbreviation
    abbr_start = url.rfind('/') + 1
    abbr_end = url.rfind('.')
    dept_abbr = url[abbr_start:abbr_end]

    # will return tuple (dept_abbr, dept_dict)
    dept_dict = {}

    dept_page = requests.get(url)
    dept_soup = BeautifulSoup(dept_page.content, 'html.parser')

    # parse course listings--find tags with CSS class "course-name"
    course_names = dept_soup.find_all(class_='course-name')
    for name_soup in course_names:
        (course_code, course_dict) = parse_course(name_soup)
        dept_dict[course_code] = course_dict
        course_count += 1

    return (dept_abbr, dept_dict)

def parse_course(name_soup):
    # text should be of the form "DEPT ###. Course Title (#)"
    name_text = name_soup.get_text()

    # parse course code and title
    index1 = name_text.find('.')
    index2 = name_text.find('(')
    if index1 == -1 or index2 == -1:
        print('Bad format course name:', name_text)
    course_code = name_text[:index1] # "DEPT ###"
    course_title = name_text[index1+1:index2].strip() # "Course Title"
    course_title = course_title.replace('\n', '')

    # will return tuple (course_code, course_dict)
    course_dict = {'title': course_title}

    #print(course_code, ':', course_title)

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
        if prereq_label is not None:
            # get the text that comes after the label and parse it
            prereq_text = str(prereq_label.next_sibling)
            print(prereq_text)
            course_prereqs = parse_prerequisites(prereq_text)
            course_dict['prereqs'] = course_prereqs

    if 'prereqs' not in course_dict:
        course_dict['prereqs'] = []

    return (course_code, course_dict)

def parse_prerequisites(text):
    # look for strings like "DEPT 5" or "ABC 100A"
    return re.findall('[A-Z]+ [0-9]+[A-Z]?', text)

parse_links()

print('Found', dept_count, 'departments')
print('Found', course_count, 'courses')
