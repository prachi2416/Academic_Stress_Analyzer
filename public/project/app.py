"""
app.py
======
Smart Academic Stress Analyzer — Streamlit front-end.

This UI calls ``fuzzy_system.py`` (Scikit-Fuzzy Mamdani engine) to predict
Stress and Burnout, then displays:
    * Stress Score + Stress Level
    * Burnout Score + Burnout Level
    * Contributing Factors
    * Personalized Recommendations
    * Simple 7-Day Action Plan
    * Membership-function & result charts

Run locally:
    streamlit run app.py
"""

import numpy as np
import matplotlib.pyplot as plt
import streamlit as st

import fuzzy_system as fs
from recommendations import (contributing_factors, recommendations, action_plan)


# --------------------------------------------------------------------------- #
# Page config                                                                  #
# --------------------------------------------------------------------------- #
st.set_page_config(
    page_title="Smart Academic Stress Analyzer",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded",
)

# --------------------------------------------------------------------------- #
# Styling                                                                      #
# --------------------------------------------------------------------------- #
LEVEL_COLORS = {'Low': '#10b981', 'Medium': '#f59e0b', 'High': '#ef4444', 'Unknown': '#6b7280'}

st.markdown(
    """
    <style>
      .block-container {padding-top: 2rem; padding-bottom: 3rem;}
      h1, h2, h3 {font-family: 'Plus Jakarta Sans', sans-serif;}
      .metric-card {
          background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px;
          padding: 1.25rem 1.5rem; box-shadow: 0 1px 3px rgba(15,23,42,.06);
      }
      .level-badge {
          display:inline-block; padding:.25rem .75rem; border-radius:999px;
          color:#fff; font-weight:700; font-size:.85rem;
      }
      .factor-row {
          display:flex; align-items:center; gap:.6rem;
          padding:.6rem .9rem; border-radius:10px; background:#f8fafc;
          border:1px solid #e2e8f0; margin-bottom:.5rem;
      }
    </style>
    """,
    unsafe_allow_html=True,
)

# --------------------------------------------------------------------------- #
# Header                                                                       #
# --------------------------------------------------------------------------- #
st.markdown(
    """
    # 🎓 Smart Academic Stress Analyzer
    A **Scikit-Fuzzy** (Mamdani) inference system that predicts student
    **Stress** and **Burnout** from four academic inputs and offers
    personalised, actionable advice.
    """
)

# --------------------------------------------------------------------------- #
# Sidebar inputs                                                               #
# --------------------------------------------------------------------------- #
st.sidebar.markdown("## 🧾 Student Inputs")
st.sidebar.caption("Adjust the sliders, then press **Analyze**.")

sleep_h = st.sidebar.slider("💤 Sleep Hours", 0.0, 12.0, 5.0, 0.5)
study_h = st.sidebar.slider("📚 Study Hours", 0.0, 15.0, 8.0, 0.5)
workload = st.sidebar.slider("📝 Assignment Workload (0-10)", 0.0, 10.0, 7.0, 0.5)
att = st.sidebar.slider("🏫 Attendance %", 0.0, 100.0, 70.0, 1.0)

analyze = st.sidebar.button("🔍 Analyze", type="primary", use_container_width=True)

st.sidebar.markdown("---")
st.sidebar.markdown("**Engine:** `scikit-fuzzy` Mamdani + centroid defuzzification")
st.sidebar.markdown("**Source of truth:** `fuzzy_system.py`")

# --------------------------------------------------------------------------- #
# Run fuzzy inference                                                          #
# --------------------------------------------------------------------------- #
result = fs.predict(sleep_h, study_h, workload, att)

st.markdown("---")

# --------------------------------------------------------------------------- #
# Result metrics                                                               #
# --------------------------------------------------------------------------- #
c1, c2 = st.columns(2)

with c1:
    sc = result['stress_score']
    sl = result['stress_level']
    st.markdown(
        f"""
        <div class="metric-card">
          <div style="color:#6366f1;font-weight:700;font-size:.9rem;">STRESS</div>
          <div style="font-size:2.6rem;font-weight:800;line-height:1.1;color:#0f172a;">{sc:.1f}<span style="font-size:1rem;color:#94a3b8;">/100</span></div>
          <span class="level-badge" style="background:{LEVEL_COLORS[sl]};">{sl}</span>
        </div>
        """,
        unsafe_allow_html=True,
    )

with c2:
    bc = result['burnout_score']
    bl = result['burnout_level']
    st.markdown(
        f"""
        <div class="metric-card">
          <div style="color:#d97706;font-weight:700;font-size:.9rem;">BURNOUT</div>
          <div style="font-size:2.6rem;font-weight:800;line-height:1.1;color:#0f172a;">{bc:.1f}<span style="font-size:1rem;color:#94a3b8;">/100</span></div>
          <span class="level-badge" style="background:{LEVEL_COLORS[bl]};">{bl}</span>
        </div>
        """,
        unsafe_allow_html=True,
    )

st.caption("Categories: **Low** < 40 · **Medium** 40-69.99 · **High** ≥ 70")

