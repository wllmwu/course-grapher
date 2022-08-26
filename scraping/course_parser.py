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
    r'.*Prerequisites:[^\.]*?(?P<prereqs>\(?([A-Z]{3,}|SE) [0-9]+.*?)(\.|not|credit|restricted|concurrent|corequisite|[A-Z]{2,} [0-9]+[A-Z]* (must|should) be taken|\Z)')
_false_positive_matcher = re.compile(
    r'([Gg]rade|[Ss]core) of .*? or (better|higher)|[A-D][-\u2013+]? or (better|higher)|,? or equivalent|GPA [0-9]|ACT|MBA|\(?(for|prior)[^,;]*\)?')
_prerequisites_end_matcher = re.compile(
    r'.*[A-Z]{2,} [0-9]+[A-Z]*(([-\u2013/]|, (and |or )?| (and|or) )([0-9]+[A-Z]*|[A-Z]{,2}(?![a-z])))*\)?')
_next_conjunction_matcher = re.compile(r'[,;]\s+(?P<conjunction>and|or)')
_conjunction_matcher = re.compile(r'\s(and|or)\s')
_omitted_subject_matcher = re.compile(
    r'(?P<subject>[A-Z]{2,}) [0-9]+[A-Z]*( (and|or) [0-9]+[A-Z]*)+')


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
        if prereqs_str is None:
            return None
        else:
            self.logger.info('PREREQS: %s', prereqs_str)
            self.metrics.inc_with_prerequisites()
        prereqs_str = self._normalize_string(prereqs_str)
        self.logger.info('-------> %s', prereqs_str)

    def _isolate_prerequisites(self, description):
        """
        Returns the substring of `description` spanning all the prerequisite
        course codes, with extraneous information removed, or `None` if no such
        prerequisites are found.
        """
        prereqs_match = _prerequisites_matcher.search(description)
        if prereqs_match is None:
            return None
        prereqs_str = prereqs_match.group('prereqs')
        self.logger.info('ORIGINL: %s', prereqs_str)
        prereqs_str = _false_positive_matcher.sub('', prereqs_str)
        end_match = _prerequisites_end_matcher.search(prereqs_str)
        return prereqs_str[:end_match.end()]

    def _normalize_string(self, reqs_str):
        """
        Normalizes `reqs_str` and returns the result. A normalized string
        contains only full course codes (subject and number, no shorthand),
        conjunctions (including constructs like "two of the following courses"),
        parentheses, and possibly some leftover text which won't affect parsing.
        """
        reqs_str = self._normalize_conjunctions(reqs_str)
        return reqs_str

    def _normalize_conjunctions(self, reqs_str):
        """
        Returns `reqs_str` with all commas, semicolons, and slashes replaced
        by the appropriate conjunctions (`and`/`or`).
        """
        substitutions = [None] * len(reqs_str)
        i = 0
        while i < len(reqs_str):
            i = self._conjunctions_helper(reqs_str, i, substitutions)
        for i in reversed(range(len(substitutions))):
            if substitutions[i] is not None:
                reqs_str = splice(reqs_str, substitutions[i], i, i + 1)
        return reqs_str

    def _conjunctions_helper(self, s, i, subs):
        """
        Walks through `s` starting from index `i` and adds any newly found
        substitutions to `subs`. Works recursively within parentheses. Returns
        the next index after where the algorithm stops.
        """
        def set_substitutions(positions, sub):
            for i in positions:
                subs[i] = sub
        comma_positions = []
        last_semicolon_position = 0
        should_remove_parenthesis = False
        while i < len(s):
            if s[i] == ',':
                following_match = _next_conjunction_matcher.match(s[i:])
                if following_match is None:
                    comma_positions.append(i)
                else:
                    conjunction = following_match.group('conjunction')
                    set_substitutions(comma_positions, f' {conjunction}')
                    comma_positions.clear()
                    subs[i] = ''
                i += 1
            elif s[i] == '/':
                subs[i] = ' or '
            elif s[i] == '(':
                if s[i + 1:].startswith('or'):
                    subs[i] = ''
                    should_remove_parenthesis = True
                    i += 1
                else:
                    i = self._conjunctions_helper(s, i + 1, subs)
            elif s[i] == ')':
                if should_remove_parenthesis:
                    subs[i] = ''
                    should_remove_parenthesis = False
                    i += 1
                else:
                    set_substitutions(comma_positions, ' or')
                    return i + 1
            elif s[i] == ';':
                conjunction = 'and'
                last_comma_index = s.rfind(',', last_semicolon_position, i)
                if last_comma_index != -1:
                    match = _conjunction_matcher.search(
                        s, last_semicolon_position, last_comma_index)
                    if match is None:
                        matches = _conjunction_matcher.findall(
                            s, last_comma_index, i)
                        if len(matches) == 1:
                            conjunction = matches[0]
                set_substitutions(comma_positions, f' {conjunction}')
                comma_positions.clear()
                following_match = _next_conjunction_matcher.match(s[i:])
                if following_match is None:
                    subs[i] = ' and'
                    last_semicolon_position = i
                else:
                    subs[i] = ''
                    last_semicolon_position = i + len(following_match.group())
                i += 1
            else:
                i += 1
        if len(comma_positions) > 0:
            set_substitutions(comma_positions, ' and')
        return i
