"""
recommendations.py
==================
Contributing-factor analysis, personalized recommendations and a 7-day action
plan for the Smart Academic Stress Analyzer.

IMPORTANT
---------
The actual Stress / Burnout *scores* are produced by ``fuzzy_system.py``
using Scikit-Fuzzy (Mamdani + centroid defuzzification). This module only
explains the *contributing factors* and suggests *what to do* about them,
using simple if/else heuristics on the raw student inputs (which is allowed).
"""

from fuzzy_system import categorize


# Thresholds used for factor detection (kept consistent with the project).
SLEEP_LOW = 6.0        # hours
STUDY_HIGH = 10.0      # hours
WORKLOAD_HIGH = 6.0    # 0-10 scale
ATTENDANCE_LOW = 70.0  # percent


def contributing_factors(inputs):
    """
    Return a list of contributing factors based on the raw student inputs.

    Each factor: {factor, value, unit, detail, severity}
    """
    factors = []

    if inputs['sleep'] < SLEEP_LOW:
        gap = round(SLEEP_LOW - inputs['sleep'], 1)
        factors.append({
            'factor': 'Low Sleep',
            'value': inputs['sleep'],
            'unit': 'hours',
            'severity': 'High' if inputs['sleep'] < 4 else 'Medium',
            'detail': f"Sleeping {inputs['sleep']}h is below the healthy "
                      f"minimum (~{SLEEP_LOW:.0f}h); a deficit of {gap}h.",
        })

    if inputs['study'] > STUDY_HIGH:
        factors.append({
            'factor': 'High Study Hours',
            'value': inputs['study'],
            'unit': 'hours',
            'severity': 'High' if inputs['study'] >= 12 else 'Medium',
            'detail': f"Studying {inputs['study']}h/day is well above the "
                      f"recommended focus budget (~{STUDY_HIGH:.0f}h).",
        })

    if inputs['assignment'] > WORKLOAD_HIGH:
        factors.append({
            'factor': 'High Assignment Workload',
            'value': inputs['assignment'],
            'unit': '/10',
            'severity': 'High' if inputs['assignment'] >= 8 else 'Medium',
            'detail': f"Workload rated {inputs['assignment']}/10 indicates a "
                      f"heavy pile of pending assignments.",
        })

    if inputs['attendance'] < ATTENDANCE_LOW:
        factors.append({
            'factor': 'Low Attendance',
            'value': inputs['attendance'],
            'unit': '%',
            'severity': 'High' if inputs['attendance'] < 50 else 'Medium',
            'detail': f"Attendance at {inputs['attendance']}% is below the "
                      f"{ATTENDANCE_LOW:.0f}% expected for steady progress.",
        })

    if not factors:
        factors.append({
            'factor': 'Balanced Profile',
            'value': None,
            'unit': '',
            'severity': 'Low',
            'detail': 'All inputs are within healthy ranges. Keep it up!',
        })

    return factors


def recommendations(inputs, stress_level, burnout_level):
    """
    Personalized recommendations driven by the raw inputs (simple if/else).
    """
    recs = []

    if inputs['sleep'] < SLEEP_LOW:
        recs.append({
            'title': 'Improve your sleep routine',
            'detail': 'Aim for 7-8 hours. Set a fixed bedtime, avoid screens '
                      '30 min before sleep, and cut caffeine after 4 PM.',
        })

    if inputs['study'] > STUDY_HIGH:
        recs.append({
            'title': 'Use shorter, focused study sessions',
            'detail': 'Switch to Pomodoro (25 min focus + 5 min break). '
                      'Spacing study blocks improves retention and lowers fatigue.',
        })

    if inputs['assignment'] > WORKLOAD_HIGH:
        recs.append({
            'title': 'Break assignments into smaller tasks',
            'detail': 'Split each assignment into sub-tasks, prioritise by '
                      'deadline, and tackle one piece at a time to avoid overload.',
        })

    if inputs['attendance'] < ATTENDANCE_LOW:
        recs.append({
            'title': 'Review missed classes & improve attendance',
            'detail': 'Catch up on missed lectures using notes/recordings and '
                      'commit to attending upcoming classes to stay on track.',
        })

    if stress_level == 'High' or burnout_level == 'High':
        recs.append({
            'title': 'Reach out for support',
            'detail': 'High stress/burnout levels were detected. Consider '
                      'talking to a mentor, counsellor, or campus support service.',
        })

    if not recs:
        recs.append({
            'title': 'Maintain your healthy routine',
            'detail': 'Your profile looks balanced. Keep monitoring your sleep '
                      'and workload to stay in the green zone.',
        })

    return recs


def action_plan(inputs, stress_level, burnout_level):
    """
    A simple, personalised 7-day action plan derived from the inputs.
    """
    low_sleep = inputs['sleep'] < SLEEP_LOW
    high_study = inputs['study'] > STUDY_HIGH
    high_load = inputs['assignment'] > WORKLOAD_HIGH
    low_att = inputs['attendance'] < ATTENDANCE_LOW

    plan = []

    # Day 1 — foundation
    tasks = ['Audit your current weekly schedule (study, sleep, classes).']
    if low_sleep:
        tasks.append('Set a fixed bedtime tonight targeting 7-8h of sleep.')
    if high_load:
        tasks.append('List every pending assignment and rank by deadline.')
    plan.append({'day': 1, 'focus': 'Audit & plan', 'tasks': tasks})

    # Day 2 — sleep
    tasks = ['Begin a wind-down routine 45 min before bed (no screens).']
    if low_sleep:
        tasks.append('Go to bed 30 min earlier than usual.')
    plan.append({'day': 2, 'focus': 'Sleep recovery', 'tasks': tasks})

    # Day 3 — study technique
    tasks = ['Try two Pomodoro focus blocks (25 min + 5 min break).']
    if high_study:
        tasks.append('Cap total study at 6 focused hours; rest the remainder.')
    plan.append({'day': 3, 'focus': 'Smarter study', 'tasks': tasks})

    # Day 4 — assignments
    tasks = ['Pick one assignment and break it into 3-5 sub-tasks.']
    if high_load:
        tasks.append('Complete the first sub-task of your hardest assignment.')
    plan.append({'day': 4, 'focus': 'Tame the workload', 'tasks': tasks})

    # Day 5 — attendance
    tasks = ['Attend all scheduled classes today.']
    if low_att:
        tasks.append('Collect notes/recordings for 2 missed lectures and review them.')
    plan.append({'day': 5, 'focus': 'Attendance catch-up', 'tasks': tasks})

    # Day 6 — active rest
    tasks = ['Take a 20-30 min walk or light exercise.']
    if stress_level in ('High', 'Medium') or burnout_level in ('High', 'Medium'):
        tasks.append('Do a 5-minute breathing/relaxation exercise.')
    plan.append({'day': 6, 'focus': 'Active rest', 'tasks': tasks})

    # Day 7 — review
    tasks = ['Re-assess your stress using this analyzer with updated inputs.']
    tasks.append('Keep what worked this week; adjust one habit that did not.')
    plan.append({'day': 7, 'focus': 'Review & adjust', 'tasks': tasks})

    return plan


if __name__ == '__main__':
    demo = {'sleep': 4, 'study': 12, 'assignment': 8, 'attendance': 55}
    print('Factors:', contributing_factors(demo))
    print('Recs   :', recommendations(demo, 'High', 'High'))
    print('Plan   :', action_plan(demo, 'High', 'High'))
