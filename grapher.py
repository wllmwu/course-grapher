import sys
import json
import tkinter as tk

courses_dict = {}

# read from courses.json
try:
    with open("courses.json", "r") as file:
        courses_dict = json.load(file)
except FileNotFoundError:
    sys.exit("Could not find courses.json")
except json.JSONDecodeError:
    sys.exit("Malformed JSON in courses.json")

# group by dept
depts = {}
for course in courses_dict:
    course_dept = courses_dict[course]["dept"]
    if course_dept in depts:
        depts[course_dept].append(course)
    else:
        depts[course_dept] = [course]

# set up canvas
window = tk.Tk()
window.title("Course Grapher")
canvas = tk.Canvas(window, width=1000, height=800, background="white")
canvas.pack()

def draw_circle(x, y, radius, color="#78b6f5", hover_color="#659acf", tags=None):
    canvas.create_oval(x - radius, y - radius, x + radius, y + radius,
                       fill=color, activefill=hover_color, outline="",
                       tags=tags)

def draw_course(x, y, radius, label):
    draw_circle(x, y, radius=radius, tags=label)
    canvas.create_text(x + radius + 2, y, text=label, anchor=tk.W,
                       font=("Arial", 10))

def radius_from_size(size):
    if size >= 200:
        return 20
    a = (size - 200) / 69
    return int(75 - a ** 4)

# display all courses
curr_x = 50
for dept in depts:
    canvas.create_text(curr_x, 25, text=dept, font=("Arial", 20))
    curr_y = 50
    for course in depts[dept]:
        course_dict = courses_dict[course]
        size = 0
        if "leadsto" in course_dict:
            size = len(course_dict["leadsto"])
        r = radius_from_size(size)
        curr_y += r
        draw_course(curr_x, curr_y, r, course)
        curr_y += r + 2
    curr_x += 100

window.mainloop()
