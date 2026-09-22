"""
Smart Academic Stress Analyzer
------------------------------
Core Fuzzy Inference System built with Scikit-Fuzzy.

This module keeps the fuzzy-logic implementation completely separate
from the Streamlit UI (app.py). It builds two independent fuzzy
control systems:

    1. Stress   Inference System
    2. Burnout  Inference System

Each system uses:
    - 4 Antecedents  : sleep, study, assignments, attendance
    - 1 Consequent   : stress   (0-100)  |  burnout (0-100)
    - Triangular membership functions   (fuzz.trimf)
    - Explicit fuzzy rules              (ctrl.Rule)
    - Mamdani-style inference           (skfuzzy.control default)
    - Centroid defuzzification          (skfuzzy default)

"""

import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl


# ---------------------------------------------------------------------------
# 1. Antecedent / Consequent definitions
# ---------------------------------------------------------------------------
def _build_variables():
    """Build the fuzzy variables and their membership functions."""

    # -------- Antecedents (inputs) --------
    sleep       = ctrl.Antecedent(np.arange(0, 12.01, 0.1),  'sleep')
    study       = ctrl.Antecedent(np.arange(0, 15.01, 0.1),  'study')
    assignments = ctrl.Antecedent(np.arange(0, 10.01, 0.1),  'assignments')
    attendance  = ctrl.Antecedent(np.arange(0, 100.01, 0.1), 'attendance')

    # -------- Consequents (outputs) --------
    stress  = ctrl.Consequent(np.arange(0, 101, 1), 'stress')
    burnout = ctrl.Consequent(np.arange(0, 101, 1), 'burnout')

    # -------- Membership functions --------
    # Sleep (hours / day)
    sleep['low']    = fuzz.trimf(sleep.universe, [0, 0, 5])
    sleep['medium'] = fuzz.trimf(sleep.universe, [4, 7, 9])
    sleep['high']   = fuzz.trimf(sleep.universe, [8, 12, 12])

    # Study (hours / day)
    study['low']    = fuzz.trimf(study.universe, [0, 0, 4])
    study['medium'] = fuzz.trimf(study.universe, [3, 6, 9])
    study['high']   = fuzz.trimf(study.universe, [8, 15, 15])

    # Assignments workload (0-10)
    assignments['low']    = fuzz.trimf(assignments.universe, [0, 0, 4])
    assignments['medium'] = fuzz.trimf(assignments.universe, [3, 5, 7])
    assignments['high']   = fuzz.trimf(assignments.universe, [6, 10, 10])

    # Attendance (%)
    attendance['low']    = fuzz.trimf(attendance.universe, [0, 0, 60])
    attendance['medium'] = fuzz.trimf(attendance.universe, [50, 75, 90])
    attendance['high']   = fuzz.trimf(attendance.universe, [80, 100, 100])

    # Stress (0-100)
    stress['low']    = fuzz.trimf(stress.universe, [0, 0, 40])
    stress['medium'] = fuzz.trimf(stress.universe, [30, 50, 70])
    stress['high']   = fuzz.trimf(stress.universe, [60, 100, 100])

    # Burnout (0-100)
    burnout['low']    = fuzz.trimf(burnout.universe, [0, 0, 40])
    burnout['medium'] = fuzz.trimf(burnout.universe, [30, 50, 70])
    burnout['high']   = fuzz.trimf(burnout.universe, [60, 100, 100])

    return sleep, study, assignments, attendance, stress, burnout


