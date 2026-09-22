# 🎓 Smart Academic Stress Analyzer

**M.Sc. Data Science | Soft Computing Techniques (SCT) Mini Project**

A Scikit-Fuzzy based system that predicts a student's **Stress Level** and
**Burnout Risk** from four everyday academic factors and returns personalised
recommendations.

---

## 🔧 Tech Stack

| Layer                 | Tool                              |
|-----------------------|-----------------------------------|
| UI                    | Streamlit                         |
| Fuzzy Inference       | scikit-fuzzy (`skfuzzy.control`)  |
| Data                  | Pandas, NumPy                     |
| Visualisation         | Plotly                            |
| IDE                   | VS Code                           |
| Demo Notebook         | Google Colab                      |

---

## 📁 Project Files

```
Smart-Academic-Stress-Analyzer/
├── app.py                # Streamlit UI
├── fuzzy_system.py       # Scikit-Fuzzy inference (separated from UI)
├── requirements.txt
├── README.md
└── Smart_Academic_Stress_Analyzer.ipynb   # Colab notebook
```

---

## ▶️ Run Locally (VS Code)

```bash
python -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r requirements.txt
streamlit run app.py
```

Then open <http://localhost:8501>.

---

## 🚀 Run on Google Colab

```python
!pip install -q streamlit scikit-fuzzy plotly
!npm install -g localtunnel
!streamlit run app.py &>/content/log.txt &
!curl -s ifconfig.me      # This IP is the tunnel password
!npx --yes localtunnel --port 8501
```

Open the printed URL, paste the IP from `ifconfig.me` as the password.

---

## 🧠 Fuzzy Logic Design

### Antecedents (Inputs)
| Variable    | Range   | Sets                |
|-------------|---------|---------------------|
| Sleep       | 0 - 12  | Low / Medium / High |
| Study       | 0 - 15  | Low / Medium / High |
| Assignments | 0 - 10  | Low / Medium / High |
| Attendance  | 0 - 100 | Low / Medium / High |

### Consequents (Outputs)
| Variable | Range   | Sets                |
|----------|---------|---------------------|
| Stress   | 0 - 100 | Low / Medium / High |
| Burnout  | 0 - 100 | Low / Medium / High |

- Membership functions: **triangular** (`fuzz.trimf`)
- Inference: **Mamdani** (skfuzzy default)
- Defuzzification: **Centroid** (skfuzzy default)
- Two independent `ctrl.ControlSystem()` + `ctrl.ControlSystemSimulation()`
  objects — one for stress, one for burnout.

### Sample Rules
- IF sleep is LOW AND assignments is HIGH → stress is HIGH
- IF study is HIGH AND assignments is HIGH → stress is HIGH
- IF sleep is HIGH AND assignments is LOW → stress is LOW
- IF sleep is LOW AND study is HIGH AND assignments is HIGH → burnout is HIGH

Full list is displayed inside the app's **Fuzzy Logic Details** panel and inside
`fuzzy_system.py`.

---

## ⚠️ Disclaimer

This tool is an **academic project for educational purposes only** and is **not**
a medical or psychological diagnosis.
