// Generates Smart_Academic_Stress_Analyzer.ipynb as valid Jupyter/Colab JSON.
// Run: node scripts/gen_notebook.mjs
import { writeFileSync, mkdirSync } from 'node:fs';

function splitLines(text) {
  const lines = text.split('\n');
  // Each line gets a trailing \n except the last.
  return lines.map((l, i) => (i < lines.length - 1 ? l + '\n' : l));
}

function md(text) {
  return { cell_type: 'markdown', metadata: {}, source: splitLines(text) };
}

function code(text) {
  return {
    cell_type: 'code',
    execution_count: null,
    metadata: { colab: { base_uri: 'https://localhost:8080/' } },
    outputs: [],
    source: splitLines(text),
  };
}

const cells = [];

// ----------------------------------------------------------------------- //
cells.push(md(`### 🌐 Smart Academic Stress Analyzer Web Application

[🚀 Open Web Application](YOUR_DEPLOYED_WEB_APP_URL)

---`));

// ----------------------------------------------------------------------- //
cells.push(md(`# 🎓 Smart Academic Stress Analyzer — Scikit-Fuzzy (Google Colab)

A **Mamdani fuzzy inference system** built with \`scikit-fuzzy\` that predicts
student **Stress** and **Burnout** from four academic inputs.

> M.Sc. Data Science — Soft Computing Techniques (SCT) mini project.

**This notebook runs the SAME membership functions and rules as the Streamlit app (\`app.py\` / \`fuzzy_system.py\`).**

The flow the professor can follow end-to-end:

**Membership Functions → Fuzzy Rules → Mamdani Inference → Defuzzification → Stress / Burnout Output**`));

// ----------------------------------------------------------------------- //
cells.push(md(`## Step 1 — Install Scikit-Fuzzy`));
cells.push(code(`# scikit-fuzzy is not pre-installed in Colab
!pip install scikit-fuzzy -q`));

// ----------------------------------------------------------------------- //
cells.push(md(`## Step 2 — Import libraries`));
cells.push(code(`import numpy as np
import matplotlib.pyplot as plt
import skfuzzy as fuzz
from skfuzzy import control as ctrl

print('scikit-fuzzy version:', fuzz.__version__ if hasattr(fuzz, '__version__') else 'installed')
print('Ready ✅')`));

// ----------------------------------------------------------------------- //
cells.push(md(`## Step 3 — Define the four inputs (Antecedents)

| Input | Range | Low | Medium | High |
|---|---|---|---|---|
| Sleep Hours | 0–12 | \`[0,0,5]\` | \`[4,7,9]\` | \`[8,12,12]\` |
| Study Hours | 0–15 | \`[0,0,4]\` | \`[3,6,9]\` | \`[8,15,15]\` |
| Assignment Workload | 0–10 | \`[0,0,4]\` | \`[3,5,7]\` | \`[6,10,10]\` |
| Attendance | 0–100 | \`[0,0,60]\` | \`[50,75,90]\` | \`[80,100,100]\` |`));

cells.push(code(`# Universes (fine grid for accurate centroid defuzzification)
sleep      = ctrl.Antecedent(np.arange(0, 12.01, 0.01), 'sleep')
study      = ctrl.Antecedent(np.arange(0, 15.01, 0.01), 'study')
assignment = ctrl.Antecedent(np.arange(0, 10.01, 0.01), 'assignment')
attendance = ctrl.Antecedent(np.arange(0, 100.01, 0.01), 'attendance')

print('Antecedents created:', sleep.label, study.label, assignment.label, attendance.label)`));