# ---------------------------------------------------------------------------
# 2. Rule bases
# ---------------------------------------------------------------------------
def _stress_rules(sleep, study, assignments, attendance, stress):
    """Fuzzy rules that describe how the four inputs drive STRESS."""
    rules = [
        # ---- HIGH stress cases ----
        ctrl.Rule(sleep['low'] & assignments['high'],                     stress['high']),
        ctrl.Rule(sleep['low'] & study['high'],                           stress['high']),
        ctrl.Rule(study['high'] & assignments['high'],                    stress['high']),
        ctrl.Rule(sleep['low'] & attendance['low'],                       stress['high']),
        ctrl.Rule(assignments['high'] & attendance['low'],                stress['high']),
        ctrl.Rule(sleep['low'] & study['high'] & assignments['high'],     stress['high']),

        # ---- MEDIUM stress cases ----
        ctrl.Rule(sleep['medium'] & assignments['medium'],                stress['medium']),
        ctrl.Rule(study['medium'] & assignments['medium'],                stress['medium']),
        ctrl.Rule(sleep['medium'] & study['high'],                        stress['medium']),
        ctrl.Rule(sleep['medium'] & attendance['medium'],                 stress['medium']),
        ctrl.Rule(assignments['medium'] & attendance['medium'],           stress['medium']),
        ctrl.Rule(sleep['high'] & assignments['high'],                    stress['medium']),
        ctrl.Rule(sleep['low'] & assignments['medium'],                   stress['medium']),

        # ---- LOW stress cases ----
        ctrl.Rule(sleep['high'] & assignments['low'],                     stress['low']),
        ctrl.Rule(sleep['high'] & study['low'] & attendance['high'],      stress['low']),
        ctrl.Rule(sleep['high'] & study['medium'] & assignments['low'],   stress['low']),
        ctrl.Rule(sleep['medium'] & assignments['low'] & attendance['high'], stress['low']),
    ]
    return rules


def _burnout_rules(sleep, study, assignments, attendance, burnout):
    """Fuzzy rules that describe how the four inputs drive BURNOUT.

    Burnout is modelled as a chronic overload signal:
    it grows especially when sleep is low AND workload is high for long
    stretches (approximated here by low attendance + high study/assignments).
    """
    rules = [
        # ---- HIGH burnout ----
        ctrl.Rule(sleep['low']  & study['high'] & assignments['high'],    burnout['high']),
        ctrl.Rule(sleep['low']  & assignments['high'] & attendance['low'],burnout['high']),
        ctrl.Rule(sleep['low']  & study['high']  & attendance['low'],     burnout['high']),
        ctrl.Rule(sleep['low']  & attendance['low'],                      burnout['high']),
        ctrl.Rule(study['high'] & assignments['high'] & attendance['low'],burnout['high']),

        # ---- MEDIUM burnout ----
        ctrl.Rule(sleep['low']    & assignments['medium'],                burnout['medium']),
        ctrl.Rule(sleep['medium'] & assignments['high'],                  burnout['medium']),
        ctrl.Rule(study['high']   & assignments['medium'],                burnout['medium']),
        ctrl.Rule(study['medium'] & assignments['high'],                  burnout['medium']),
        ctrl.Rule(sleep['low']    & study['medium'],                      burnout['medium']),
        ctrl.Rule(sleep['medium'] & attendance['low'],                    burnout['medium']),

        # ---- LOW burnout ----
        ctrl.Rule(sleep['high']   & assignments['low'],                   burnout['low']),
        ctrl.Rule(sleep['high']   & study['low'],                         burnout['low']),
        ctrl.Rule(sleep['high']   & attendance['high'] & assignments['low'], burnout['low']),
        ctrl.Rule(sleep['medium'] & assignments['low'] & attendance['high'], burnout['low']),
    ]
    return rules


# ---------------------------------------------------------------------------
# 3. Public API: build simulations + run inference
# ---------------------------------------------------------------------------
def build_systems():
    """Build and return two ControlSystemSimulation objects.

    Returns
    -------
    stress_sim  : ctrl.ControlSystemSimulation
    burnout_sim : ctrl.ControlSystemSimulation
    variables   : dict of the underlying Antecedent/Consequent objects
    """
    sleep, study, assignments, attendance, stress, burnout = _build_variables()

    stress_ctrl  = ctrl.ControlSystem(
        _stress_rules(sleep, study, assignments, attendance, stress)
    )
    burnout_ctrl = ctrl.ControlSystem(
        _burnout_rules(sleep, study, assignments, attendance, burnout)
    )

    stress_sim  = ctrl.ControlSystemSimulation(stress_ctrl)
    burnout_sim = ctrl.ControlSystemSimulation(burnout_ctrl)

    variables = dict(
        sleep=sleep, study=study, assignments=assignments,
        attendance=attendance, stress=stress, burnout=burnout,
    )
    return stress_sim, burnout_sim, variables


def _category(score: float) -> str:
    """Convert a defuzzified 0-100 score into a linguistic label."""
    if score < 40:
        return "Low"
    if score < 65:
        return "Medium"
    return "High"


