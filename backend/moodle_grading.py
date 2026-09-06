"""Moodle Formulas question grading engine.

Implements Moodle-compliant number parsing, unit syntax validation,
SI prefix/conversion scaling, and 90%/10% scoring rules.
"""
import math
import re
from typing import Optional, NamedTuple

# Allowed characters in base unit names (cannot contain excluded characters)
EXCLUDED_UNIT_CHARS = set('][)(}{><0-9.,:;`~!@#*\\/?|_=+ -')

PREFIXES = {
    'da': 1e1, 'h': 1e2, 'k': 1e3, 'M': 1e6, 'G': 1e9, 'T': 1e12, 'P': 1e15, 'E': 1e18,
    'd': 1e-1, 'c': 1e-2, 'm': 1e-3, 'u': 1e-6, 'n': 1e-9, 'p': 1e-12, 'f': 1e-15, 'a': 1e-18,
}

# Base units definition: (dimension_dict, scale_to_SI_base, allowed_prefixes)
# Dimensions: length, time, mass, angle
BASE_UNITS = {
    'm': ({'length': 1}, 1.0, ['k', 'c', 'd', 'm', 'u', 'n', 'p', 'f', 'da', 'h']),
    's': ({'time': 1}, 1.0, ['m', 'u', 'n', 'p', 'f']),
    'min': ({'time': 1}, 60.0, []),
    'h': ({'time': 1}, 3600.0, []),
    'd': ({'time': 1}, 86400.0, []),
    'day': ({'time': 1}, 86400.0, []),
    'days': ({'time': 1}, 86400.0, []),
    'g': ({'mass': 1}, 1e-3, ['k', 'm', 'u', 'n', 'p', 'f']),
    'kg': ({'mass': 1}, 1.0, []),
    'in': ({'length': 1}, 0.0254, []),
    'ft': ({'length': 1}, 0.3048, []),
    'L': ({'length': 3}, 1e-3, ['m']),
    'l': ({'length': 3}, 1e-3, ['m']),
    'hectares': ({'length': 2}, 10000.0, []),
    'hectare': ({'length': 2}, 10000.0, []),
    'ha': ({'length': 2}, 10000.0, []),
    'rad': ({'angle': 1}, 1.0, []),
    'deg': ({'angle': 1}, math.pi / 180.0, []),
    'degrees': ({'angle': 1}, math.pi / 180.0, []),
    'N': ({'mass': 1, 'length': 1, 'time': -2}, 1.0, ['k', 'M', 'G', 'm', 'u']),
    'J': ({'mass': 1, 'length': 2, 'time': -2}, 1.0, ['k', 'M', 'G', 'm', 'u']),
    'W': ({'mass': 1, 'length': 2, 'time': -3}, 1.0, ['k', 'M', 'G', 'm', 'u']),
    'Pa': ({'mass': 1, 'length': -1, 'time': -2}, 1.0, ['k', 'M', 'G', 'm']),
}


class ProblemGrade(NamedTuple):
    mark: float
    max_mark: float
    number_correct: bool
    unit_correct: bool
    is_correct: bool
    feedback: str
    scaled_value: Optional[float]