# --------------------------------------------------------------------------- #
# Score bar chart                                                              #
# --------------------------------------------------------------------------- #
fig, ax = plt.subplots(figsize=(8, 2.2))
labels = ['Stress', 'Burnout']
vals = [result['stress_score'], result['burnout_score']]
colors = [LEVEL_COLORS[result['stress_level']], LEVEL_COLORS[result['burnout_level']]]
ax.barh(labels, vals, color=colors, height=0.5)
ax.set_xlim(0, 100)
ax.axvline(40, color='#cbd5e1', linestyle='--', linewidth=1)
ax.axvline(70, color='#cbd5e1', linestyle='--', linewidth=1)
for i, v in enumerate(vals):
    ax.text(v + 1, i, f'{v:.1f}', va='center', fontweight='bold')
ax.set_title('Predicted Scores', fontsize=11)
ax.spines[['top', 'right']].set_visible(False)
st.pyplot(fig)

# --------------------------------------------------------------------------- #
# Contributing factors + recommendations                                     #
# --------------------------------------------------------------------------- #
inputs = result['inputs']
factors = contributing_factors(inputs)
recs = recommendations(inputs, result['stress_level'], result['burnout_level'])

f1, f2 = st.columns(2)

with f1:
    st.markdown("### ⚠️ Contributing Factors")
    for f in factors:
        val = f"{f['value']} {f['unit']}" if f['value'] is not None else "—"
        st.markdown(
            f"""
            <div class="factor-row">
              <span class="level-badge" style="background:{LEVEL_COLORS.get(f['severity'], '#6b7280')};">{f['factor']}</span>
              <span style="color:#64748b;font-size:.8rem;">{val}</span>
            </div>
            <div style="color:#475569;font-size:.85rem;margin:.1rem 0 .7rem 1rem;">{f['detail']}</div>
            """,
            unsafe_allow_html=True,
        )

with f2:
    st.markdown("### 💡 Personalized Recommendations")
    for r in recs:
        st.markdown(f"**{r['title']}**")
        st.caption(r['detail'])

# --------------------------------------------------------------------------- #
# 7-day action plan                                                            #
# --------------------------------------------------------------------------- #
st.markdown("### 📅 Simple 7-Day Action Plan")
plan = action_plan(inputs, result['stress_level'], result['burnout_level'])
pcols = st.columns(7)
for col, day in zip(pcols, plan):
    col.markdown(f"**Day {day['day']}**")
    col.markdown(f"*{day['focus']}*")
    for t in day['tasks']:
        col.markdown(f"- {t}")

# --------------------------------------------------------------------------- #
# Membership-function charts                                                   #
# --------------------------------------------------------------------------- #
st.markdown("---")
st.markdown("### 📈 Membership Functions")

mf_inputs = [
    (fs.sleep, 'Sleep (hours)', {'low': [0, 0, 5], 'medium': [4, 7, 9], 'high': [8, 12, 12]}),
    (fs.study, 'Study (hours)', {'low': [0, 0, 4], 'medium': [3, 6, 9], 'high': [8, 15, 15]}),
    (fs.assignment, 'Assignment Workload', {'low': [0, 0, 4], 'medium': [3, 5, 7], 'high': [6, 10, 10]}),
    (fs.attendance, 'Attendance (%)', {'low': [0, 0, 60], 'medium': [50, 75, 90], 'high': [80, 100, 100]}),
]
mf_outputs = [
    (fs.stress, 'Stress', {'low': [0, 0, 40], 'medium': [30, 55, 70], 'high': [60, 100, 100]}),
    (fs.burnout, 'Burnout', {'low': [0, 0, 40], 'medium': [30, 55, 70], 'high': [60, 100, 100]}),
]

fig, axes = plt.subplots(2, 3, figsize=(15, 7))
axes = axes.flatten()
for ax, (var, label, terms) in zip(axes[:4], mf_inputs):
    for term, params in terms.items():
        ax.plot(var.universe, var[term].mf, label=term, linewidth=2)
    ax.set_title(label)
    ax.set_ylim(-0.05, 1.1)
    ax.legend(loc='upper right', fontsize=8)
    ax.grid(alpha=0.25)

for ax, (var, label, terms) in zip(axes[4:], mf_outputs):
    for term, params in terms.items():
        ax.plot(var.universe, var[term].mf, label=term, linewidth=2)
    ax.set_title(label)
    ax.set_ylim(-0.05, 1.1)
    ax.legend(loc='upper right', fontsize=8)
    ax.grid(alpha=0.25)
fig.tight_layout()
st.pyplot(fig)

# --------------------------------------------------------------------------- #
# Fuzzy rules reference                                                        #
# --------------------------------------------------------------------------- #
with st.expander("📜 View Fuzzy Rules (ctrl.Rule)"):
    rc1, rc2 = st.columns(2)
    with rc1:
        st.markdown("**Stress rules**")
        for r in fs.STRESS_RULES_TEXT:
            st.markdown(f"- {r}")
    with rc2:
        st.markdown("**Burnout rules**")
        for r in fs.BURNOUT_RULES_TEXT:
            st.markdown(f"- {r}")

st.markdown("---")
st.caption("Built with Streamlit + scikit-fuzzy · Stress & Burnout predicted by Mamdani fuzzy inference (centroid defuzzification).")