def analyze(sleep_hours: float,
            study_hours: float,
            assignment_load: float,
            attendance_pct: float):
    """Run the full fuzzy inference for a single student.

    Parameters
    ----------
    sleep_hours      : float in [0, 12]
    study_hours      : float in [0, 15]
    assignment_load  : float in [0, 10]
    attendance_pct   : float in [0, 100]

    Returns
    -------
    dict with defuzzified scores and linguistic categories.
    """
    stress_sim, burnout_sim, _ = build_systems()

    # ---- Stress inference ----
    stress_sim.input['sleep']       = sleep_hours
    stress_sim.input['study']       = study_hours
    stress_sim.input['assignments'] = assignment_load
    stress_sim.input['attendance']  = attendance_pct
    stress_sim.compute()
    stress_score = float(stress_sim.output.get('stress', 50.0))

    # ---- Burnout inference ----
    burnout_sim.input['sleep']       = sleep_hours
    burnout_sim.input['study']       = study_hours
    burnout_sim.input['assignments'] = assignment_load
    burnout_sim.input['attendance']  = attendance_pct
    burnout_sim.compute()
    burnout_score = float(burnout_sim.output.get('burnout', 50.0))

    return {
        "stress_score":  round(stress_score, 2),
        "stress_level":  _category(stress_score),
        "burnout_score": round(burnout_score, 2),
        "burnout_risk":  _category(burnout_score),
    }


# ---------------------------------------------------------------------------
# 4. Membership degree helper (used by the UI to explain WHY)
# ---------------------------------------------------------------------------
def membership_degrees(sleep_hours, study_hours, assignment_load, attendance_pct):
    """Return the degree to which each input belongs to each fuzzy set."""
    _, _, variables = build_systems()  # rebuild for clean universes
    s, st, a, at = (variables['sleep'], variables['study'],
                    variables['assignments'], variables['attendance'])

    def degree(var, x):
        return {
            term: float(fuzz.interp_membership(var.universe, var[term].mf, x))
            for term in var.terms
        }

    return {
        "sleep":       degree(s,  sleep_hours),
        "study":       degree(st, study_hours),
        "assignments": degree(a,  assignment_load),
        "attendance":  degree(at, attendance_pct),
    }


# ---------------------------------------------------------------------------
# 5. Recommendations engine (driven by fuzzy outputs + raw inputs)
# ---------------------------------------------------------------------------
def recommendations(inputs: dict, results: dict):
    """Produce personalised, human-readable recommendations.

    Uses the defuzzified scores from the fuzzy inference *and* the raw
    inputs to explain what most likely drove the result.
    """
    tips = []

    sleep_h  = inputs["sleep"]
    study_h  = inputs["study"]
    load     = inputs["assignments"]
    attend   = inputs["attendance"]

    stress_lvl  = results["stress_level"]
    burnout_lvl = results["burnout_risk"]

    # ---- Sleep-driven tips ----
    if sleep_h < 6:
        tips.append(
            "😴 Your sleep is below the healthy range. Aim for 7-8 hours a night "
            "to lower cortisol levels and improve concentration."
        )
    elif sleep_h > 9:
        tips.append(
            "⏰ Over-sleeping (>9h) can indicate fatigue or low energy. "
            "Try a consistent 7-8h routine."
        )

    # ---- Study-driven tips ----
    if study_h > 9:
        tips.append(
            "📖 Study hours are very high. Break sessions with the Pomodoro method "
            "(25 min work / 5 min break) to avoid cognitive fatigue."
        )
    elif study_h < 3:
        tips.append(
            "📚 Study time is quite low. Even 2-3 focused sessions per day help "
            "prevent last-minute exam pressure."
        )

    # ---- Workload-driven tips ----
    if load >= 7:
        tips.append(
            "🗂️ Assignment workload is high. Prioritise using an Eisenhower matrix "
            "(Urgent/Important) and speak to faculty about deadline overlap."
        )

    # ---- Attendance-driven tips ----
    if attend < 65:
        tips.append(
            "🏫 Low attendance often creates learning gaps that snowball into stress. "
            "Try to attend at least 75% of classes."
        )

    # ---- Global stress / burnout tips ----
    if stress_lvl == "High":
        tips.append(
            "🧘 Stress score is HIGH. Add 10-15 min of daily mindfulness or exercise, "
            "and talk to a mentor or counsellor."
        )
    if burnout_lvl == "High":
        tips.append(
            "🚨 Burnout risk is HIGH. Schedule at least one full recovery day this week "
            "with no academic work."
        )
    if stress_lvl == "Low" and burnout_lvl == "Low":
        tips.append(
            "✅ You are in a healthy zone. Keep your current routine and "
            "re-evaluate weekly."
        )

    # Fallback so the panel is never empty
    if not tips:
        tips.append(
            "🧠 Your inputs are balanced. Maintain regular sleep, study, and "
            "attendance rhythms."
        )

    return tips