// ----------------------------------------------------------------------- //
cells.push(md(`## Step 4 — Define membership functions (trimf)`));
cells.push(code(`# Sleep: Low [0,0,5]  Medium [4,7,9]  High [8,12,12]
sleep['low']    = fuzz.trimf(sleep.universe, [0, 0, 5])
sleep['medium'] = fuzz.trimf(sleep.universe, [4, 7, 9])
sleep['high']   = fuzz.trimf(sleep.universe, [8, 12, 12])

# Study: Low [0,0,4]  Medium [3,6,9]  High [8,15,15]
study['low']    = fuzz.trimf(study.universe, [0, 0, 4])
study['medium'] = fuzz.trimf(study.universe, [3, 6, 9])
study['high']   = fuzz.trimf(study.universe, [8, 15, 15])

# Assignment Workload: Low [0,0,4]  Medium [3,5,7]  High [6,10,10]
assignment['low']    = fuzz.trimf(assignment.universe, [0, 0, 4])
assignment['medium'] = fuzz.trimf(assignment.universe, [3, 5, 7])
assignment['high']   = fuzz.trimf(assignment.universe, [6, 10, 10])

# Attendance: Low [0,0,60]  Medium [50,75,90]  High [80,100,100]
attendance['low']    = fuzz.trimf(attendance.universe, [0, 0, 60])
attendance['medium'] = fuzz.trimf(attendance.universe, [50, 75, 90])
attendance['high']   = fuzz.trimf(attendance.universe, [80, 100, 100])

print('Membership functions defined for all four inputs.')`));

// ----------------------------------------------------------------------- //
cells.push(md(`## Step 5 — Plot the input membership functions`));
cells.push(code(`fig, axes = plt.subplots(2, 2, figsize=(13, 8))
inputs = [(sleep, 'Sleep (hours)'), (study, 'Study (hours)'),
          (assignment, 'Assignment Workload (0-10)'), (attendance, 'Attendance (%)')]

for ax, (var, label) in zip(axes.flat, inputs):
    for term in ['low', 'medium', 'high']:
        ax.plot(var.universe, var[term].mf, label=term, linewidth=2)
    ax.set_title(label)
    ax.set_ylim(-0.05, 1.1)
    ax.legend(loc='upper right')
    ax.grid(alpha=0.25)
fig.tight_layout()
plt.show()`));

// ----------------------------------------------------------------------- //
cells.push(md(`## Step 6 — Define the Stress and Burnout outputs (Consequents)

Both outputs range 0–100 with the same membership functions:

| Term | trimf |
|---|---|
| Low | \`[0, 0, 40]\` |
| Medium | \`[30, 55, 70]\` |
| High | \`[60, 100, 100]\` |

**Categories (consistent everywhere):** \`< 40\` → Low · \`40-69.99\` → Medium · \`>= 70\` → High`));

cells.push(code(`stress  = ctrl.Consequent(np.arange(0, 100.01, 0.01), 'stress')
burnout = ctrl.Consequent(np.arange(0, 100.01, 0.01), 'burnout')

# Output membership functions
stress['low']    = fuzz.trimf(stress.universe, [0, 0, 40])
stress['medium'] = fuzz.trimf(stress.universe, [30, 55, 70])
stress['high']   = fuzz.trimf(stress.universe, [60, 100, 100])

burnout['low']    = fuzz.trimf(burnout.universe, [0, 0, 40])
burnout['medium'] = fuzz.trimf(burnout.universe, [30, 55, 70])
burnout['high']   = fuzz.trimf(burnout.universe, [60, 100, 100])

print('Consequents (Stress, Burnout) created with membership functions.')`));

// ----------------------------------------------------------------------- //
cells.push(md(`## Step 7 — Define the fuzzy rules (ctrl.Rule, AND = &)

These are the **exact same rules** used by the Streamlit application.`));

