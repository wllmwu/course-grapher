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
    r'(?P<code>[A-Z]{2,} [0-9]+[A-Z]*)|(?P<lparen>\()|(?P<one_of> one )|(?P<two_of> two )')


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
    def from_string(self, reqs_str: str) -> PrerequisitesNode:
        pass

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
            return None
        return (PrerequisitesNode('all', reqs), i)

    def _parse_expr_2(self, reqs_str: str, start: int) -> ExprParseResult:
        pass

    def _parse_expr_3(self, reqs_str: str, start: int) -> ExprParseResult:
        pass
