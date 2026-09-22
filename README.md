# 🎓 Academic Stress + Workload Management Analyzer (Version 2.0.0)

> **M.Sc. Data Science | Soft Computing Techniques (SCT) Project**  
> An explainable system combining Mamdani Fuzzy Inference with Dynamic Routine Constraints, Subject Workload, Deadline Urgency, Priority Scheduling, and Visual Analytics.

---

## 🌟 Version 2.0.0 Overview

Version 2.0.0 transforms the original **Academic Stress Analyzer** (V1.0.0) into a comprehensive **Academic Stress + Workload Management Analyzer**.

It answers five critical student questions:
1. **"How stressed am I?"** — Evaluated via a 4-antecedent Mamdani Fuzzy Inference System with centroid defuzzification.
2. **"What is contributing to my academic pressure?"** — Workload gap, imminent deadlines, low preparation, and routine constraints.
3. **"What academic work should I prioritize?"** — A transparent 5-factor priority scoring engine (urgency, workload, preparation gap, importance, difficulty).
4. **"How much work do I have compared to my available time?"** — Protected routine calculation and Workload Gap detection.
5. **"What should I focus on today?"** — "What Should I Do Now?" recommendations and a priority-based, conflict-free daily study plan that guarantees sleep protection.

---

## 🏛️ Architecture & Flow

```text
                           USER INPUT
                               │
            ┌──────────────────┴──────────────────┐
            │                                     │
      V1 Stress Data                        V2 Academic Data
   (Sleep, Study, Assignments,           (Subjects, Deadlines,
           Attendance)                      Routine Commitments)
            │                                     │
            ↓                                     ↓
     MAMDANI FUZZY ENGINE                  PRIORITY ENGINE
   (Triangular MFs + Centroid)           (5-Factor Deterministic)
            │                                     │
            ↓                                     ↓
     Stress & Burnout                      Priority List
      (Scores & Levels)                  (Very High/High/Med/Low)
            │                                     │
            └──────────────────┬──────────────────┘
                               ↓
                        WORKLOAD ANALYSIS
                               ↓
                      AVAILABLE STUDY TIME
                               ↓
                          WORKLOAD GAP
                               ↓
                      DAILY PRIORITY PLAN
                               ↓
                  VISUAL ANALYTICS (Part 10A)
                               ↓
                      EXPLAINABLE INSIGHTS
```

---

## 🚀 Key Modules & Capabilities

### 1. Mamdani Fuzzy Inference System (Preserved V1 Baseline)
* **Antecedents**: Sleep (0–12h), Study (0–15h), Assignments (0–10), Attendance (0–100%).
* **Consequents**: Stress (0–100), Burnout (0–100).
* **Defuzzification**: Centroid defuzzification over $N=101$ universe points.
* **Rule Base**: 17 Stress rules + 15 Burnout rules evaluated using Mamdani min-conjunction and max-aggregation.

### 2. Daily Routine & Protected Time (Part 1)
* Input parameters: Wake-up time, Sleep time, College hours, Travel time, Meal periods, and Fixed commitments.
* **Strict Protection**: Sleep, college hours, travel, and meals are non-negotiable.
* Calculates realistic remaining available study time per day.

### 3. Subject Management (Part 2 & Part 10)
* Dynamic Subject CRUD with local storage and session persistence.
* Fields: Subject name, deadline, type (Exam, Assignment, Project, Other), pending topics/tasks, estimated hours, difficulty, preparation level, and importance.
* Unlimited courses supported.

### 4. Deadline & Workload Gap Analysis (Part 3)
* Calculates days remaining, urgency, and available study hours before deadlines.
* Detects **Workload Gap**: $\max(0, \text{Pending Hours} - \text{Available Study Hours})$.
* Surfacing gaps transparently rather than creating impossible schedules.

### 5. Priority Engine (Part 4)
* Transparent 5-factor scoring model:
  * Deadline Urgency (35%)
  * Remaining Workload (20%)
  * Preparation Gap (20%)
  * Academic Importance (15%)
  * Course Difficulty (10%)
* Generates clear linguistic levels (`Very High`, `High`, `Medium`, `Low`) and factual explanations for every subject.

### 6. "What Should I Do Now?" (Part 5)
* Selects the highest-priority immediate task with estimated duration and plain-English rationale.
* Provides an optional "Suggested Next Task" for flexible study sessions.

### 7. Priority-Based Daily Plan (Part 6)
* Generates an actionable, conflict-free chronological schedule for today.
* Allocates available study windows to highest-priority tasks first.
* Embeds 10–15 minute Pomodoro breaks between sessions.
* **Never reduces sleep** or schedules during college/commitments.

### 8. Visual Analytics (Part 10A)
All 6 required reactive visualizations driven by calculated data:
1. **Stress & Burnout Overview**: Numerical scores, linguistic pills, and proportional bars.
2. **Subject Workload Chart**: Estimated pending hours per subject.
3. **Priority Distribution**: Segmented breakdown across Very High, High, Medium, and Low.
4. **Available Study Time vs Required Work**: Comparative gauge highlighting the Workload Gap.
5. **Upcoming Deadlines Timeline**: Chronological deadline overview with urgency badges.
6. **Daily Study Allocation**: Proportional hours assigned in today's generated plan.

### 9. Explainable & Context-Aware Insights (Part 7 & Part 8)
* Identifies primary stress contributors (workload gap, imminent deadlines, low preparation, short sleep, low attendance).
* Factual, non-clinical explanations strictly avoiding psychiatric or medical diagnoses.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Framer Motion.
* **Soft Computing Engine**: Deterministic TypeScript port of Scikit-Fuzzy Mamdani control system (`src/lib/fuzzy.ts`).
* **Python Reference Implementation**: Streamlit + Scikit-Fuzzy (`public/project/app.py` and `public/project/fuzzy_system.py`).
* **Test Runner**: Node.js 22 Native Test Runner (`node --experimental-strip-types --test`).

---

## ▶️ Running Locally

### Web Application (React + Vite)
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Automated Test Suite
```bash
npm test
```
Executes all regression tests for V1 fuzzy logic, routine validation, workload calculator, priority engine, and daily schedule planner.

### Production Build & Linting
```bash
npm run build
npm run lint
```

### Python / Streamlit Reference (Local / Google Colab)
```bash
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r public/project/requirements.txt
streamlit run public/project/app.py
```

---

## ⚠️ Academic Disclaimer

This application is an educational and engineering project developed for soft computing and workload management study. It does **not** provide psychological, psychiatric, or medical diagnoses and does not diagnose clinical depression or anxiety disorders.