cells.push(code(`# ---------------- STRESS rules ----------------
rule_s1  = ctrl.Rule(sleep['low'] & study['high'], stress['high'])
rule_s2  = ctrl.Rule(sleep['low'] & assignment['high'], stress['high'])
rule_s3  = ctrl.Rule(study['high'] & assignment['high'], stress['high'])
rule_s4  = ctrl.Rule(assignment['high'] & attendance['low'], stress['high'])
rule_s5  = ctrl.Rule(sleep['medium'] & assignment['medium'], stress['medium'])
rule_s6  = ctrl.Rule(study['medium'] & assignment['medium'], stress['medium'])
rule_s7  = ctrl.Rule(sleep['high'] & assignment['low'], stress['low'])
rule_s8  = ctrl.Rule(sleep['high'] & attendance['high'], stress['low'])
# coverage rules
rule_s9  = ctrl.Rule(sleep['low'] & study['low'], stress['medium'])
rule_s10 = ctrl.Rule(sleep['high'] & study['low'], stress['low'])
rule_s11 = ctrl.Rule(sleep['medium'] & study['medium'], stress['medium'])
rule_s12 = ctrl.Rule(study['low'] & assignment['low'] & attendance['high'], stress['low'])

# ---------------- BURNOUT rules ----------------
rule_b1 = ctrl.Rule(sleep['low'] & study['high'] & assignment['high'], burnout['high'])
rule_b2 = ctrl.Rule(sleep['low'] & assignment['high'], burnout['high'])
rule_b3 = ctrl.Rule(study['high'] & attendance['low'], burnout['high'])
rule_b4 = ctrl.Rule(sleep['medium'] & study['medium'], burnout['medium'])
rule_b5 = ctrl.Rule(study['medium'] & assignment['medium'], burnout['medium'])
rule_b6 = ctrl.Rule(sleep['high'] & assignment['low'] & attendance['high'], burnout['low'])
# coverage rules
rule_b7 = ctrl.Rule(sleep['low'] & study['low'], burnout['medium'])
rule_b8 = ctrl.Rule(sleep['high'] & study['low'], burnout['low'])
rule_b9 = ctrl.Rule(sleep['medium'] & study['low'] & attendance['high'], burnout['low'])

stress_rules  = [rule_s1, rule_s2, rule_s3, rule_s4, rule_s5, rule_s6,
                 rule_s7, rule_s8, rule_s9, rule_s10, rule_s11, rule_s12]
burnout_rules = [rule_b1, rule_b2, rule_b3, rule_b4, rule_b5, rule_b6,
                 rule_b7, rule_b8, rule_b9]

print(f'Defined {len(stress_rules)} Stress rules and {len(burnout_rules)} Burnout rules.')`));

// ----------------------------------------------------------------------- //
cells.push(md(`## Step 8 — Create the ControlSystem`));
cells.push(code(`stress_ctrl  = ctrl.ControlSystem(stress_rules)
burnout_ctrl = ctrl.ControlSystem(burnout_rules)

print('Stress ControlSystem and Burnout ControlSystem created (Mamdani, centroid defuzz).')`));

// ----------------------------------------------------------------------- //
cells.push(md(`## Step 9 — Create the ControlSystemSimulation`));
cells.push(code(`stress_sim  = ctrl.ControlSystemSimulation(stress_ctrl)
burnout_sim = ctrl.ControlSystemSimulation(burnout_ctrl)

print('ControlSystemSimulation objects ready.')`));

// ----------------------------------------------------------------------- //
cells.push(md(`## Step 10 — Provide sample student inputs

Edit these values to test different student profiles.`));
cells.push(code(`sleep_hours          = 4.0    # 0-12
study_hours          = 12.0   # 0-15
assignment_workload  = 8.0    # 0-10
attendance_pct       = 55.0   # 0-100

print(f'Sleep hours         : {sleep_hours}')\nprint(f'Study hours         : {study_hours}')\nprint(f'Assignment workload : {assignment_workload}')\nprint(f'Attendance %        : {attendance_pct}')`));

// ----------------------------------------------------------------------- //
cells.push(md(`## Step 11 — Run the fuzzy inference (Mamdani + centroid defuzzification)`));
cells.push(code(`# Feed the same inputs to both systems
stress_sim.input['sleep']      = sleep_hours
stress_sim.input['study']      = study_hours
stress_sim.input['assignment'] = assignment_workload
stress_sim.input['attendance'] = attendance_pct
stress_sim.compute()        # Mamdani inference + centroid defuzzification

burnout_sim.input['sleep']      = sleep_hours
burnout_sim.input['study']      = study_hours
burnout_sim.input['assignment'] = assignment_workload
burnout_sim.input['attendance'] = attendance_pct
burnout_sim.compute()        # Mamdani inference + centroid defuzzification

print('Fuzzy inference completed ✅')`));

