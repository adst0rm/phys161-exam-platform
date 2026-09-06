"""Unit tests for Moodle number parsing, unit syntax parsing, and grading."""
import unittest
from moodle_grading import (
    parse_moodle_number,
    parse_unit_expression,
    compute_dimensions_and_scale,
    grade_problem,
)


class TestMoodleNumberParsing(unittest.TestCase):
    def test_correct_examples(self):
        # Correct examples from prompt:
        # 5E-2, 1.6E7, 15.2, 10^-3, 10^4, 5.3*10^4
        self.assertAlmostEqual(parse_moodle_number("5E-2"), 0.05)
        self.assertAlmostEqual(parse_moodle_number("1.6E7"), 1.6e7)
        self.assertAlmostEqual(parse_moodle_number("15.2"), 15.2)
        self.assertAlmostEqual(parse_moodle_number("10^-3"), 0.001)
        self.assertAlmostEqual(parse_moodle_number("10^4"), 10000.0)
        self.assertAlmostEqual(parse_moodle_number("5.3*10^4"), 53000.0)
        self.assertAlmostEqual(parse_moodle_number("1.56*10^4"), 15600.0)
        self.assertAlmostEqual(parse_moodle_number("1.56E4"), 15600.0)
        self.assertAlmostEqual(parse_moodle_number("-2.5E-3"), -0.0025)
        self.assertAlmostEqual(parse_moodle_number("-5.3*10^4"), -53000.0)

    def test_incorrect_examples(self):
        # Incorrect examples from prompt:
        # E-3, 1E(-3), 1.5E^2, 1.6E(7), 4.1 E 5, 5.1*E6, 1.6x10^5, 5,1*E6
        self.assertIsNone(parse_moodle_number("E-3"))
        self.assertIsNone(parse_moodle_number("1E(-3)"))
        self.assertIsNone(parse_moodle_number("1.5E^2"))
        self.assertIsNone(parse_moodle_number("1.6E(7)"))
        self.assertIsNone(parse_moodle_number("4.1 E 5"))
        self.assertIsNone(parse_moodle_number("5.1*E6"))
        self.assertIsNone(parse_moodle_number("1.6x10^5"))
        self.assertIsNone(parse_moodle_number("5,1*E6"))
        self.assertIsNone(parse_moodle_number("1,56E4"))


class TestMoodleUnitParsing(unittest.TestCase):
    def test_correct_unit_examples(self):
        # 50 kN m
        ud, err = parse_unit_expression("kN m")
        self.assertFalse(err)
        self.assertEqual(ud, {"kN": 1, "m": 1})

        # 10 m/s
        ud, err = parse_unit_expression("m/s")
        self.assertFalse(err)
        self.assertEqual(ud, {"m": 1, "s": -1})

        # 10 m s^(-1)
        ud, err = parse_unit_expression("m s^(-1)")
        self.assertFalse(err)
        self.assertEqual(ud, {"m": 1, "s": -1})

        # 4.7 m^2
        ud, err = parse_unit_expression("m^2")
        self.assertFalse(err)
        self.assertEqual(ud, {"m": 2})

        # 8 kN m^(-2)
        ud, err = parse_unit_expression("kN m^(-2)")
        self.assertFalse(err)
        self.assertEqual(ud, {"kN": 1, "m": -2})

    def test_permutations_equivalent(self):
        # 3 m kg s^(-2) or 3 kg m/s^2
        ud1, err1 = parse_unit_expression("m kg s^(-2)")
        ud2, err2 = parse_unit_expression("kg m/s^2")
        self.assertFalse(err1)
        self.assertFalse(err2)

        dims1, scale1 = compute_dimensions_and_scale(ud1)
        dims2, scale2 = compute_dimensions_and_scale(ud2)
        self.assertEqual(dims1, dims2)
        self.assertAlmostEqual(scale1, scale2)

    def test_case_sensitivity(self):
        # kN is valid, KN, kn, Kn are invalid
        ud_valid, _ = parse_unit_expression("kN")
        dims, _ = compute_dimensions_and_scale(ud_valid)
        self.assertIsNotNone(dims)

        for wrong in ["KN", "kn", "Kn"]:
            ud_wrong, _ = parse_unit_expression(wrong)
            dims_wrong, _ = compute_dimensions_and_scale(ud_wrong)
            self.assertIsNone(dims_wrong)

        # MPa is valid, Mpa, MPA, mPa are different or invalid
        ud_mpa, _ = parse_unit_expression("MPa")
        dims_mpa, scale_mpa = compute_dimensions_and_scale(ud_mpa)
        self.assertEqual(scale_mpa, 1e6)

        ud_micro_pa, _ = parse_unit_expression("mPa")  # milli-pascal
        _, scale_milli = compute_dimensions_and_scale(ud_micro_pa)
        self.assertEqual(scale_milli, 1e-3)

        for wrong in ["Mpa", "MPA"]:
            ud_wrong, _ = parse_unit_expression(wrong)
            dims_wrong, _ = compute_dimensions_and_scale(ud_wrong)
            self.assertIsNone(dims_wrong)

    def test_syntax_errors(self):
        # m/s^(2) -> positive exponent with brackets causes syntax error
        ud, err = parse_unit_expression("m/s^(2)")
        self.assertTrue(err)

        # (m) -> parentheses around unit causes syntax error
        ud, err = parse_unit_expression("(m)")
        self.assertTrue(err)

        # Asterisk in unit: 50 kN*m causes syntax error
        ud, err = parse_unit_expression("kN*m")
        self.assertTrue(err)


