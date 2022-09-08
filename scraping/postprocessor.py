import json
import jsonlines
import logging
import os


class Postprocessor:
    def __init__(self) -> None:
        super().__init__()
        self.logger = logging.getLogger('postprocessor')

    def run(self) -> None:
        self.logger.info('Starting postprocessing step')
        department_entries = []
        course_entries = []
        try:
            with os.scandir('data') as iterator:
                for entry in iterator:
                    if entry.is_file() and entry.name.endswith('.jsonl'):
                        dept_info, codes = self._process_data_file(
                            f'data/{entry.name}')
                        if dept_info is None:
                            continue
                        department_entries.append(
                            (dept_info['code'], dept_info))
                        for code, has_anchor in codes:
                            course_entries.append(
                                (code, dept_info['code'], has_anchor))
        except OSError as error:
            self.logger.error(
                'Failed to scan output directory: %s: %s', type(error), error)
        else:
            self._write_index(department_entries, course_entries)
        self.logger.info('Postprocessing finished')

    def _process_data_file(
            self, path: str) -> tuple[dict, list[tuple[str, bool]]]:
        self.logger.info('Processing %s', path)
        department_info = None
        course_codes = []
        try:
            with jsonlines.open(path, mode='r') as reader:
                for obj in reader:
                    if department_info is None:
                        department_info = obj
                    else:
                        has_anchor = 'anchor' in obj
                        course_codes.append((obj['code'], has_anchor))
        except OSError as error:
            self.logger.error(
                'Failed to process data file at %s: %s: %s',
                path,
                type(error),
                error
            )
        return (department_info, course_codes)

    def _write_index(self, dept_entries: list[tuple[str, dict]],
                     course_entries: list[tuple[str, str, bool]]) -> None:
        self.logger.info('Writing to index file')
        # since data files may be read in arbitrary order, sort entries
        # alphabetically to avoid large diffs between runs
        def key_func(entry): return entry[0]
        dept_entries = sorted(dept_entries, key=key_func)
        course_entries = sorted(course_entries, key=key_func)
        depts_index = dict(dept_entries)
        courses_index = {}
        for code, dept, has_anchor in course_entries:
            if has_anchor or code not in courses_index:
                courses_index[code] = dept
        index = {
            'departments': depts_index,
            'courses': courses_index
        }
        try:
            with open('data/index.json', mode='w') as file:
                json.dump(index, file, indent=2)
        except OSError as error:
            self.logger.error(
                'Failed to write index file: %s: %s', type(error), error)
