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
    if size <= 20:
        return size + 2
    elif size < 200:
        return 0.32 * (size - 200) + 80
    else:
        return 80

mouse_drag = False
drag_start = None

def mouse_down(event):
    mouse_x, mouse_y = event.x, event.y
    selected = canvas.find_overlapping(mouse_x, mouse_y,
                                       mouse_x + 1, mouse_y + 1)
    if len(selected) > 0:
        tags = canvas.gettags(selected[0])
        if len(tags) > 1:
            # display_course(tags[0] + " " + tags[1])
            print(tags)
        else:
            start_drag(mouse_x, mouse_y)
    else:
        start_drag(mouse_x, mouse_y)

def start_drag(x, y):
    global mouse_drag, drag_start
    mouse_drag = True
    drag_start = (x, y)

def mouse_move(event):
    global mouse_drag, drag_start
    if mouse_drag:
        dx = event.x - drag_start[0]
        dy = event.y - drag_start[1]
        canvas.move("all", dx, dy)
        drag_start = (event.x, event.y)

def mouse_up(event):
    global mouse_drag
    mouse_drag = False

# display all courses
curr_x, curr_y = 20, 50
max_y = 1000
def next_column():
    global curr_x, curr_y
    curr_x += 100
    curr_y = 50

for dept in depts:
    if curr_y > max_y - 50:
        next_column()
    curr_y += 10
    canvas.create_text(curr_x - 10, curr_y, text=dept, anchor=tk.W,
                       font=("Arial", 20))
    curr_y += 12
    for course in depts[dept]:
        course_dict = courses_dict[course]
        size = 0
        if "leadsto" in course_dict:
            size = len(course_dict["leadsto"])
        r = radius_from_size(size)
        delta_y = max(r, 4)
        curr_y += delta_y
        draw_course(curr_x, curr_y, r, course)
        curr_y += delta_y + 2
        if curr_y > max_y:
            next_column()

canvas.bind("<Button-1>", mouse_down)
canvas.bind("<Motion>", mouse_move)
canvas.bind("<ButtonRelease-1>", mouse_up)

window.mainloop()