def parse_moodle_number(val_str: Optional[str]) -> Optional[float]:
    """Parse and validate a numerical string according to Moodle Formulas format.
    
    Acceptable formats:
      - Plain decimal/integer: 15.2, 0.04167, -3.5, 42
      - Scientific E-notation: 5E-2, 1.6E7, 1.56E4, -2.5e3
      - Scientific 10^ notation: 10^-3, 10^4, 5.3*10^4, 1.56*10^4, -2*10^-5
      
    Disallowed formats:
      - Missing mantissa: E-3
      - Parens around exponent in E-notation: 1E(-3), 1.6E(7)
      - Caret after E: 1.5E^2
      - Internal spaces: 4.1 E 5
      - Asterisk before E: 5.1*E6
      - Letter 'x' instead of '*': 1.6x10^5
      - Comma instead of dot: 5,1*E6, 1,56E4
    """
    if val_str is None:
        return None
    val_str = val_str.strip()
    if not val_str:
        return None

    # Commas are explicitly rejected
    if ',' in val_str:
        return None

    # Internal spaces around E are rejected
    if re.search(r'\s+[eE]|[eE]\s+', val_str):
        return None

    # Pattern 1: Plain decimal or standard scientific E notation
    # Note: mantissa required, no parens in exp, no caret in exp
    e_pattern = r'^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$'
    if re.fullmatch(e_pattern, val_str):
        try:
            return float(val_str)
        except ValueError:
            return None

    # Pattern 2: Scientific 10^ notation
    # Form: [+-]?(?:<mantissa>\s*\*\s*)?10\^(?:\([+-]?\d+\)|[+-]?\d+)
    pow10_pattern = r'^[+-]?(?:(?:\d+\.?\d*|\.\d+)\s*\*\s*)?10\^(?:\([+-]?\d+\)|[+-]?\d+)$'
    if re.fullmatch(pow10_pattern, val_str):
        try:
            val_clean = val_str.replace(' ', '')
            if '*' in val_clean:
                parts = val_clean.split('*')
                mantissa = float(parts[0])
                exp_str = parts[1].replace('10^', '').replace('(', '').replace(')', '')
                return mantissa * (10.0 ** int(exp_str))
            else:
                sign = 1.0
                s = val_clean
                if s.startswith('-'):
                    sign = -1.0
                    s = s[1:]
                elif s.startswith('+'):
                    s = s[1:]
                exp_str = s.replace('10^', '').replace('(', '').replace(')', '')
                return sign * (10.0 ** int(exp_str))
        except (ValueError, OverflowError):
            return None

    return None


def resolve_single_unit(sym: str) -> tuple[Optional[dict[str, int]], Optional[float]]:
    """Resolve a single unit symbol to its base dimensions and scale factor."""
    if sym in BASE_UNITS:
        dims, scale, _ = BASE_UNITS[sym]
        return dims, scale

    # Check prefixes (longer prefix like 'da' first)
    for p_len in [2, 1]:
        if len(sym) > p_len:
            p = sym[:p_len]
            base = sym[p_len:]
            if p in PREFIXES and base in BASE_UNITS:
                dims, b_scale, allowed_p = BASE_UNITS[base]
                if not allowed_p or p in allowed_p:
                    return dims, b_scale * PREFIXES[p]
    return None, None


def parse_unit_multiplication(part_str: str) -> Optional[dict[str, int]]:
    """Parse a unit part containing only multiplication (space-separated).
    
    Returns a dict mapping unit symbols to integer exponents, or None on syntax error.
    """
    part_str = part_str.strip()
    if not part_str:
        return {}

    # Reject forbidden symbols like asterisk, comma, semicolon, etc.
    # Note: caret and space are allowed
    forbidden_in_body = set('][}{><.,:;`~!@*\\/?|_=+')
    if any(c in forbidden_in_body for c in part_str):
        return None

    # Normalize caret spacing
    part_str = re.sub(r'\s*\^\s*', '^', part_str)
    tokens = part_str.split(' ')
    unit_dict: dict[str, int] = {}

    for token in tokens:
        token = token.strip()
        if not token:
            continue

        if '^' in token:
            sub = token.split('^')
            if len(sub) != 2 or not sub[0] or not sub[1]:
                return None
            name, exp_str = sub[0], sub[1]
            if any(c in EXCLUDED_UNIT_CHARS for c in name):
                return None

            # Exponent validation: Moodle allows digits, -digits, or (-digits)
            # Positive in parens like ^(2) or malformed like ^(-) is rejected
            if re.fullmatch(r'\d+', exp_str):
                exponent = int(exp_str)
            elif re.fullmatch(r'-\d+', exp_str):
                exponent = -int(exp_str[1:])
            elif re.fullmatch(r'\(-(\d+)\)', exp_str):
                match = re.fullmatch(r'\(-(\d+)\)', exp_str)
                exponent = -int(match.group(1)) if match else 0
            else:
                return None
        else:
            name = token
            if any(c in EXCLUDED_UNIT_CHARS for c in name):
                return None
            exponent = 1

        if name in unit_dict:
            return None  # No duplicate base unit in multiplication

        unit_dict[name] = exponent

    return unit_dict