# ---------------------------------------------------------------------------
# 6. Human-readable descriptions of the rule base (for the viva panel)
# ---------------------------------------------------------------------------
STRESS_RULES_TEXT = [
    "IF sleep is LOW AND assignments is HIGH  →  stress is HIGH",
    "IF sleep is LOW AND study is HIGH        →  stress is HIGH",
    "IF study is HIGH AND assignments is HIGH →  stress is HIGH",
    "IF sleep is LOW AND attendance is LOW    →  stress is HIGH",
    "IF assignments is HIGH AND attendance is LOW → stress is HIGH",
    "IF sleep is MEDIUM AND assignments is MEDIUM → stress is MEDIUM",
    "IF study is MEDIUM AND assignments is MEDIUM → stress is MEDIUM",
    "IF sleep is MEDIUM AND study is HIGH     →  stress is MEDIUM",
    "IF sleep is HIGH AND assignments is HIGH →  stress is MEDIUM",
    "IF sleep is HIGH AND assignments is LOW  →  stress is LOW",
    "IF sleep is HIGH AND study is LOW AND attendance is HIGH → stress is LOW",
    "IF sleep is MEDIUM AND assignments is LOW AND attendance is HIGH → stress is LOW",
]

BURNOUT_RULES_TEXT = [
    "IF sleep is LOW AND study is HIGH AND assignments is HIGH  →  burnout is HIGH",
    "IF sleep is LOW AND assignments is HIGH AND attendance is LOW → burnout is HIGH",
    "IF sleep is LOW AND study is HIGH AND attendance is LOW   →  burnout is HIGH",
    "IF study is HIGH AND assignments is HIGH AND attendance is LOW → burnout is HIGH",
    "IF sleep is LOW AND assignments is MEDIUM  →  burnout is MEDIUM",
    "IF sleep is MEDIUM AND assignments is HIGH →  burnout is MEDIUM",
    "IF study is HIGH AND assignments is MEDIUM →  burnout is MEDIUM",
    "IF sleep is MEDIUM AND attendance is LOW   →  burnout is MEDIUM",
    "IF sleep is HIGH AND assignments is LOW    →  burnout is LOW",
    "IF sleep is HIGH AND study is LOW          →  burnout is LOW",
    "IF sleep is HIGH AND attendance is HIGH AND assignments is LOW → burnout is LOW",
]


MEMBERSHIP_TEXT = {
    "Sleep (hours/day)": {
        "Low":    "0 - 5 hours",
        "Medium": "4 - 9 hours (peak at 7)",
        "High":   "8 - 12 hours",
    },
    "Study (hours/day)": {
        "Low":    "0 - 4 hours",
        "Medium": "3 - 9 hours (peak at 6)",
        "High":   "8 - 15 hours",
    },
    "Assignments (0-10)": {
        "Low":    "0 - 4",
        "Medium": "3 - 7 (peak at 5)",
        "High":   "6 - 10",
    },
    "Attendance (%)": {
        "Low":    "0 - 60 %",
        "Medium": "50 - 90 % (peak at 75)",
        "High":   "80 - 100 %",
    },
    "Stress / Burnout (score /100)": {
        "Low":    "0 - 40",
        "Medium": "30 - 70 (peak at 50)",
        "High":   "60 - 100",
    },
}


if __name__ == "__main__":
    # Quick smoke test when running the module directly.
    demo = analyze(sleep_hours=4, study_hours=10, assignment_load=8, attendance_pct=55)
    print("Demo output:", demo)
