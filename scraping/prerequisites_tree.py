from logging import Logger
import re
from typing import Literal, TypedDict


ReqsType = Literal['all', 'one', 'two']
ReqsList = list[str | 'PrerequisitesNode']


class ReqsDict(TypedDict):
    type: ReqsType
    courses: list[str | 'ReqsDict']


# <expr1> ::= <expr2> and <expr1>
#           | <expr2>
# <expr2> ::= <expr3> or <expr2>
#           | <expr3>
# <expr3> ::= (<expr1>)
#           | <code>
#           | [one|two] <expr3s...>
_expr_1_matcher = re.compile(r' and |(?P<rparen>\))')
_expr_2_matcher = re.compile(r' or |(?P<rparen>\))')
_expr_3_matcher = re.compile(
    r'(?P<code>[A-Z]{2,} [0-9]+[A-Z]*)|(?P<lparen>\()(?P<rparen>\))|(?P<one_of> one )|(?P<two_of> two )')


class PrerequisitesNode:
    def __init__(self, type: ReqsType, reqs: ReqsList) -> None:
        super().__init__()
        self.type = type
        self.reqs = reqs

    def consolidate(self) -> None:
        pass

    def to_dict(self) -> ReqsDict:
        pass


ExprParseResult = tuple[PrerequisitesNode | None, int]


class PrerequisitesTreeGenerator:
    def __init__(self, logger: Logger) -> None:
        super().__init__()
        self.logger = logger

    def from_string(self, reqs_str: str) -> ReqsDict | None:
        root, i = self._parse_expr_1(reqs_str, 0)
        if i < len(reqs_str):
            self.logger.warn(
                'Expression does not span entire string: "%s|%s"',
                reqs_str[:i],
                reqs_str[i:]
            )
        if root is None:
            self.logger.error(
                'Failed to parse expression tree in "%s"', reqs_str)
            return None
        root.consolidate()
        return root.to_dict()

    def _parse_expr_1(self, reqs_str: str, start: int) -> ExprParseResult:
        reqs: ReqsList = []
        i = start
        while i < len(reqs_str):
            child, i = self._parse_expr_2(reqs_str, i)
            if child is not None:
                reqs.append(child)
            match = _expr_1_matcher.search(reqs_str, i)
            if match is None:
                break
            i = match.end()
            if match.group('rparen'):
                break
        if len(reqs) == 0:
            return (None, i)
        elif len(reqs) == 1:
            return (reqs[0], i)
        return (PrerequisitesNode('all', reqs), i)

    def _parse_expr_2(self, reqs_str: str, start: int) -> ExprParseResult:
        reqs: ReqsList = []
        i = start
        while i < len(reqs_str):
            child, i = self._parse_expr_3(reqs_str, i)
            if child is not None:
                reqs.append(child)
            match = _expr_2_matcher.search(reqs_str, i)
            if match is None:
                break
            i = match.end()
            if match.group('rparen'):
                break
        if len(reqs) == 0:
            return (None, i)
        elif len(reqs) == 1:
            return (reqs[0], i)
        return (PrerequisitesNode('one', reqs), i)

    def _parse_expr_3(self, reqs_str: str, start: int) -> ExprParseResult:
        i = start
        match = _expr_3_matcher.search(reqs_str, i)
        if match is None or match.group('rparen'):
            return (None, i)
        i = match.end()
        code = match.group('code')
        if code:
            return (code, i)
        elif match.group('lparen'):
            return self._parse_expr_1(reqs_str, i)
        else:
            reqs: ReqsList = []
            reqs_type: ReqsType = 'one'
            if match.group('two_of'):
                reqs_type = 'two'
            while i < len(reqs_str):
                match = _expr_3_matcher.search(reqs_str, i)
                if match is None:
                    break
                code = match.group('code')
                if code:
                    reqs.append(code)
                i = match.end()
            if len(reqs) == 0:
                return (None, i)
            elif len(reqs) == 1:
                return (reqs[0], i)
            return (PrerequisitesNode(reqs_type, reqs), i)
