# 🎓 Smart Academic Stress Analyzer

A **Scikit-Fuzzy** (Mamdani) fuzzy-inference system that predicts student
**Stress** and **Burnout** from four academic inputs, then explains the
contributing factors and offers a personalised 7-day action plan.

> M.Sc. Data Science — **Soft Computing Techniques (SCT)** mini project.

---

## ✨ Overview

```
Inputs  →  Fuzzy Logic (Scikit-Fuzzy)  →  Stress  →  Burnout  →  Factors  →  Solutions  →  Visualization
```

The actual Stress and Burnout prediction is performed **only** by
`fuzzy_system.py` using `scikit-fuzzy`:

- `ctrl.Antecedent` / `ctrl.Consequent`
- `fuzz.trimf()` triangular membership functions
- `ctrl.Rule()` fuzzy rules (AND = `&`, Mamdani implication = min)
- `ctrl.ControlSystem` + `ctrl.ControlSystemSimulation`
- **Mamdani** inference with **centroid** defuzzification

The recommendation / action-plan logic uses simple if/else heuristics on the
raw inputs (allowed) — it **never** replaces the fuzzy prediction.

---

## 📂 Project structure

```
Smart_Academic_Stress_Analyzer/
├── app.py                          # Streamlit UI (calls fuzzy_system)
├── fuzzy_system.py                 # Scikit-Fuzzy engine (SINGLE SOURCE OF TRUTH)
├── recommendations.py              # Contributing factors + recommendations + 7-day plan
├── requirements.txt
├── README.md
└── Smart_Academic_Stress_Analyzer.ipynb   # Google Colab notebook
```

---

## 🔢 Inputs & Membership Functions (trimf)

| Input | Range | Low | Medium | High |
|---|---|---|---|---|
| Sleep Hours | 0–12 | `[0,0,5]` | `[4,7,9]` | `[8,12,12]` |
| Study Hours | 0–15 | `[0,0,4]` | `[3,6,9]` | `[8,15,15]` |
| Assignment Workload | 0–10 | `[0,0,4]` | `[3,5,7]` | `[6,10,10]` |
| Attendance | 0–100 | `[0,0,60]` | `[50,75,90]` | `[80,100,100]` |

## 🎯 Outputs (Stress & Burnout, 0–100)

| Output | Low | Medium | High |
|---|---|---|---|
| Stress / Burnout | `[0,0,40]` | `[30,55,70]` | `[60,100,100]` |

**Categories (consistent everywhere):**

- `< 40` → **Low**
- `40 – 69.99…` → **Medium**
- `>= 70` → **High**

---

## 📜 Fuzzy rules

### Stress
1. IF Sleep is Low AND Study is High THEN Stress is High
2. IF Sleep is Low AND Assignment Workload is High THEN Stress is High
3. IF Study is High AND Assignment Workload is High THEN Stress is High
4. IF Assignment Workload is High AND Attendance is Low THEN Stress is High
5. IF Sleep is Medium AND Assignment Workload is Medium THEN Stress is Medium
6. IF Study is Medium AND Assignment Workload is Medium THEN Stress is Medium
7. IF Sleep is High AND Assignment Workload is Low THEN Stress is Low
8. IF Sleep is High AND Attendance is High THEN Stress is Low
9. IF Sleep is Low AND Study is Low THEN Stress is Medium
10. IF Sleep is High AND Study is Low THEN Stress is Low
11. IF Sleep is Medium AND Study is Medium THEN Stress is Medium
12. IF Study is Low AND Assignment Workload is Low AND Attendance is High THEN Stress is Low

### Burnout
1. IF Sleep is Low AND Study is High AND Assignment Workload is High THEN Burnout is High
2. IF Sleep is Low AND Assignment Workload is High THEN Burnout is High
3. IF Study is High AND Attendance is Low THEN Burnout is High
4. IF Sleep is Medium AND Study is Medium THEN Burnout is Medium
5. IF Study is Medium AND Assignment Workload is Medium THEN Burnout is Medium
6. IF Sleep is High AND Assignment Workload is Low AND Attendance is High THEN Burnout is Low
7. IF Sleep is Low AND Study is Low THEN Burnout is Medium
8. IF Sleep is High AND Study is Low THEN Burnout is Low
9. IF Sleep is Medium AND Study is Low AND Attendance is High THEN Burnout is Low

(Rules 1-8 Stress / 1-6 Burnout are the required core rules; the remaining
are sensible coverage rules so every input region activates at least one rule.)

---

## 🚀 Run the Streamlit app

```bash
pip install -r requirements.txt
streamlit run app.py
```

Open the printed local URL, adjust the four sliders in the sidebar, and press
**Analyze**. The app shows Stress & Burnout scores/levels, contributing factors,
recommendations, a 7-day plan and membership-function charts.

---

## 🧪 Run the Google Colab notebook

Open `Smart_Academic_Stress_Analyzer.ipynb` in [Google Colab](https://colab.research.google.com/)
and **Run all** cells. The notebook installs `scikit-fuzzy`, defines the same
membership functions and rules, runs Mamdani inference and prints the
Stress/Burnout scores and their Low/Medium/High categories — the same logic
as the Streamlit app.

---

## 🧠 Methodology (Mamdani)

1. **Fuzzification** — crisp inputs are mapped to membership grades via `trimf`.
2. **Rule evaluation** — each rule's firing strength = `min` (AND) of antecedent memberships.
3. **Implication** — output membership functions are clipped at the firing strength (Mamdani / min).
4. **Aggregation** — clipped outputs are combined with `max`.
5. **Defuzzification** — the aggregate fuzzy set is converted to a crisp value via the **centroid** method: `Σ(x·μ) / Σμ`.
6. **Categorization** — the crisp score is classified Low / Medium / High using the thresholds above.

---

## 📦 Requirements

- `streamlit`
- `scikit-fuzzy`
- `numpy`
- `matplotlib`
- `pandas`

---

*No database, authentication, API keys or external back-ends are used. The
project is fully self-contained: Inputs → Fuzzy Logic → Stress → Burnout →
Factors → Solutions → Visualization.*