class TestCommonSIEquivalence(unittest.TestCase):
    def test_si_conversions(self):
        # 5 s = 5000 ms = 5e9 ns
        g1 = grade_problem("5000", "ms", 5.0, "s")
        self.assertEqual(g1.mark, 1.00)
        self.assertTrue(g1.is_correct)

        g2 = grade_problem("5e9", "ns", 5.0, "s")
        self.assertEqual(g2.mark, 1.00)
        self.assertTrue(g2.is_correct)

        # 0.2 m/s = 200 mm/s
        g3 = grade_problem("200", "mm/s", 0.2, "m/s")
        self.assertEqual(g3.mark, 1.00)
        self.assertTrue(g3.is_correct)

        # 1 m^2 = 10000 cm^2 = 1e-6 km^2
        g4 = grade_problem("10000", "cm^2", 1.0, "m^2")
        self.assertEqual(g4.mark, 1.00)
        self.assertTrue(g4.is_correct)

        g5 = grade_problem("1e-6", "km^2", 1.0, "m^2")
        self.assertEqual(g5.mark, 1.00)
        self.assertTrue(g5.is_correct)

    def test_physics_problems_units(self):
        # Density: 5.46415 g/cm^3 == 5464.15 kg/m^3
        g_density = grade_problem("5464.15", "kg/m^3", 5.46415, "g/cm^3")
        self.assertEqual(g_density.mark, 1.00)
        self.assertTrue(g_density.is_correct)

        # Speed: 4 km/h == 1.11111 m/s
        g_speed = grade_problem("1.11111", "m/s", 4.0, "km/h")
        self.assertEqual(g_speed.mark, 1.00)
        self.assertTrue(g_speed.is_correct)

        # Volume: 0.3 L == 300 cm^3
        g_vol = grade_problem("300", "cm^3", 0.3, "L")
        self.assertEqual(g_vol.mark, 1.00)
        self.assertTrue(g_vol.is_correct)

        # Area: 4.86 hectares == 48600 m^2
        g_area = grade_problem("48600", "m^2", 4.86, "hectares")
        self.assertEqual(g_area.mark, 1.00)
        self.assertTrue(g_area.is_correct)

        # Time: 2 days == 48 h == 172800 s
        g_time = grade_problem("48", "h", 2.0, "days")
        self.assertEqual(g_time.mark, 1.00)
        self.assertTrue(g_time.is_correct)


class TestScoringRules(unittest.TestCase):
    def test_wrong_unit_penalty_and_zero_rules(self):
        # Right answer: 5 m
        # Student: 5 kg -> 0.90 marks (90% for correct number, wrong unit)
        g_kg = grade_problem("5", "kg", 5.0, "m")
        self.assertEqual(g_kg.mark, 0.90)
        self.assertTrue(g_kg.number_correct)
        self.assertFalse(g_kg.unit_correct)

        # Student: 5 km -> 0.00 marks (treats as 5000 m, which is wrong numerical value)
        g_km = grade_problem("5", "km", 5.0, "m")
        self.assertEqual(g_km.mark, 0.00)
        self.assertFalse(g_km.number_correct)

        # Student: 5 m/s^(2) -> 0.00 marks (syntax error from brackets)
        g_brackets = grade_problem("5", "m/s^(2)", 5.0, "m")
        self.assertEqual(g_brackets.mark, 0.00)

        # Student: 5 (m) -> 0.00 marks (syntax error from brackets)
        g_paren = grade_problem("5", "(m)", 5.0, "m")
        self.assertEqual(g_paren.mark, 0.00)

        # Correct answer: 5 m, 5 m -> 1.00 marks
        g_ok = grade_problem("5", "m", 5.0, "m")
        self.assertEqual(g_ok.mark, 1.00)
        self.assertTrue(g_ok.is_correct)

        # Wrong numerical value, correct unit: 10 m instead of 5 m -> 0.00 marks
        g_wrong_num = grade_problem("10", "m", 5.0, "m")
        self.assertEqual(g_wrong_num.mark, 0.00)
        self.assertFalse(g_wrong_num.is_correct)

    def test_dimensionless_problem(self):
        # P9: relative error = 5.1546e-06, expected_unit = None
        g_dimless = grade_problem("5.1546E-6", "", 5.1546e-06, None)
        self.assertEqual(g_dimless.mark, 1.00)
        self.assertTrue(g_dimless.is_correct)

    def test_auto_split_combined_input(self):
        # Student entered "5000 ms" into value box, leaving unit box empty
        g_split = grade_problem("5000 ms", "", 5.0, "s")
        self.assertEqual(g_split.mark, 1.00)
        self.assertTrue(g_split.is_correct)


if __name__ == "__main__":
    unittest.main()
