from typing import Literal, TypedDict


ReqsType = Literal['all', 'one', 'two']
ReqsList = list[str | 'PrerequisiteSet']


class ReqsDict(TypedDict):
    type: str
    courses: list[str | 'ReqsDict']


class PrerequisiteSet:
    def __init__(self, type: ReqsType, reqs: ReqsList) -> None:
        super().__init__()
        self.type = type
        self.reqs = reqs

    def from_string(reqs_str) -> 'PrerequisiteSet':
        pass

    def consolidate(self) -> None:
        pass

    def to_dict(self) -> ReqsDict:
        pass
