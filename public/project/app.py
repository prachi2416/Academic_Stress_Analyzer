"""
Smart Academic Stress Analyzer  —  Streamlit UI
-----------------------------------------------

Run locally:
    streamlit run app.py

Run in Google Colab:
    !pip install -q streamlit scikit-fuzzy plotly
    !streamlit run app.py &>/content/log.txt &
    !npx --yes localtunnel --port 8501
"""

import pandas as pd
import plotly.express as px
import streamlit as st

from fuzzy_system import (
    analyze,
    membership_degrees,
    recommendations,
    STRESS_RULES_TEXT,
    BURNOUT_RULES_TEXT,
    MEMBERSHIP_TEXT,
)

# ---------------------------------------------------------------------------
# Page config + light academic theme
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="Smart Academic Stress Analyzer",
    page_icon="🎓",
    layout="wide",
)

CUSTOM_CSS = """
<style>
    /* Main background */
    .stApp { background: linear-gradient(180deg,#f7f8ff 0%,#eef1fb 100%); }

    /* Header */
    .hero {
        background: linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);
        padding: 1.6rem 2rem;
        border-radius: 18px;
        color: white;
        box-shadow: 0 10px 30px rgba(79,70,229,.25);
        margin-bottom: 1.5rem;
    }
    .hero h1 { color:white; margin:0; font-size: 2rem; font-weight: 700; }
    .hero p  { color:#e0e7ff; margin:.35rem 0 0 0; font-size: 1.02rem; }

    /* Cards */
    .card {
        background: white;
        padding: 1.25rem 1.4rem;
        border-radius: 16px;
        box-shadow: 0 4px 14px rgba(15,23,42,.06);
        border: 1px solid #eef0f7;
        margin-bottom: 1rem;
    }
    .card h3 { margin-top:0; color:#1e293b; }

    /* Metric pills */
    .pill {
        display:inline-block; padding:.35rem .75rem; border-radius: 999px;
        font-size:.85rem; font-weight:600;
    }
    .pill-low    { background:#dcfce7; color:#166534; }
    .pill-med    { background:#fef3c7; color:#92400e; }
    .pill-high   { background:#fee2e2; color:#991b1b; }

    .big-score { font-size: 3rem; font-weight: 800; color:#4f46e5; margin:0; }
    .score-label { color:#64748b; font-size:.9rem; margin:0; }

    /* Disclaimer */
    .disclaimer {
        background:#fff7ed;
        border-left:4px solid #f59e0b;
        padding: .9rem 1.1rem;
        border-radius: 10px;
        color:#78350f;
        font-size:.9rem;
    }
    section[data-testid="stSidebar"] { background:#ffffff; border-right:1px solid #eef0f7;}
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


# ---------------------------------------------------------------------------
# Header
# ---------------------------------------------------------------------------
st.markdown(
    """
    <div class="hero">
        <h1>🎓 Smart Academic Stress Analyzer</h1>
        <p>Scikit-Fuzzy Based Student Stress &amp; Burnout Assessment</p>
    </div>
    """,
    unsafe_allow_html=True,
)


# ---------------------------------------------------------------------------
# Sidebar — inputs
# ---------------------------------------------------------------------------
with st.sidebar:
    st.markdown("### 🧪 Student Inputs")
    st.caption("Adjust the four factors, then click **Analyze Stress**.")

    sleep_hours  = st.slider("😴 Sleep Hours per day",   0.0, 12.0, 7.0, 0.5)
    study_hours  = st.slider("📖 Study Hours per day",   0.0, 15.0, 6.0, 0.5)
    assignments  = st.slider("📝 Assignment Workload",   0.0, 10.0, 4.0, 1.0)
    attendance   = st.slider("🏫 Attendance (%)",        0,   100,  80,  1)

    st.markdown("---")
    analyze_btn = st.button("🚀 Analyze Stress", use_container_width=True, type="primary")

    st.markdown("---")
    st.caption("Built with **Streamlit + Scikit-Fuzzy** • M.Sc. DS • SCT Mini Project")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def pill(level: str) -> str:
    cls = {"Low": "pill-low", "Medium": "pill-med", "High": "pill-high"}[level]
    return f'<span class="pill {cls}">{level}</span>'


def default_landing():
    st.markdown(
        """
        <div class="card">
            <h3>👋 Welcome</h3>
            <p>This mini-project uses <b>Scikit-Fuzzy</b> to evaluate a student's
            academic stress and burnout risk based on four everyday factors:</p>
            <ul>
                <li>😴 <b>Sleep Hours</b> per day (0 - 12)</li>
                <li>📖 <b>Study Hours</b> per day (0 - 15)</li>
                <li>📝 <b>Assignment Workload</b> (0 - 10)</li>
                <li>🏫 <b>Attendance</b> (%)</li>
            </ul>
            <p>Adjust the sliders on the left and click <b>Analyze Stress</b> to run
            a real Mamdani fuzzy inference (triangular membership functions +
            rule base + centroid defuzzification).</p>
        </div>
        """,
        unsafe_allow_html=True,
    )


# ---------------------------------------------------------------------------
# Main content
# ---------------------------------------------------------------------------
if not analyze_btn:
    default_landing()
else:
    # ---- Run the fuzzy inference ----
    inputs  = dict(sleep=sleep_hours, study=study_hours,
                   assignments=assignments, attendance=attendance)
    results = analyze(sleep_hours, study_hours, assignments, attendance)
    degrees = membership_degrees(sleep_hours, study_hours, assignments, attendance)
    tips    = recommendations(inputs, results)

    # ---- Score cards ----
    c1, c2 = st.columns(2)
    with c1:
        st.markdown(
            f"""
            <div class="card">
                <p class="score-label">Stress Score</p>
                <p class="big-score">{results['stress_score']:.1f}<span style='font-size:1.2rem;color:#94a3b8;'>/100</span></p>
                <p>Stress Level: {pill(results['stress_level'])}</p>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with c2:
        st.markdown(
            f"""
            <div class="card">
                <p class="score-label">Burnout Score</p>
                <p class="big-score">{results['burnout_score']:.1f}<span style='font-size:1.2rem;color:#94a3b8;'>/100</span></p>
                <p>Burnout Risk: {pill(results['burnout_risk'])}</p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    # ---- Bar chart : stress vs burnout ----
    left, right = st.columns([1.15, 1])

    with left:
        st.markdown('<div class="card">', unsafe_allow_html=True)
        st.markdown("### 📊 Stress vs Burnout")
        bar_df = pd.DataFrame({
            "Metric": ["Stress", "Burnout"],
            "Score":  [results["stress_score"], results["burnout_score"]],
        })
        fig = px.bar(
            bar_df, x="Metric", y="Score", text="Score",
            color="Metric",
            color_discrete_map={"Stress": "#6366f1", "Burnout": "#a855f7"},
            range_y=[0, 100],
        )
        fig.update_traces(texttemplate="%{text:.1f}", textposition="outside")
        fig.update_layout(
            showlegend=False, height=340,
            margin=dict(l=10, r=10, t=20, b=10),
            plot_bgcolor="white", paper_bgcolor="white",
            yaxis=dict(gridcolor="#eef0f7"),
        )
        st.plotly_chart(fig, use_container_width=True)
        st.markdown("</div>", unsafe_allow_html=True)

    with right:
        st.markdown('<div class="card">', unsafe_allow_html=True)
        st.markdown("### 🧮 Input Summary")
        summary_df = pd.DataFrame({
            "Factor": ["Sleep (h)", "Study (h)", "Assignments", "Attendance (%)"],
            "Value":  [sleep_hours, study_hours, assignments, attendance],
            "Scale Max": [12, 15, 10, 100],
        })
        summary_df["Normalized %"] = (summary_df["Value"] /
                                      summary_df["Scale Max"] * 100).round(1)
        fig2 = px.bar(
            summary_df, x="Normalized %", y="Factor",
            orientation="h", text="Value",
            color="Factor",
            color_discrete_sequence=["#4f46e5", "#7c3aed", "#ec4899", "#0ea5e9"],
            range_x=[0, 100],
        )
        fig2.update_layout(
            showlegend=False, height=340,
            margin=dict(l=10, r=10, t=20, b=10),
            plot_bgcolor="white", paper_bgcolor="white",
            xaxis=dict(gridcolor="#eef0f7"),
        )
        st.plotly_chart(fig2, use_container_width=True)
        st.markdown("</div>", unsafe_allow_html=True)

    # ---- Contribution / membership degrees ----
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown("### 🔬 How Your Inputs Contributed (Fuzzy Membership Degrees)")
    st.caption(
        "Each bar shows how strongly the input belongs to each fuzzy set. "
        "These degrees are what the rule base actually reasons on."
    )

    rows = []
    for factor, terms in degrees.items():
        for term, deg in terms.items():
            rows.append({"Factor": factor.capitalize(),
                         "Fuzzy Set": term.capitalize(),
                         "Degree": round(deg, 3)})
    deg_df = pd.DataFrame(rows)

    fig3 = px.bar(
        deg_df, x="Factor", y="Degree", color="Fuzzy Set", barmode="group",
        color_discrete_map={"Low": "#10b981", "Medium": "#f59e0b", "High": "#ef4444"},
        range_y=[0, 1.05],
    )
    fig3.update_layout(
        height=360, margin=dict(l=10, r=10, t=10, b=10),
        plot_bgcolor="white", paper_bgcolor="white",
        yaxis=dict(gridcolor="#eef0f7"),
    )
    st.plotly_chart(fig3, use_container_width=True)
    st.markdown("</div>", unsafe_allow_html=True)

    # ---- Recommendations ----
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown("### 💡 Personalised Recommendations")
    for t in tips:
        st.markdown(f"- {t}")
    st.markdown("</div>", unsafe_allow_html=True)


# ---------------------------------------------------------------------------
# Fuzzy Logic Details  (viva-friendly panel, always visible)
# ---------------------------------------------------------------------------
st.markdown("## 🧠 Fuzzy Logic Details")

detail_a, detail_b = st.columns(2)

with detail_a:
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown("### Membership Function Ranges")
    for var, terms in MEMBERSHIP_TEXT.items():
        st.markdown(f"**{var}**")
        for term, rng in terms.items():
            st.markdown(f"- *{term}*: {rng}")
    st.markdown("</div>", unsafe_allow_html=True)

with detail_b:
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown("### Fuzzy Rule Base")
    st.markdown("**Stress rules**")
    for r in STRESS_RULES_TEXT:
        st.markdown(f"- {r}")
    st.markdown("**Burnout rules**")
    for r in BURNOUT_RULES_TEXT:
        st.markdown(f"- {r}")
    st.markdown("</div>", unsafe_allow_html=True)


# ---------------------------------------------------------------------------
# Disclaimer
# ---------------------------------------------------------------------------
st.markdown(
    """
    <div class="disclaimer">
        ⚠️ <b>Disclaimer:</b> This tool is an academic project for educational
        purposes and is <b>not</b> a medical or psychological diagnosis.
    </div>
    """,
    unsafe_allow_html=True,
)
