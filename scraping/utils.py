def splice(str1, str2, start, end):
    """
    Returns a copy of `str1` with `str2` replacing the portion between `start`
    and `end` indices. `start` and `end` are interpreted as in slice notation.
    """
    return str1[:start] + str2 + str1[end:]
