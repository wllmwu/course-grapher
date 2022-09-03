from __future__ import annotations
from logging import Logger
import re
from typing import Literal, TypeVar, TypedDict

Node = TypeVar('Node', bound='PrerequisitesNode')
ReqsType = Literal['all', 'one', 'two']
ReqsList = list[str | Node]


class ReqsDict(TypedDict):
    type: ReqsType
    courses: list[str | ReqsDict]


# <expr1> ::= <expr2> and <expr1>
#           | <expr2>
# <expr2> ::= <expr3> or <expr2>
#           | <expr3>
# <expr3> ::= (<expr1>)
#           | <code>
#           | [one|two] <expr3s...>
_expr_1_matcher = re.compile(r'\band\b|(?P<end>(?=\)))')
_expr_2_matcher = re.compile(r'\bor\b|(?P<end>(?=\band\b|\)))')
_expr_3_matcher = re.compile(
    r'(?P<code>[A-Z]{2,} [0-9]+[A-Z]*)|(?P<paren>\()|(?P<one_of>\bone\b)|(?P<two_of>\btwo\b)|(?P<end>(?=\bor\b|\band\b|\)))')


class PrerequisitesNode:
    def __init__(self, type: ReqsType, reqs: ReqsList) -> None:
        super().__init__()
        self.type = type
        self.reqs = reqs

    def __str__(self) -> str:
        match self.type:
            case 'all':
                conjunction = ' and '
            case 'one':
                conjunction = ' or '
            case 'two':
                conjunction = ' or2 '
            case _:
                raise ValueError('Unrecognized ReqsType value: ' + self.type)
        s = '('
        if len(self.reqs) > 0:
            s += str(self.reqs[0])
            for x in self.reqs[1:]:
                s += conjunction
                s += str(x)
        s += ')'
        return s

    def consolidate(self) -> None:
        i = 0
        while i < len(self.reqs):
            child = self.reqs[i]
            if isinstance(child, PrerequisitesNode):
                child.consolidate()
                if child.type == self.type:
                    self.reqs[i:i + 1] = child.reqs
                    i += len(child.reqs) - 1
            i += 1

    def to_dict(self) -> ReqsDict:
        def mapping(x: str | PrerequisitesNode) -> str | ReqsDict:
            if isinstance(x, str):
                return x
            return x.to_dict()
        return {
            'type': self.type,
            'courses': [mapping(x) for x in self.reqs]
        }


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
        if isinstance(root, str):
            self.logger.info('FINAL  : %s', root)
            return root
        root.consolidate()
        self.logger.info('FINAL  : %s', str(root))
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
            if match.group('end') is not None:
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
            if match.group('end') is not None:
                break
        if len(reqs) == 0:
            return (None, i)
        elif len(reqs) == 1:
            return (reqs[0], i)
        return (PrerequisitesNode('one', reqs), i)

    def _parse_expr_3(self, reqs_str: str, start: int) -> ExprParseResult:
        i = start
        match = _expr_3_matcher.search(reqs_str, i)
        if match is None or match.group('end') is not None:
            return (None, i)
        i = match.end()
        code = match.group('code')
        if code:
            return (code, i)
        elif match.group('paren'):
            child, i = self._parse_expr_1(reqs_str, i)
            while i < len(reqs_str) and reqs_str[i] != ')':
                i += 1
            return (child, i + 1)
        else:
            # "one/two of the following" - assume it takes up the entire rest of
            # the string, with no sub-expressions
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
                if match.group('end') is not None:
                    i += 1
                else:
                    i = match.end()
            if len(reqs) == 0:
                return (None, i)
            elif len(reqs) == 1:
                return (reqs[0], i)
            return (PrerequisitesNode(reqs_type, reqs), i)
