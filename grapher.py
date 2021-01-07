import sys
import json
import tkinter as tk

class MainView(tk.Frame):
    DEFAULT_MESSAGE = "Click on a course to view more info."
    def __init__(self, courses, depts, master=None):
        tk.Frame.__init__(self, master)
        self.master.title("Course Grapher")
        self.grid() # row 0, col 0 in top-level window
        self.create_widgets()
        self.courses = courses
        self.depts = depts
        self.display_courses()
        self.mouse_drag = False
        self.drag_start = None
        self.bind_listeners()

    def create_widgets(self):
        self.canvas = tk.Canvas(self, width=1000, height=800,
                                background="#ffffff")
        self.canvas.grid(row=0, column=0)
        panel = tk.Frame(self, width=300, height=800, background="#f0f0f0")
        panel.grid(row=0, column=1, sticky=tk.N+tk.E+tk.S+tk.W)
        panel.columnconfigure(0, minsize=300)

        # search box
        search_panel = tk.Frame(panel, height=30, background="#f0f0f0")
        search_panel.grid(row=0, column=0, sticky=tk.E+tk.W)
        search_text = tk.Label(search_panel,
                               text="Search for a department or course",
                               font=("Arial", 12), background="#f0f0f0")
        search_text.grid(row=0, column=0, columnspan=2, sticky=tk.W)
        self.search_box = tk.Entry(search_panel, font=("Arial", 12))
        self.search_box.grid(row=1, column=0)
        self.search_button = tk.Button(search_panel, text="Search",
                                       command=self.search)
        self.search_button.grid(row=1, column=1)

        # course info display
        self.title_label = tk.Label(panel, text=None,
                                    font=("Arial", 12, "bold"), justify=tk.LEFT,
                                    wraplength=300, background="#f0f0f0")
        self.title_label.grid(row=1, column=0, sticky=tk.W)
        self.desc_label = tk.Label(panel, text=MainView.DEFAULT_MESSAGE,
                                   font=("Arial", 12), justify=tk.LEFT,
                                   wraplength=300, background="#f0f0f0")
        self.desc_label.grid(row=2, column=0, sticky=tk.NW)
        self.course_button = tk.Button(panel, text="Open graph",
                                       command=self.open_graph,
                                       state=tk.DISABLED)
        self.course_button.grid(row=3, column=0)
        panel.rowconfigure(2, weight=1)

    def display_courses(self):
        curr_x, curr_y = 20, 50
        max_y = 760
        curr_letter = "A"
        def next_column():
            nonlocal curr_x, curr_y
            curr_x += 100
            curr_y = 50
        def draw_col_letter():
            self.canvas.create_text(curr_x - 10, 20, text=curr_letter,
                                    anchor=tk.NW, font=("Arial", 30))

        draw_col_letter()
        for dept in sorted(list(self.depts)):
            if dept[0] != curr_letter:
                curr_letter = dept[0]
                next_column()
                draw_col_letter()
            elif curr_y > max_y - 50:
                next_column()
                
            curr_y += 10
            self.canvas.create_text(curr_x - 10, curr_y, text=dept, anchor=tk.W,
                                    font=("Arial", 20))
            curr_y += 12
            for course in self.depts[dept]:
                course_dict = self.courses[course]
                size = 0
                if "leadsto" in course_dict:
                    size = len(course_dict["leadsto"])
                r = MainView.radius_from_size(size)
                delta_y = max(r, 4)
                curr_y += delta_y
                self.draw_course(curr_x, curr_y, r, course)
                curr_y += delta_y + 2
                if curr_y > max_y:
                    next_column()
            # temp
            break

    def bind_listeners(self):
        self.canvas.bind("<Button-1>", self.mouse_down)
        self.canvas.bind("<Motion>", self.mouse_move)
        self.canvas.bind("<ButtonRelease-1>", self.mouse_up)

    def draw_circle(self, x, y, radius, color="#78b6f5", hover_color="#659acf",
                    tags=None):
        self.canvas.create_oval(x - radius, y - radius, x + radius, y + radius,
                                fill=color, activefill=hover_color, outline="",
                                tags=tags)

    def draw_course(self, x, y, radius, label):
        self.draw_circle(x, y, radius=radius, tags=label)
        self.canvas.create_text(x + radius + 2, y, text=label, anchor=tk.W,
                                font=("Arial", 10))

    def radius_from_size(size):
        if size <= 20:
            return size + 2
        elif size < 200:
            return 0.32 * (size - 200) + 80
        else:
            return 80

    def mouse_down(self, event):
        mouse_x, mouse_y = event.x, event.y
        def start_drag():
            self.mouse_drag = True
            self.drag_start = (mouse_x, mouse_y)
        selected = self.canvas.find_overlapping(mouse_x, mouse_y,
                                                mouse_x + 1, mouse_y + 1)
        if len(selected) > 0:
            tags = self.canvas.gettags(selected[0])
            if len(tags) > 1:
                # display_course(tags[0] + " " + tags[1])
                print(tags)
            else:
                start_drag()
        else:
            start_drag()

    def mouse_move(self, event):
        if self.mouse_drag:
            dx = event.x - self.drag_start[0]
            dy = event.y - self.drag_start[1]
            self.canvas.move("all", dx, dy)
            self.drag_start = (event.x, event.y)

    def mouse_up(self, event):
        self.mouse_drag = False

    def search(self):
        print("Search")

    def open_graph(self):
        print("Open graph")

def read_courses():
    courses = None

    # read from courses.json
    try:
        with open("courses.json", "r") as file:
            courses = json.load(file)
    except FileNotFoundError:
        sys.exit("Could not find courses.json")
    except json.JSONDecodeError:
        sys.exit("Malformed JSON in courses.json")

    return courses

def group_by_dept(courses):
    depts = {}
    for course in courses:
        course_dept = courses[course]["dept"]
        if course_dept in depts:
            depts[course_dept].append(course)
        else:
            depts[course_dept] = [course]
    return depts

courses = read_courses()
depts = group_by_dept(courses)
app = MainView(courses, depts)
app.mainloop()