// ----------------------------------------------------------------------- //
cells.push(md(`## Step 12 — Show the Stress score`));
cells.push(code(`stress_score = float(stress_sim.output['stress'])
print(f'🧠 Stress Score = {stress_score:.2f} / 100')`));

// ----------------------------------------------------------------------- //
cells.push(md(`## Step 13 — Show the Burnout score`));
cells.push(code(`burnout_score = float(burnout_sim.output['burnout'])
print(f'🔥 Burnout Score = {burnout_score:.2f} / 100')`));

// ----------------------------------------------------------------------- //
cells.push(md(`## Step 14 — Show the Low / Medium / High categories

Thresholds (consistent with the Streamlit app):
- \`< 40\` → **Low**
- \`40 - 69.99…\` → **Medium**
- \`>= 70\` → **High**`));
cells.push(code(`def categorize(score):\n    if score < 40:\n        return 'Low'\n    elif score < 70:\n        return 'Medium'\n    else:\n        return 'High'\n\nstress_level  = categorize(stress_score)\nburnout_level = categorize(burnout_score)\n\nprint('=' * 48)\nprint(f'  Stress  : {stress_score:6.2f} / 100   ->  {stress_level}')\nprint(f'  Burnout : {burnout_score:6.2f} / 100   ->  {burnout_level}')\nprint('=' * 48)`));

// ----------------------------------------------------------------------- //
cells.push(md(`## 🔎 Visualize the defuzzified output

The vertical line shows the crisp Stress / Burnout value after centroid\ndefuzzification, overlaid on the aggregated output membership functions.`));
cells.push(code(`fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Stress view (Consequent.view with the simulation result)
stress.view(sim=stress_sim, ax=axes[0])\naxes[0].set_title(f'Stress = {stress_score:.2f} ({stress_level})')\naxes[0].set_xlim(0, 100)\n\n# Burnout view\nburnout.view(sim=burnout_sim, ax=axes[1])\naxes[1].set_title(f'Burnout = {burnout_score:.2f} ({burnout_level})')\naxes[1].set_xlim(0, 100)\n\nfig.tight_layout()\nplt.show()`));

// ----------------------------------------------------------------------- //
cells.push(md(`## ✅ Summary

You have just run a complete **Mamdani fuzzy inference system**:

1. ✅ Installed **Scikit-Fuzzy**
2. ✅ Imported the libraries
3. ✅ Defined the four inputs (Antecedents)
4. ✅ Defined the membership functions (\`trimf\`)
5. ✅ Plotted the membership functions
6. ✅ Defined the Stress & Burnout outputs (Consequents)
7. ✅ Defined the fuzzy rules (\`ctrl.Rule\`)
8. ✅ Created the \`ControlSystem\`
9. ✅ Created the \`ControlSystemSimulation\`
10. ✅ Provided sample student inputs
11. ✅ Ran the fuzzy inference (Mamdani + centroid defuzzification)
12. ✅ Showed the **Stress score**
13. ✅ Showed the **Burnout score**
14. ✅ Showed the **Low / Medium / High** categories

The **Streamlit application** (\`app.py\`) uses this exact same \`scikit-fuzzy\` logic
from \`fuzzy_system.py\` — there is only one fuzzy system.`));

// ----------------------------------------------------------------------- //
cells.push(md(`## 🌐 View Project UI

The Academic Stress Analyzer is also available as a live web application.

👉 **[Open Project UI](https://academicstressanalyzer.vercel.app/)**

Click the link above to open the deployed application in your browser.`));

// ----------------------------------------------------------------------- //
const notebook = {
  cells,
  metadata: {
    colab: { provenance: [] },
    kernelspec: {
      display_name: 'Python 3',
      name: 'python3',
    },
    language_info: { name: 'python' },
  },
  nbformat: 4,
  nbformat_minor: 5,
};

mkdirSync('public/project', { recursive: true });
writeFileSync(
  'public/project/Smart_Academic_Stress_Analyzer.ipynb',
  JSON.stringify(notebook, null, 1),
  'utf8'
);
console.log('Notebook written: public/project/Smart_Academic_Stress_Analyzer.ipynb');
console.log('Cells:', cells.length);
