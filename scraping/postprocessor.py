import json
import jsonlines
import logging
import os


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

    def __init__(self) -> None:
        super().__init__()
        self.logger = logging.getLogger('postprocessor')
        # maps department codes to department objects
        self.department_index: dict[str, dict] = {}
        # maps course codes to department codes
        self.course_index: dict[str, str] = {}

    def run(self) -> None:
        self.logger.info('Starting postprocessing step')
        self._read_departments()
        self._read_courses()
        self._write_department_index()
        self._rewrite_courses()
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
        on each department dictionary in `self.department_index`.
        """
        self.logger.info('Reading courses')
        course_entries = []
        for dept in self.department_index.keys():
            dept_courses = []
            try:
                with jsonlines.open(f'intermediate/{dept}.jsonl', mode='r') as reader:
                    for course_obj in reader:
                        code = course_obj['code']
                        has_anchor = 'anchor' in course_obj
                        course_entries.append((code, dept, has_anchor))
                        dept_courses.append(code)
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
        for dept in self.department_index.keys():
            try:
                with jsonlines.open(f'intermediate/{dept}.jsonl', mode='r') as reader:
                    for course_obj in reader:
                        code = course_obj['code']
                        if course_obj['dept'] != self.course_index[code]:
                            # skip if not the "authoritative" version
                            continue
                        filename = course_obj['code'].replace(' ', '_')
                        with open(f'data/{filename}.json', mode='w') as file:
                            json.dump(course_obj, file, indent=2)
            except OSError as error:
                self.logger.error(
                    'Error while rewriting %s courses:\n%s: %s',
                    dept,
                    type(error),
                    error
                )