def parse_unit_expression(expr: Optional[str]) -> tuple[Optional[dict[str, int]], bool]:
    """Parse a full unit expression with optional division.
    
    Returns (unit_dict, syntax_error_flag).
    If expr is empty or None: returns ({}, False).
    If invalid syntax: returns (None, True).
    """
    if expr is None:
        return {}, False
    expr = expr.strip()
    if not expr:
        return {}, False

    # Check for division
    if '/' in expr:
        parts = expr.split('/')
        # Only a single solidus is allowed
        if len(parts) != 2 or not parts[0].strip() or not parts[1].strip():
            return None, True
        left, right = parts[0].strip(), parts[1].strip()

        # Right side can optionally be enclosed in outer parentheses, e.g. /(s^2)
        if right.startswith('(') and right.endswith(')'):
            right = right[1:-1].strip()

        uleft = parse_unit_multiplication(left)
        uright = parse_unit_multiplication(right)
        if uleft is None or uright is None:
            return None, True

        for u, exp in uright.items():
            if u in uleft:
                return None, True  # No duplication across numerator and denominator
            uleft[u] = -exp
        return uleft, False
    else:
        res = parse_unit_multiplication(expr)
        if res is None:
            return None, True
        return res, False


def compute_dimensions_and_scale(unit_dict: Optional[dict[str, int]]) -> tuple[Optional[dict[str, int]], Optional[float]]:
    """Compute base physical dimensions and scale factor relative to SI base units."""
    if unit_dict is None:
        return None, None
    total_dims: dict[str, int] = {}
    total_scale = 1.0

    for name, exp in unit_dict.items():
        dims, scale = resolve_single_unit(name)
        if dims is None or scale is None:
            return None, None
        total_scale *= (scale ** exp)
        for d, d_exp in dims.items():
            total_dims[d] = total_dims.get(d, 0) + d_exp * exp

    # Filter out cancelled dimensions
    total_dims = {d: v for d, v in total_dims.items() if abs(v) > 1e-9}
    return total_dims, total_scale


def is_dimensionally_compatible(
    sub_dims: Optional[dict[str, int]],
    exp_dims: Optional[dict[str, int]]
) -> bool:
    """Check if two dimension dictionaries represent the same physical quantity."""
    if sub_dims is None or exp_dims is None:
        return False
    # All dimensions must match
    all_keys = set(sub_dims.keys()) | set(exp_dims.keys())
    for k in all_keys:
        if sub_dims.get(k, 0) != exp_dims.get(k, 0):
            return False
    return True


def check_numerical_correctness(submitted: float, expected: float, tolerance: float = 0.01) -> bool:
    """Check if numerical value is within relative tolerance of expected."""
    if expected == 0:
        return abs(submitted) < 1e-9
    return abs((submitted - expected) / expected) <= tolerance


