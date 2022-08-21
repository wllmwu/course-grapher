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

# _prerequisites_matcher = re.compile(
#    r'([Pp]re|[Cc]o)-?requisites: .*?(?P<prereqs>[A-Z]{2,} [0-9]+[A-Z]*[^\.;]*)')
_prerequisites_matcher = re.compile(
    r'.*Prerequisites: .*?(?P<prereqs>\(?[A-Z]{2,}.*?)(\.|credit|concurrent|\Z)')
_ignore_grades_matcher = re.compile(r'[Gg]rade of .*? or better|GPA [0-9]')
# _prerequisites_end_matcher = re.compile(
#    r'.*[A-Z]{2,} [0-9]+[A-Z]*([-\u2013][0-9A-Z]+| (and|or) [0-9]+[A-Z]*)*')
_prerequisites_end_matcher = re.compile(r'.*[ -\u2013][0-9A-Z]+\)?')
_next_conjunction_matcher = re.compile(r'[,;]\s+(?P<conjunction>and|or)')
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
        """
        Extract a course's code (subject and number), title, and units from its
        title line in the catalog. Returns a tuple containing the subject,
        number, title, and units as strings in that order if parsing succeeded,
        or `None` if it failed. Sometimes the units are missing in the catalog,
        in which case the units string defaults to `'?'`.
        """
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
        """
        Extracts prerequisite information from a course's description in the
        catalog. Returns a list of lists of course code strings, where each list
        represents a set of alternatives that satisfy that prerequisite
        requirement, or `None` if there are no prerequisites.
        """
        prereqs_str = self._isolate_prerequisites(description)
        prereqs_str = self._replace_commas(prereqs_str)
        # find last instance of "prerequisites:"
        # match from after that until first period
        # cut out "credit (for)" or "concurrent (enrollment in)" and anything after
        # remove instances of "grade of __ or better" and "gpa (of) __"
        # match from first to last course code
        # eliminate commas and semicolons...
        # for each comma:
        # > walk forward, remembering positions of any more commas, until reach a comma immediately followed by a conjunction, a (, a ), a ;, or end of line
        # > if reached an oxford comma, then replace all found commas with the conjunction and continue
        # > else if reached (, then perform this loop inside the parenthesis, then continue walking after the closing )
        # > else if reached ), then replace all found commas with or
        # > else if reached ;, then replace all found commas with or and replace the ; with the immediately following conjunction (use and if not present)
        # > else if reached end of line, then replace all found commas with and
        # expand shorthand...
        # > walk through string
        # > if find "subject and/or subject number", insert number after first subject
        # > if find "subject number and/or number...", insert subject before each number after the first
        # expand sequences...

    def _isolate_prerequisites(self, description):
        """
        Returns the substring of `description` spanning all the prerequisite
        course codes, with extraneous information removed.
        """
        prereqs_match = _prerequisites_matcher.search(description)
        if prereqs_match is None:
            return None
        prereqs_str = prereqs_match.group('prereqs')
        prereqs_str = _ignore_grades_matcher.sub('', prereqs_str)
        end_match = _prerequisites_end_matcher.search(prereqs_str)
        return prereqs_str[:end_match.end()]

    def _replace_commas(self, prereqs_str):
        """
        Returns `prereqs_str` with all commas and semicolons replaced by the
        appropriate conjunctions (`and`/`or`).
        """
        substitutions = [None] * len(prereqs_str)
        i = 0
        while i < len(prereqs_str):
            i = self._replace_commas_helper(prereqs_str, i, substitutions)
        for i in reversed(range(len(substitutions))):
            if substitutions[i] is not None:
                prereqs_str = splice(prereqs_str, substitutions[i], i, i + 1)
        return prereqs_str

    def _replace_commas_helper(self, s, i, subs):
        def set_substitutions(positions, sub):
            for i in positions:
                subs[i] = sub
        comma_positions = []
        while i < len(s):
            if s[i] == ',':
                following_match = _next_conjunction_matcher.match(s[i:])
                if following_match is None:
                    comma_positions.append(i)
                else:
                    conjunction = following_match.group('conjunction')
                    set_substitutions(comma_positions, f' {conjunction} ')
                    comma_positions.clear()
                    subs[i] = ''
                i += 1
            elif s[i] == '(':
                i = self._replace_commas_helper(s, i + 1, subs)
            elif s[i] == ')':
                set_substitutions(comma_positions, ' or ')
                return i + 1
            elif s[i] == ';':
                set_substitutions(comma_positions, ' or ')
                comma_positions.clear()
                following_match = _next_conjunction_matcher.match(s[i:])
                if following_match is None:
                    subs[i] = ' and '
                else:
                    subs[i] = ''
                i += 1
            else:
                i += 1
        if len(comma_positions) > 0:
            set_substitutions(comma_positions, ' and ')
        return i

        # expand shorthand course codes where subjects or numbers are omitted

        # expand course sequences

        '''
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
        '''
