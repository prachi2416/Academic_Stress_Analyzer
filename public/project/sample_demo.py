"""
Quick command-line demo (optional).
    python sample_demo.py
"""
from fuzzy_system import predict

if __name__ == '__main__':
    print('=== Smart Academic Stress Analyzer — demo ===')
    cases = [
        ('Stressed student', dict(sleep_hours=4, study_hours=12, assignment_workload=8, attendance_pct=55)),
        ('Balanced student', dict(sleep_hours=8, study_hours=6, assignment_workload=4, attendance_pct=90)),
        ('Relaxed student', dict(sleep_hours=10, study_hours=2, assignment_workload=2, attendance_pct=95)),
    ]
    for name, kw in cases:
        r = predict(**kw)
        print(f'\n{name}: {kw}')
        print(f"  Stress : {r['stress_score']:6.2f}  ({r['stress_level']})")
        print(f"  Burnout: {r['burnout_score']:6.2f}  ({r['burnout_level']})")
