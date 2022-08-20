import re
from utils import splice


_course_code_matcher = re.compile(
    r'(?P<subject>[A-Z]{2,}) (?P<number>[0-9]+[A-Z]*)(?P<ignore>/[A-Z]{2,} [0-9]+[A-Z]*)*[.: ]')
_crosslisted_same_number_matcher = re.compile(
    r'(?P<subject>[A-Z]{2,})(?P<ignore>/[A-Z]{2,})+ (?P<number>[0-9]+[A-Z]*)')
_crosslisted_same_department_matcher = re.compile(
    r'(?P<subject>[A-Z]{2,}) (?P<number>[0-9]+[A-Z]*)(?P<ignore>/[0-9]+[A-Z]*)+')
_sequence_matcher = re.compile(
    r'(?P<subject>[A-Z]{2,}) (?P<number>[0-9]+[A-Z]*([-\u2013][0-9A-Z]+)+)(?P<ignore>)')
_linguistics_matcher = re.compile(
    r'Linguistics(/[A-Za-z ]+)? \((?P<subject>[A-Z]{2,})\) (?P<number>[0-9]+[A-Z]*)(?P<ignore>)')
_units_matcher = re.compile(r'\((?P<units>.+?)\)')

_prerequisites_matcher = re.compile(
    r'([Pp]re|[Cc]o)-?requisites: .*?(?P<prereqs>[A-Z]{2,} [0-9]+[A-Z]*[^\.;]*)')
_prerequisites_end_matcher = re.compile(
    r'.*[A-Z]{2,} [0-9]+[A-Z]*([-\u2013][0-9A-Z]+| (and|or) [0-9]+[A-Z]*)*')
_inner_or_comma_list_matcher = re.compile(
    r'\(.+(?P<commas>(, [^,]+)+),? or .+\)')
_omitted_subject_matcher = re.compile(
    r'(?P<subject>[A-Z]{2,}) [0-9]+[A-Z]*( (and|or) [0-9]+[A-Z]*)+')

_delimiter_matcher = re.compile(r'[\.;]')
_recommended_matcher = re.compile(r'[Rr]ecommended')
_single_code_matcher = re.compile(r'[A-Z]{2,} [0-9]+[A-Z]*')


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
            code_match = _sequence_matcher.match(title_line)
            if code_match is not None:
                self.logger.info('Found sequence listing in "%s"', title_line)
                self.metrics.inc_sequence_listings()
        if code_match is None:
            code_match = _linguistics_matcher.match(title_line)
        if code_match is None:
            self.logger.error(
                'Failed to match course code in "%s"', title_line)
            self.metrics.inc_code_match_failures()
            return None
        subject, number, ignore = code_match.group(
            'subject', 'number', 'ignore')
        if ignore:
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

        title = title_line[title_start:title_end].strip()
        return (subject, number, title, units)

    def parse_prerequisites(self, description):
        description = description.strip()
        prereqs_match = _prerequisites_matcher.search(description)
        if prereqs_match is None:
            return None
        prereqs_str = prereqs_match.group('prereqs')
        end_match = _prerequisites_end_matcher.search(prereqs_str)
        prereqs_str = prereqs_str[:end_match.end()]
        if '-' in prereqs_str or '\u2013' in prereqs_str:
            self.logger.error('Dash in "%s"', prereqs_str)

        if ',' in prereqs_str:
            search_start = 0
            inner_or_match = _inner_or_comma_list_matcher.search(prereqs_str)
            while inner_or_match is not None:
                start, end = inner_or_match.start(), inner_or_match.end()
                or_list = inner_or_match.group()
                or_list = or_list.replace(',', ' or')
                prereqs_str = splice(prereqs_str, or_list, start, end)
                search_start = start + len(or_list)
                inner_or_match = _inner_or_comma_list_matcher.search(
                    prereqs_str, search_start)
            prereqs_str = prereqs_str.replace(',', ' and')

        search_start = 0
        omitted_subject_match = _omitted_subject_matcher.search(prereqs_str)
        while omitted_subject_match is not None:
            start, end = omitted_subject_match.start(), omitted_subject_match.end()
            omitted_subject_list = omitted_subject_match.group()
            subject = omitted_subject_match.group('subject')
            omitted_subject_list = omitted_subject_list.replace(
                'and', f'and {subject}')
            omitted_subject_list = omitted_subject_list.replace(
                'or', f'or {subject}')
            prereqs_str = splice(prereqs_str, omitted_subject_list, start, end)
            search_start = start + len(omitted_subject_list)
            omitted_subject_match = _omitted_subject_matcher.search(
                prereqs_str, search_start)

        prerequisites = []
        and_split = prereqs_str.split('and')
        for and_component in and_split:
            alternatives = []
            or_split = and_component.split('or')
            for or_component in or_split:
                code_match = _single_code_matcher.search(or_component)
                if code_match is None:
                    self.logger.error(
                        'Failed to match a course code in "%s" > "%s" > "%s"',
                        prereqs_str,
                        and_component,
                        or_component
                    )
                    continue
                code = code_match.group()
                alternatives.append(code)
            # if len(alternatives) > 0:
            prerequisites.append(alternatives)

        if len(prerequisites) == 0:
            return None
        return prerequisites
