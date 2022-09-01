from logging import Logger
from metrics import ScrapingMetrics
from prerequisites_tree import ReqsDict
import re
from utils import splice


_course_code_matcher = re.compile(
    r'(?P<subject>[A-Z]{2,}) (?P<number>[0-9]+[A-Z]*)(?P<ignore>/[A-Z]{2,} [0-9]+[A-Z]*)*[.: ]')
_crosslisted_same_number_matcher = re.compile(
    r'(?P<subject>[A-Z]{2,})(?P<ignore>/[A-Z]{2,})+ (?P<number>[0-9]+[A-Z]*)')
_crosslisted_same_department_matcher = re.compile(
    r'(?P<subject>[A-Z]{2,}) (?P<number>[0-9]+[A-Z]*)(?P<ignore>/[0-9]+[A-Z]*)+')
_title_sequence_matcher = re.compile(
    r'(?P<subject>[A-Z]{2,}) (?P<number>[0-9]+[A-Z]*(?:[-\u2013][0-9A-Z]+)+)(?P<ignore>)')
_linguistics_matcher = re.compile(
    r'Linguistics(?:/[A-Za-z ]+)? \((?P<subject>[A-Z]{2,})\) (?P<number>[0-9]+[A-Z]*)(?P<ignore>)')
_units_matcher = re.compile(r'\((?P<units>.+?)\)')

_prerequisites_matcher = re.compile(
    r'.*Prerequisites:[^\.]*?(?P<prereqs>\(?(?:for )?(?:[A-Z]{3,}|SE) [0-9]+.*?)(?:\.|not|credit|restricted|concurrent|corequisite|[A-Z]{2,} [0-9]+[A-Z]* (?:must|should) be taken|\Z)')
_false_positive_matcher = re.compile(
    r'(?:[Gg]rade|[Ss]core) of .*? or (?:better|higher)|[A-D][-\u2013+]? or (?:better|higher)|,? or equivalent|GPA [0-9]|ACT|MBA|\(?(?:for|prior)[^,;]*\)?')
_prerequisites_end_matcher = re.compile(
    r'.*[A-Z]{2,} [0-9]+[A-Z]*(?:(?:[-\u2013/]|, (?:and |or )?| (?:and|or) )(?:[0-9]+[A-Z]*|[A-Z]{1,2}(?![0-9A-z])))*\)?')
_standard_form_matcher = re.compile(
    r'^\(?[A-Z]{2,} [0-9]+[A-Z]*(?: (?:and|or) \(?[A-Z]{2,} [0-9]+[A-Z]*\)?)*$')
_next_conjunction_matcher = re.compile(r'[,;]\s+(?P<conjunction>and|or)')
_conjunction_matcher = re.compile(r'\s(and|or)\s')
_subject_or_number_matcher = re.compile(
    r'(?P<subject>[A-Z]{2,}) (?P<digits_1>[0-9]+)[A-Z]*| (?P<number>(?P<digits_2>[0-9]+)[A-Z]*[^ ]*|(?:[A-RT-Z][A-Z]?|S[A-DF-Z]?)(?![A-z]))')
_sequence_start_matcher = re.compile(
    r'(?P<subject>[A-Z]{2,}) (?P<digits>[0-9]+)(?P<letters>[A-Z]*)(?=-)')
_sequence_end_matcher = re.compile(
    r'-(?:(?:[A-Z]{3,}|SE) )?(?P<end_digits>[0-9]*)(?P<end_letters>[A-Z]*)')


