import requests
from bs4 import BeautifulSoup
import json

CCF_PAGE_URL = 'https://ucsd.edu/catalog/front/courses.html'
BASE_URL = 'https://ucsd.edu/catalog/'

ccf_page = requests.get(CCF_PAGE_URL)
soup = BeautifulSoup(ccf_page.content, 'html.parser')

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

def parse_dept(url):
    global courses_dict, course_count

    dept_page = requests.get(url)
    dept_soup = BeautifulSoup(dept_page.content, 'html.parser')

    # parse dept abbreviation (to use as key in courses_dict)
    url_start = url.rfind('/') + 1
    url_end = url.rfind('.')
    dept_abbr = url[url_start:url_end]

    # parse course listings:
    # find tags with CSS classes "course-name" and "course-descriptions"--
    # tags themselves are not all consistent, mostly <p> but some <span>
    course_names = dept_soup.find_all(class_='course-name')
#    course_descs = dept_soup.find_all(class_='course-descriptions')

    # zip the two lists together, hoping they match up
#    if len(course_names) != len(course_descs):
#        print('Mismatched lists for', dept_abbr, ':')
#        print('  Found', len(course_names), 'names and', len(course_descs),
#              'descriptions')
#    for name_soup, desc_soup in zip(course_names, course_descs):
    for name_soup in course_names:
        # name should be of the form "DEPT ###. Course Title (#)"
        name_text = name_soup.get_text()

        # parse course code and title
        index1 = name_text.find('.')
        index2 = name_text.find('(')
        if index1 == -1 or index2 == -1:
            print('Bad format course name:', name_text)
        course_code = name_text[:index1] # "DEPT ###"
        course_title = name_text[index1+1:index2].strip() # "Course Title"
        course_title = course_title.replace('\n', '')
        print(course_code, ':', course_title)

        # parse course description
        desc_soup = name_soup.next_sibling.next_sibling # next_sibling is
        # actually the newline after the closing tag, and the next next_sibling
        # is the tag containing the description
        if desc_soup is not None:
            course_desc = desc_soup.get_text()
            print('  Description found')

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
        # then concatenate it with the base URL to get the full page URL
        courses_url = BASE_URL + courses_url

        #print(courses_url)

        dept_count += 1
        parse_dept(courses_url)
        break

print('Found', dept_count, 'departments')
print('Found', course_count, 'courses')
