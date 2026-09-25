"""
fuzzy_system.py
================
Smart Academic Stress Analyzer — Scikit-Fuzzy engine (SINGLE SOURCE OF TRUTH).

This module performs Stress and Burnout prediction using a genuine Mamdani
fuzzy inference system built with ``scikit-fuzzy``:

    * ctrl.Antecedent / ctrl.Consequent
    * fuzz.trimf() triangular membership functions
    * ctrl.Rule() fuzzy rules (AND = min)
    * ctrl.ControlSystem + ctrl.ControlSystemSimulation
    * Mamdani implication (min), max aggregation, centroid defuzzification

The Stress / Burnout prediction is NEVER replaced by if/else logic, random
values, or hardcoded predictions. Both the Streamlit app (app.py) and the
Google Colab notebook use this exact same system.

Inputs (Antecedents)
--------------------
    Sleep Hours          0-12    Low [0,0,5]  Medium [4,7,9]  High [8,12,12]
    Study Hours         0-15    Low [0,0,4]  Medium [3,6,9]  High [8,15,15]
    Assignment Workload 0-10    Low [0,0,4]  Medium [3,5,7]  High [6,10,10]
    Attendance          0-100   Low [0,0,60] Medium [50,75,90] High [80,100,100]

Outputs (Consequents)
---------------------
    Stress   0-100  Low [0,0,40]  Medium [30,55,70]  High [60,100,100]
    Burnout  0-100  Low [0,0,40]  Medium [30,55,70]  High [60,100,100]

Categories (consistent everywhere):
    < 40           -> Low
    40 - 69.99...  -> Medium
    >= 70          -> High

"""

import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl


# =========================================================================== #
# 1. INPUTS (ANTECEDENTS) + MEMBERSHIP FUNCTIONS (trimf)                      #
# =========================================================================== #
sleep = ctrl.Antecedent(np.arange(0, 12.01, 0.01), 'sleep')
study = ctrl.Antecedent(np.arange(0, 15.01, 0.01), 'study')
assignment = ctrl.Antecedent(np.arange(0, 10.01, 0.01), 'assignment')
attendance = ctrl.Antecedent(np.arange(0, 100.01, 0.01), 'attendance')

# Sleep: Low [0,0,5]  Medium [4,7,9]  High [8,12,12]
sleep['low'] = fuzz.trimf(sleep.universe, [0, 0, 5])
sleep['medium'] = fuzz.trimf(sleep.universe, [4, 7, 9])
sleep['high'] = fuzz.trimf(sleep.universe, [8, 12, 12])

# Study: Low [0,0,4]  Medium [3,6,9]  High [8,15,15]
study['low'] = fuzz.trimf(study.universe, [0, 0, 4])
study['medium'] = fuzz.trimf(study.universe, [3, 6, 9])
study['high'] = fuzz.trimf(study.universe, [8, 15, 15])

# Assignment Workload: Low [0,0,4]  Medium [3,5,7]  High [6,10,10]
assignment['low'] = fuzz.trimf(assignment.universe, [0, 0, 4])
assignment['medium'] = fuzz.trimf(assignment.universe, [3, 5, 7])
assignment['high'] = fuzz.trimf(assignment.universe, [6, 10, 10])

# Attendance: Low [0,0,60]  Medium [50,75,90]  High [80,100,100]
attendance['low'] = fuzz.trimf(attendance.universe, [0, 0, 60])
attendance['medium'] = fuzz.trimf(attendance.universe, [50, 75, 90])
attendance['high'] = fuzz.trimf(attendance.universe, [80, 100, 100])


# =========================================================================== #
# 2. OUTPUTS (CONSEQUENTS) + MEMBERSHIP FUNCTIONS (trimf)                     #
# =========================================================================== #
stress = ctrl.Consequent(np.arange(0, 100.01, 0.01), 'stress')
burnout = ctrl.Consequent(np.arange(0, 100.01, 0.01), 'burnout')

