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
#       "name": "...",
#       "desc": "...",
#       "prereqs": [            <-- outer array of AND
#         ["PRE 1", "PRE 2"],   <-- inner array of OR
#         ["REQ 10", "REQ 20"]  <-- etc.
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

# link set contains links to courses, faculty, degree programs contained in a
# <span> tag with class "courseFacLink" - we want the courses link
link_sets = soup.find_all('span', class_='courseFacLink')
for links in link_sets:
    # find an <a> tag (link) whose text contains "courses"
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

        dept_count += 1

print('Found', dept_count, 'departments')
print('Found', course_count, 'courses')