def grade_problem(
    submitted_value_raw: Optional[str],
    submitted_unit_raw: Optional[str],
    expected_value: float,
    expected_unit_str: Optional[str],
    tolerance: float = 0.01,
) -> ProblemGrade:
    """Grade a problem using the Moodle 90% / 10% model.
    
    Rules:
    - 90% (0.90 marks) for correct numerical answer
    - 10% (0.10 marks) for correct units in proper Moodle format
    - 100% (1.00 marks) for dimensionless problems (no expected unit)
    - If unit syntax is invalid (e.g. wrong brackets `m/s^(2)`, `(m)`): 0 points
    - If numerical answer is wrong: 0 points
    - If numerical answer is correct but unit is wrong/missing: 0.90 points
    - If compatible unit with conversion (e.g. 5000 ms for 5 s): value is scaled,
      and if scaled value matches, full marks (1.00) are awarded.
    """
    has_expected_unit = bool(expected_unit_str and expected_unit_str.strip())
    
    # Handle auto-splitting if student entered unit in value field
    # E.g. "5000 ms" entered into value box while unit box was left empty
    val_str = submitted_value_raw.strip() if submitted_value_raw else None
    unit_str = submitted_unit_raw.strip() if submitted_unit_raw else None

    if val_str and not unit_str and has_expected_unit:
        # Check if val_str contains a space separating number and unit
        parts = val_str.split(' ', 1)
        if len(parts) == 2:
            test_num = parse_moodle_number(parts[0])
            if test_num is not None:
                val_str = parts[0]
                unit_str = parts[1]

    # Parse submitted value
    parsed_num = parse_moodle_number(val_str)
    if parsed_num is None:
        # Invalid number format or unanswered
        feedback = "Invalid number format or unanswered." if val_str else "Not answered."
        return ProblemGrade(
            mark=0.0,
            max_mark=1.00,
            number_correct=False,
            unit_correct=False,
            is_correct=False,
            feedback=feedback,
            scaled_value=None
        )

    # 1. Dimensionless problem
    if not has_expected_unit:
        is_num_ok = check_numerical_correctness(parsed_num, expected_value, tolerance)
        if is_num_ok:
            return ProblemGrade(
                mark=1.00,
                max_mark=1.00,
                number_correct=True,
                unit_correct=True,
                is_correct=True,
                feedback="Your answer is correct.",
                scaled_value=parsed_num
            )
        else:
            return ProblemGrade(
                mark=0.00,
                max_mark=1.00,
                number_correct=False,
                unit_correct=True,
                is_correct=False,
                feedback="Your answer is incorrect.",
                scaled_value=parsed_num
            )

    # 2. Problem with expected unit
    # Parse expected unit
    exp_unit_dict, _ = parse_unit_expression(expected_unit_str)
    exp_dims, exp_scale = compute_dimensions_and_scale(exp_unit_dict)

    # Parse submitted unit
    sub_unit_dict, unit_syntax_error = parse_unit_expression(unit_str)

    # If unit had a syntax error (e.g. m/s^(2), (m), etc.)
    # In Moodle: "treats the whole answer as wrong, awarding 0 points"
    if unit_syntax_error:
        return ProblemGrade(
            mark=0.00,
            max_mark=1.00,
            number_correct=False,
            unit_correct=False,
            is_correct=False,
            feedback="Syntax error in unit format (check brackets and symbols). 0 marks awarded.",
            scaled_value=parsed_num
        )

    # Check compatibility and conversion factor
    unit_is_correct = False
    conversion_factor = 1.0

    if sub_unit_dict:  # Student provided a unit
        sub_dims, sub_scale = compute_dimensions_and_scale(sub_unit_dict)
        if (
            sub_dims is not None and
            sub_scale is not None and
            exp_dims is not None and
            exp_scale is not None and
            is_dimensionally_compatible(sub_dims, exp_dims)
        ):
            # Unit is compatible!
            conversion_factor = sub_scale / exp_scale
            unit_is_correct = True
        else:
            # Incompatible dimension (e.g. kg for m)
            unit_is_correct = False
            conversion_factor = 1.0
    else:
        # Unit was omitted/empty
        unit_is_correct = False
        conversion_factor = 1.0

    # Scale the numerical answer
    scaled_num = parsed_num * conversion_factor
    number_is_correct = check_numerical_correctness(scaled_num, expected_value, tolerance)

    if number_is_correct:
        if unit_is_correct:
            # 90% for number + 10% for unit = 100%
            return ProblemGrade(
                mark=1.00,
                max_mark=1.00,
                number_correct=True,
                unit_correct=True,
                is_correct=True,
                feedback="Your answer is correct.",
                scaled_value=scaled_num
            )
        else:
            # 90% for number, 0% for unit = 0.90 marks
            feedback = "The numerical answer is correct, but the unit is incorrect or missing (-10% penalty)."
            return ProblemGrade(
                mark=0.90,
                max_mark=1.00,
                number_correct=True,
                unit_correct=False,
                is_correct=False,
                feedback=feedback,
                scaled_value=scaled_num
            )
    else:
        # Number is incorrect -> 0 marks
        feedback = "Your answer is incorrect."
        return ProblemGrade(
            mark=0.00,
            max_mark=1.00,
            number_correct=False,
            unit_correct=unit_is_correct,
            is_correct=False,
            feedback=feedback,
            scaled_value=scaled_num
        )