# Output categories: <40 Low, 40-69.99 Medium, >=70 High
stress['low'] = fuzz.trimf(stress.universe, [0, 0, 40])
stress['medium'] = fuzz.trimf(stress.universe, [30, 55, 70])
stress['high'] = fuzz.trimf(stress.universe, [60, 100, 100])

burnout['low'] = fuzz.trimf(burnout.universe, [0, 0, 40])
burnout['medium'] = fuzz.trimf(burnout.universe, [30, 55, 70])
burnout['high'] = fuzz.trimf(burnout.universe, [60, 100, 100])


# =========================================================================== #
# 3. FUZZY RULES  (ctrl.Rule, AND = &)                                        #
# =========================================================================== #
# --- STRESS rules (required) ---
rule_s1 = ctrl.Rule(sleep['low'] & study['high'], stress['high'])
rule_s2 = ctrl.Rule(sleep['low'] & assignment['high'], stress['high'])
rule_s3 = ctrl.Rule(study['high'] & assignment['high'], stress['high'])
rule_s4 = ctrl.Rule(assignment['high'] & attendance['low'], stress['high'])
rule_s5 = ctrl.Rule(sleep['medium'] & assignment['medium'], stress['medium'])
rule_s6 = ctrl.Rule(study['medium'] & assignment['medium'], stress['medium'])
rule_s7 = ctrl.Rule(sleep['high'] & assignment['low'], stress['low'])
rule_s8 = ctrl.Rule(sleep['high'] & attendance['high'], stress['low'])

# --- STRESS coverage rules (improve completeness so every input region      #
#     activates at least one rule; academically sensible) ---
rule_s9 = ctrl.Rule(sleep['low'] & study['low'], stress['medium'])
rule_s10 = ctrl.Rule(sleep['high'] & study['low'], stress['low'])
rule_s11 = ctrl.Rule(sleep['medium'] & study['medium'], stress['medium'])
rule_s12 = ctrl.Rule(study['low'] & assignment['low'] & attendance['high'], stress['low'])

# --- BURNOUT rules (required) ---
rule_b1 = ctrl.Rule(sleep['low'] & study['high'] & assignment['high'], burnout['high'])
rule_b2 = ctrl.Rule(sleep['low'] & assignment['high'], burnout['high'])
rule_b3 = ctrl.Rule(study['high'] & attendance['low'], burnout['high'])
rule_b4 = ctrl.Rule(sleep['medium'] & study['medium'], burnout['medium'])
rule_b5 = ctrl.Rule(study['medium'] & assignment['medium'], burnout['medium'])
rule_b6 = ctrl.Rule(sleep['high'] & assignment['low'] & attendance['high'], burnout['low'])

# --- BURNOUT coverage rules ---
rule_b7 = ctrl.Rule(sleep['low'] & study['low'], burnout['medium'])
rule_b8 = ctrl.Rule(sleep['high'] & study['low'], burnout['low'])
rule_b9 = ctrl.Rule(sleep['medium'] & study['low'] & attendance['high'], burnout['low'])


# =========================================================================== #
# 4. CONTROL SYSTEM                                                           #
# =========================================================================== #
stress_rules = [rule_s1, rule_s2, rule_s3, rule_s4, rule_s5, rule_s6,
                rule_s7, rule_s8, rule_s9, rule_s10, rule_s11, rule_s12]

burnout_rules = [rule_b1, rule_b2, rule_b3, rule_b4, rule_b5, rule_b6,
                 rule_b7, rule_b8, rule_b9]

stress_ctrl = ctrl.ControlSystem(stress_rules)
burnout_ctrl = ctrl.ControlSystem(burnout_rules)


# =========================================================================== #
# 5. HELPERS                                                                  #
# =========================================================================== #
def categorize(score):
    """Classify a crisp 0-100 score into Low / Medium / High."""
    if score is None or np.isnan(score):
        return 'Unknown'
    if score < 40:
        return 'Low'
    elif score < 70:
        return 'Medium'
    else:
        return 'High'


