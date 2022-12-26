from datetime import datetime
import json
import jsonlines
import logging
from metrics import ScrapingMetrics
from prerequisites_tree import ReqsDict


class Postprocessor:
    """
    Processes scraped data which has been written to disk into their final
    structure and format. The intermediate `.jsonl` files containing the
    original scraping output are left in place.

    Usage: Initialize, then call `run()`:
    ```
    postprocessor = Postprocessor()
    postprocessor.run()
    ```
    """

    def __init__(self, metrics: ScrapingMetrics) -> None:
        super().__init__()
        self.logger = logging.getLogger('postprocessor')
        self.metrics = metrics
        # maps department codes to department objects
        self.department_index: dict[str, dict] = {}
        # maps course codes to department codes
        self.course_index: dict[str, str] = {}
        # maps course codes to successor course codes (list of successors may
        # contain duplicates)
        self.course_successors: dict[str, list[str]] = {}

    def run(self) -> None:
        self.logger.info('Starting postprocessing step')
        self._read_departments()
        self._read_courses()
        self._write_department_index()
        self._rewrite_courses()
        self._write_statistics()
        self.logger.info('Postprocessing finished')

    def _read_departments(self):
        """
        Reads department information from `departments.jsonl` and populates
        `self.department_index`. In order to avoid large diffs, the entries are
        made in alphabetical order.
        """
        self.logger.info('Reading departments')
        dept_entries = []
        try:
            with jsonlines.open('intermediate/departments.jsonl', mode='r') as reader:
                for dept_obj in reader:
                    dept_entries.append((dept_obj['code'], dept_obj))
        except OSError as error:
            self.logger.error(
                'Error while reading departments:\n%s: %s', type(error), error)
        dept_entries = sorted(dept_entries, key=lambda x: x[0])
        self.department_index = dict(dept_entries)

    def _read_courses(self):
        """
        Reads course information from each department `.jsonl` file and
        populates `self.course_index`. In order to avoid large diffs, the
        entries are made in alphabetical order. Also sets the `numCourses` field
        on each department dictionary in `self.department_index` and updates
        `self.course_successors`.
        """
        self.logger.info('Reading courses')
        course_entries = []
        self.course_successors = {}
        for dept in self.department_index.keys():
            dept_courses = []
            try:
                with jsonlines.open(f'intermediate/{dept}.jsonl', mode='r') as reader:
                    for course_obj in reader:
                        code = course_obj['code']
                        has_anchor = 'anchor' in course_obj
                        course_entries.append((code, dept, has_anchor))
                        dept_courses.append(code)
                        self._process_successor(course_obj)
            except OSError as error:
                self.logger.error(
                    'Error while reading %s courses:\n%s: %s',
                    dept,
                    type(error),
                    error
                )
            self.department_index[dept]['courses'] = dept_courses
        course_entries = sorted(course_entries, key=lambda x: x[0])
        self.course_index = {}
        for code, dept, has_anchor in course_entries:
            if has_anchor or code not in self.course_index:
                self.course_index[code] = dept

    def _write_department_index(self):
        """
        Writes `self.department_index` to `departments.json`.
        """
        self.logger.info('Writing department index')
        try:
            with open('data/departments.json', mode='w') as file:
                json.dump(self.department_index, file, indent=2)
        except OSError as error:
            self.logger.error(
                'Error while writing departments:\n%s: %s', type(error), error)

    def _rewrite_courses(self):
        """
        Reads all course information again and rewrites it to the output
        directory as individual JSON files. If the same course code appears in
        multiple departments, the version from the department mapped to in
        `self.course_index` is considered the "authoritative" one, and only that
        version is written to JSON.
        """
        self.logger.info('Writing courses')
        writer = CourseWriter(self.course_successors)
        for dept in self.department_index.keys():
            try:
                with jsonlines.open(f'intermediate/{dept}.jsonl', mode='r') as reader:
                    for course_obj in reader:
                        code = course_obj['code']
                        if course_obj['dept'] != self.course_index[code]:
                            # skip if not the "authoritative" version
                            continue
                        writer.write(course_obj)
            except OSError as error:
                self.logger.error(
                    'Error while rewriting %s courses:\n%s: %s',
                    dept,
                    type(error),
                    error
                )

    def _write_statistics(self):
        """
        Writes `statistics.json` to the output directory.
        """
        self.logger.info('Writing statistics')
        try:
            with open('data/statistics.json', mode='w') as file:
                json.dump({
                    'timestamp': datetime.now().isoformat(timespec='minutes'),
                    'deptCount': self.metrics.get_departments(),
                    'courseCount': self.metrics.get_courses(),
                    'withPrereqsCount': self.metrics.get_with_prerequisites(),
                    'withCoreqsCount': self.metrics.get_with_corequisites(),
                    'withSuccessorsCount': self.metrics.get_with_successors()
                }, file, indent=2)
        except OSError as error:
            self.logger.error(
                'Error while writing statistics:\n%s: %s', type(error), error)

    def _process_successor(self, course: dict):
        """
        Appends the given course's code to the successors list of each of its
        prerequisite courses in `self.course_successors`.
        """
        if 'prereqs' not in course:
            return None
        prereqs = course['prereqs']
        prereqs_list = self._course_tree_to_list(prereqs)
        for prereq_code in prereqs_list:
            if prereq_code not in self.course_successors:
                self.course_successors[prereq_code] = []
                self.metrics.inc_with_successors()
            self.course_successors[prereq_code].append(course['code'])

    def _course_tree_to_list(self, tree: ReqsDict | str) -> list[str]:
        """
        Flattens the given prerequisite tree into a list of course codes.
        """
        if isinstance(tree, str):
            return [tree]
        result = []
        self._course_tree_to_list_helper(tree, result)
        return result

    def _course_tree_to_list_helper(
            self, tree: ReqsDict, result: list[str]) -> list[str]:
        for child in tree['courses']:
            if isinstance(child, str):
                result.append(child)
            else:
                self._course_tree_to_list_helper(child, result)


class CourseWriter:
    def __init__(self, successor_map: dict[str, list[str]]) -> None:
        super.__init__()
        self.logger = logging.getLogger('postprocessor.writer')
        self.successor_map = successor_map

    def write(self, course: dict) -> None:
        """
        Writes the given course object to output as JSON. If the course is
        actually a sequence of courses in one listing, then it is split up into
        individual courses, all of which get written to output. This method
        throws an exception if it encounters an error while writing files.
        """
        code: str = course['code']
        if code in self.successor_map:
            course['successors'] = self._sorted_unique(
                self.successor_map[code])
        filename = code.replace(' ', '_')
        with open(f'data/{filename}.json', mode='w') as file:
            json.dump(course, file, indent=2)

    def _sorted_unique(self, l: list) -> list:
        """
        Returns a copy of the given list in sorted order and containing each
        element exactly once.
        """
        l = sorted(l)
        i = 0
        while i < len(l) - 1:
            if l[i] == l[i + 1]:
                l.pop(i + 1)
            else:
                i += 1
        return l
