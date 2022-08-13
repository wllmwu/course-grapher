import re


_course_code_matcher = re.compile(
    r'(?P<subject>[A-Z]{2,})\)? (?P<number>[0-9]+[A-Z]*)(?P<ignore>/[A-Z]{2,} [0-9]+[A-Z]*)*[^-]')
_crosslisted_same_number_matcher = re.compile(
    r'(?P<subject>[A-Z]{2,})(?P<ignore>/[A-Z]{2,})+ (?P<number>[0-9]+[A-Z]*)')
_crosslisted_same_department_matcher = re.compile(
    r'(?P<subject>[A-Z]{2,}) (?P<number>[0-9]+[A-Z]*)(?P<ignore>/[0-9]+[A-Z]*)+')
_units_matcher = re.compile(r'\((?P<units>.+?)\)')


class CourseInfoParser:
    def __init__(self, logger, metrics):
        super().__init__()
        self.logger = logger
        self.metrics = metrics

    def parse_course(self, title_line):
        title_line = title_line.strip()
        code_match = _course_code_matcher.match(title_line)
        if code_match is None:
            code_match = _crosslisted_same_number_matcher.match(title_line)
        if code_match is None:
            code_match = _crosslisted_same_department_matcher.match(title_line)
        if code_match is None:
            self.logger.error(
                'Failed to match course code in "%s"', title_line)
            self.metrics.inc_code_match_failures()
            return None
        subject, number, ignore = code_match.group(
            'subject', 'number', 'ignore')
        if ignore is not None:
            self.logger.warning('Ignored crosslisting(s) in "%s"', title_line)
            self.metrics.inc_ignored_crosslistings()
        title_start = code_match.end()

        units_match = _units_matcher.search(title_line)
        if units_match is not None:
            units = units_match.group('units')
            title_end = units_match.start()
        else:
            self.logger.warning('Missing units in "%s"', title_line)
            self.metrics.inc_missing_units()
            units = '?'
            title_end = len(title_line)

        title = title_line[title_start:title_end].strip(' .:')
        return (subject, number, title, units)