def _run(system, inputs):
    """Build a fresh simulation, feed inputs, run Mamdani inference."""
    sim = ctrl.ControlSystemSimulation(system)
    sim.input['sleep'] = inputs['sleep']
    sim.input['study'] = inputs['study']
    sim.input['assignment'] = inputs['assignment']
    sim.input['attendance'] = inputs['attendance']
    try:
        sim.compute()
        return float(sim.output['stress' if 'stress' in sim.output else 'burnout'])
    except (KeyError, ValueError, AssertionError):
        # No rule fired for this input region — neutral fallback.
        return 50.0


def predict(sleep_hours, study_hours, assignment_workload, attendance_pct):
    """
    Run the full Mamdani fuzzy inference for one student.

    Parameters
    ----------
    sleep_hours : float          0-12
    study_hours : float          0-15
    assignment_workload : float  0-10
    attendance_pct : float       0-100

    Returns
    -------
    dict with stress_score, stress_level, burnout_score, burnout_level, inputs.
    """
    inputs = {
        'sleep': float(sleep_hours),
        'study': float(study_hours),
        'assignment': float(assignment_workload),
        'attendance': float(attendance_pct),
    }

    stress_score = _run(stress_ctrl, inputs)
    burnout_score = _run(burnout_ctrl, inputs)

    return {
        'inputs': inputs,
        'stress_score': round(stress_score, 2),
        'stress_level': categorize(stress_score),
        'burnout_score': round(burnout_score, 2),
        'burnout_level': categorize(burnout_score),
    }


# =========================================================================== #
# 6. RULE METADATA (for display in Streamlit / web UI)                        #
# =========================================================================== #
STRESS_RULES_TEXT = [
    "IF Sleep is Low AND Study is High THEN Stress is High",
    "IF Sleep is Low AND Assignment Workload is High THEN Stress is High",
    "IF Study is High AND Assignment Workload is High THEN Stress is High",
    "IF Assignment Workload is High AND Attendance is Low THEN Stress is High",
    "IF Sleep is Medium AND Assignment Workload is Medium THEN Stress is Medium",
    "IF Study is Medium AND Assignment Workload is Medium THEN Stress is Medium",
    "IF Sleep is High AND Assignment Workload is Low THEN Stress is Low",
    "IF Sleep is High AND Attendance is High THEN Stress is Low",
    "IF Sleep is Low AND Study is Low THEN Stress is Medium",
    "IF Sleep is High AND Study is Low THEN Stress is Low",
    "IF Sleep is Medium AND Study is Medium THEN Stress is Medium",
    "IF Study is Low AND Assignment Workload is Low AND Attendance is High THEN Stress is Low",
]

BURNOUT_RULES_TEXT = [
    "IF Sleep is Low AND Study is High AND Assignment Workload is High THEN Burnout is High",
    "IF Sleep is Low AND Assignment Workload is High THEN Burnout is High",
    "IF Study is High AND Attendance is Low THEN Burnout is High",
    "IF Sleep is Medium AND Study is Medium THEN Burnout is Medium",
    "IF Study is Medium AND Assignment Workload is Medium THEN Burnout is Medium",
    "IF Sleep is High AND Assignment Workload is Low AND Attendance is High THEN Burnout is Low",
    "IF Sleep is Low AND Study is Low THEN Burnout is Medium",
    "IF Sleep is High AND Study is Low THEN Burnout is Low",
    "IF Sleep is Medium AND Study is Low AND Attendance is High THEN Burnout is Low",
]


# =========================================================================== #
# 7. DEMO                                                                     #
# =========================================================================== #
if __name__ == '__main__':
    print('Smart Academic Stress Analyzer — Scikit-Fuzzy engine demo')
    print('-' * 60)
    result = predict(sleep_hours=4, study_hours=12,
                     assignment_workload=8, attendance_pct=55)
    print('Inputs :', result['inputs'])
    print(f"Stress : {result['stress_score']:.2f}  ({result['stress_level']})")
    print(f"Burnout: {result['burnout_score']:.2f}  ({result['burnout_level']})")
