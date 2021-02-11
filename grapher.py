import sys
import json
import tkinter as tk

class MainView(tk.Frame):
    WINDOW_TITLE = "Course Grapher"
    DEFAULT_MESSAGE = "Click on a course to view more info."
    CANVAS_WIDTH = 1000
    PANEL_WIDTH = 300
    WINDOW_HEIGHT = 800

    def __init__(self, courses, depts, master=None):
        tk.Frame.__init__(self, master)
        self.master.title(self.WINDOW_TITLE)
        self.grid() # row 0, col 0 in top-level window
        self.create_widgets()
        self.courses = courses
        self.current_course = None
        self.depts = depts
        self.display_courses()
        self.mouse_drag = False
        self.drag_start = None
        self.bind_listeners()

    #### initialization ####

    def create_widgets(self):
        self.canvas = tk.Canvas(self, width=self.CANVAS_WIDTH,
                                height=self.WINDOW_HEIGHT, background="#ffffff")
        self.canvas.grid(row=0, column=0)
        panel = tk.Frame(self, width=self.PANEL_WIDTH, height=self.WINDOW_HEIGHT,
                         background="#f0f0f0")
        panel.grid(row=0, column=1, sticky=tk.N+tk.E+tk.S+tk.W)
        panel.columnconfigure(0, minsize=self.PANEL_WIDTH)

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
        self.bind_all("<Return>", self.search)

        # course info display
        wrap = self.PANEL_WIDTH - 10
        self.title_label = tk.Label(panel, text=None,
                                    font=("Arial", 12, "bold"), justify=tk.LEFT,
                                    wraplength=wrap, background="#f0f0f0")
        self.title_label.grid(row=1, column=0, sticky=tk.W)
        self.desc_label = tk.Label(panel, text=self.DEFAULT_MESSAGE,
                                   font=("Arial", 12), justify=tk.LEFT,
                                   wraplength=wrap, background="#f0f0f0")
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
                                    font=("Arial", 20), tags=dept)
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
            #break

    def bind_listeners(self):
        self.canvas.bind("<Button-1>", self.mouse_down)
        self.canvas.bind("<Motion>", self.mouse_move)
        self.canvas.bind("<ButtonRelease-1>", self.mouse_up)

    #### drawing ####

    def draw_circle(self, x, y, radius, color="#78b6f5", hover_color="#659acf",
                    tags=None):
        self.canvas.create_oval(x - radius, y - radius, x + radius, y + radius,
                                fill=color, activefill=hover_color, outline="",
                                tags=tags)

    def draw_course(self, x, y, radius, code):
        code_nospace = code.replace(" ", "_")
        tags = ("course", code_nospace)
        self.draw_circle(x, y, radius=radius, tags=tags)
        offset = radius + 2
        if radius <= 3:
            self.draw_circle(x, y, radius=4, color=None, tags=tags)
            offset += 3
        self.canvas.create_text(x + offset, y, text=code, anchor=tk.W,
                                font=("Arial", 10), tags=code_nospace)

    def radius_from_size(size):
        if size <= 20:
            return size + 2
        elif size < 100:
            return 0.32 * size + 16
        else:
            return 48

    def clear_highlight(self):
        self.canvas.delete("hl")

    def highlight_items(self, canvas_tag):
        # draw a yellow rectangle below the objects with the given tag
        x1, y1, x2, y2 = self.canvas.bbox(canvas_tag)
        rect = self.canvas.create_rectangle(x1, y1, x2, y2, fill="#FFFF00",
                                            outline="", tags="hl")
        self.canvas.tag_lower(rect, canvas_tag)

        # center this rectangle on screen if not visible
        if x1 < 0 or x2 > 1000 or y1 < 0 or y2 > 800:
            center_x = (x1 + x2) // 2
            center_y = (y1 + y2) // 2
            self.canvas.move("all", 500 - center_x, 400 - center_y)

    #### displaying info ####

    def show_title(self, title):
        self.title_label.configure(text=title)

    def show_desc(self, desc):
        self.desc_label.configure(text=desc)

    def set_button_active(self, active):
        self.course_button.configure(state=tk.NORMAL if active else tk.DISABLED)

    def display_course(self, code):
        self.current_course = code
        course_dict = self.courses[code]

        title = code + ". " + course_dict["title"]
        if "units" in course_dict:
            title += " (" + course_dict["units"] + ")"
        self.show_title(title)

        if "desc" in course_dict:
            self.show_desc(course_dict["desc"])

        self.set_button_active(True)

    def reset_panel(self):
        self.current_course = None
        self.show_title("")
        self.show_desc(self.DEFAULT_MESSAGE)
        self.set_button_active(False)

    #### mouse event handlers ####

    def mouse_down(self, event):
        mouse_x, mouse_y = event.x, event.y
        def start_drag():
            self.mouse_drag = True
            self.drag_start = (mouse_x, mouse_y)
        selected = self.canvas.find_overlapping(mouse_x, mouse_y,
                                                mouse_x + 1, mouse_y + 1)
        if len(selected) > 0:
            tags = self.canvas.gettags(selected[-1])
            if tags is not None and tags[0] == "course":
                self.display_course(tags[1].replace("_", " "))
                self.clear_highlight()
                self.highlight_items(tags[1])
                #print(tags)
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

    #### button event handlers ####

    def search(self, event=None):
        #print("Search " + self.search_box.get())
        query = self.search_box.get()
        self.show_title("")
        self.clear_highlight()
        if query is not None and len(query) > 0:
            query = query.strip().upper().replace(" ", "_")
            self.reset_panel()
            if len(self.canvas.find_withtag(query)) > 0:
                self.highlight_items(query)
            else:
                self.show_title("No results")

    def open_graph(self):
        print("Open graph " + self.current_course)
        GraphView(self.courses, self.depts)

class GraphView(MainView):
    def __init__(self, courses, depts):
        window = tk.Toplevel()
        super().__init__(courses, depts, master=window)

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
