def splice(str1: str, str2: str, start: int, end: int | None = None) -> str:
    """
    Returns a copy of `str1` with `str2` replacing the portion between `start`
    and `end` indices. `start` and `end` are interpreted as in slice notation.
    If `end` is not provided, then it defaults to `start`.
    """
    if end is None:
        end = start
    return str1[:start] + str2 + str1[end:]