class CourseInfoParser:
    def __init__(self, logger: Logger, metrics: ScrapingMetrics) -> None:
        super().__init__()
        self.logger = logger
        self.metrics = metrics

    def parse_course(self, title_line: str) -> tuple[str, str, str, str]:
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
            code_match = _title_sequence_matcher.match(title_line)
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

    def parse_prerequisites(self, description: str) -> ReqsDict | None:
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

    def _isolate_prerequisites(self, description: str) -> str | None:
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
        if end_match is None:
            return None
        return prereqs_str[:end_match.end()]

    def _normalize_string(self, reqs_str: str) -> str:
        """
        Normalizes `reqs_str` and returns the result. A normalized string
        contains only full course codes (subject and number, no shorthand),
        conjunctions (including constructs like "two of the following courses"),
        parentheses, and possibly some leftover text which won't affect parsing.
        It should not contain commas, semicolons, or slashes, as those will have
        been replaced by conjunctions, but it may still contain certain special
        characters like en dashes and non-breaking spaces.
        """
        if _standard_form_matcher.fullmatch(reqs_str):
            return reqs_str
        reqs_str = self._normalize_conjunctions(reqs_str)
        self.logger.info('CONJUNC> %s', reqs_str)
        reqs_str = self._normalize_course_codes(reqs_str)
        return reqs_str

    def _normalize_conjunctions(self, reqs_str: str) -> str:
        """
        Returns `reqs_str` with all commas, semicolons, and slashes replaced
        by the appropriate conjunctions (`and`/`or`). Also replaces certain
        special characters with their ASCII counterparts to simplify later
        steps.
        """
        substitutions = [None] * len(reqs_str)
        i = 0
        while i < len(reqs_str):
            i = self._conjunctions_helper(reqs_str, i, substitutions)
        for i in reversed(range(len(substitutions))):
            if substitutions[i] is not None:
                reqs_str = splice(reqs_str, substitutions[i], i, i + 1)
        return reqs_str

    def _normalize_course_codes(self, reqs_str: str) -> str:
        """
        Returns `reqs_str` with abbreviated course codes expanded to their full
        forms (subject and number). Shortened codes may have subject omitted, or
        may represent a sequence of courses. In rare cases, the number is
        omitted and only the subject is present; these are currently ignored.
        """
        reqs_str = self._fill_incomplete_codes(reqs_str)
        self.logger.info('FILLED > %s', reqs_str)
        reqs_str = self._expand_code_sequences(reqs_str)
        self.logger.info('SEQUENC> %s', reqs_str)
        return reqs_str

    def _conjunctions_helper(self, s: str, i: int, subs: list[str | None]) -> int:
        """
        Walks through `s` starting from index `i` and adds any newly found
        substitutions to `subs`. Works recursively within parentheses. Returns
        the next index after where the algorithm stops.

        To simplify later steps, also adds substitutions for en dashes and
        non-breaking spaces, replacing them with hyphens and ASCII spaces
        respectively.
        """
        def set_substitutions(positions: list[int], sub: str) -> None:
            for i in positions:
                subs[i] = sub
        comma_positions = []
        last_semicolon_position = 0
        should_remove_parenthesis = False
        while i < len(s):
            if s[i] == ',':
                following_match = _next_conjunction_matcher.match(s, i)
                if following_match is None:
                    comma_positions.append(i)
                else:
                    conjunction = following_match.group('conjunction')
                    set_substitutions(comma_positions, f' {conjunction}')
                    comma_positions.clear()
                    subs[i] = ''
            elif s[i] == '/':
                subs[i] = ' or '
            elif s[i] == '(':
                if s[i + 1:].startswith('or'):
                    subs[i] = ''
                    should_remove_parenthesis = True
                else:
                    i = self._conjunctions_helper(s, i + 1, subs)
                    continue
            elif s[i] == ')':
                if should_remove_parenthesis:
                    subs[i] = ''
                    should_remove_parenthesis = False
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
                following_match = _next_conjunction_matcher.match(s, i)
                if following_match is None:
                    subs[i] = ' and'
                    last_semicolon_position = i
                else:
                    subs[i] = ''
                    last_semicolon_position = i + len(following_match.group())
            elif s[i] == '\u2013':
                subs[i] = '-'
            elif s[i] == '\u00a0':
                subs[i] = ' '
            i += 1
        if len(comma_positions) > 0:
            set_substitutions(comma_positions, ' and')
        return i

    def _fill_incomplete_codes(self, reqs_str: str) -> str:
        """
        Inserts missing subjects and digits into incomplete course codes in
        `reqs_str` and returns the result. Currently ignores cases where the
        subject is present but not the number. Also encloses each group of
        updated course codes, including the one with the original subject, in
        parentheses.
        """
        def insert_parentheses(left_pos: int, right_pos: int) -> str:
            return splice(
                reqs_str,
                f'({reqs_str[left_pos:right_pos]})',
                left_pos,
                right_pos
            )
        last_subject = ''
        last_digits = ''
        left_paren_position = right_paren_position = -1
        inserted_subjects_count = 0
        i = 0
        while i < len(reqs_str):
            match = _subject_or_number_matcher.search(reqs_str, i)
            if match is None:
                break
            subject, number = match.group('subject', 'number')
            i = match.start()
            if subject:
                last_subject = subject
                last_digits = match.group('digits_1')
                if inserted_subjects_count > 0:
                    reqs_str = insert_parentheses(
                        left_paren_position, right_paren_position)
                    i += 2
                inserted_subjects_count = 0
                left_paren_position = i
            elif number:
                digits = match.group('digits_2')
                if digits:
                    last_digits = digits
                    reqs_str = splice(reqs_str, f' {last_subject}', i)
                    i += len(last_subject) + 1
                else:
                    reqs_str = splice(
                        reqs_str, f'{last_subject} {last_digits}', i + 1)
                    i += len(last_subject) + len(last_digits) + 1
                inserted_subjects_count += 1
            i += len(match.group())
            right_paren_position = i
        if inserted_subjects_count > 0:
            reqs_str = insert_parentheses(
                left_paren_position, right_paren_position)
        return reqs_str

    def _expand_code_sequences(self, reqs_str: str) -> str:
        """
        Replaces each course code sequence in `reqs_str` with a list of courses
        in the sequence, enclosed in parentheses, and returns the result.
        """
        i = 0
        while i < len(reqs_str):
            start_match = _sequence_start_matcher.search(reqs_str, i)
            if start_match is None:
                break
            expanded = start_match.group()
            subject, digits, letters = start_match.group(
                'subject', 'digits', 'letters')
            i, j = start_match.span()
            while True:
                end_match = _sequence_end_matcher.match(reqs_str, j)
                if end_match is None:
                    break
                end_digits, end_letters = end_match.group(
                    'end_digits', 'end_letters')
                if end_digits and end_digits != digits:
                    if letters or end_letters:
                        expanded += f' and {subject} {end_digits}{end_letters}'
                    else:
                        start_number, end_number = int(digits), int(end_digits)
                        for num in range(start_number + 1, end_number + 1):
                            expanded += f' and {subject} {num}'
                    digits = end_digits
                    letters = end_letters
                elif end_letters:
                    if not letters or len(end_letters) != len(letters):
                        expanded += f' and {subject} {digits}{end_letters}'
                    else:
                        start_letter, end_letter = letters[0], end_letters[0]
                        for x in range(ord(start_letter) + 1, ord(end_letter)):
                            next_letters = f'{chr(x)}{letters[1:]}'
                            expanded += f' and {subject} {digits}{next_letters}'
                        expanded += f' and {subject} {digits}{end_letters}'
                    letters = end_letters
                j = end_match.end()
            reqs_str = splice(reqs_str, f'({expanded})', i, j)
            i += len(expanded) + 2
        return reqs_str
