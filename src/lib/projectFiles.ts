/**
 * Metadata for the downloadable Python project files shown in the Code browser.
 */
export interface ProjectFile {
  name: string;
  path: string; // static asset path under /project/...
  downloadUrl: string;
  language: string;
  description: string;
  icon: string;
}

export const PROJECT_FILES: ProjectFile[] = [
  {
    name: 'fuzzy_system.py',
    path: '/project/fuzzy_system.py',
    downloadUrl: '/project/fuzzy_system.py',
    language: 'python',
    description: 'Scikit-Fuzzy engine — SINGLE SOURCE OF TRUTH. Defines antecedents, consequents, trimf membership functions, all ctrl.Rule rules, ControlSystem + Mamdani centroid defuzzification.',
    icon: '🧠',
  },
  {
    name: 'app.py',
    path: '/project/app.py',
    downloadUrl: '/project/app.py',
    language: 'python',
    description: 'Streamlit front-end. Calls fuzzy_system.py, displays Stress/Burnout scores, levels, contributing factors, recommendations, 7-day plan and membership-function charts.',
    icon: '🖥️',
  },
  {
    name: 'recommendations.py',
    path: '/project/recommendations.py',
    downloadUrl: '/project/recommendations.py',
    language: 'python',
    description: 'Contributing-factor analysis + personalized recommendations + 7-day action plan (simple if/else heuristics on raw inputs).',
    icon: '💡',
  },
  {
    name: 'sample_demo.py',
    path: '/project/sample_demo.py',
    downloadUrl: '/project/sample_demo.py',
    language: 'python',
    description: 'Optional command-line demo that runs the fuzzy engine on three sample student profiles.',
    icon: '⚡',
  },
  {
    name: 'Smart_Academic_Stress_Analyzer.ipynb',
    path: '/project/Smart_Academic_Stress_Analyzer.ipynb',
    downloadUrl: '/project/Smart_Academic_Stress_Analyzer.ipynb',
    language: 'json',
    description: 'Google Colab notebook — installs scikit-fuzzy and runs the full pipeline: membership functions → rules → Mamdani inference → defuzzification → Stress/Burnout output. Same MFs & rules as the Streamlit app.',
    icon: '📓',
  },
  {
    name: 'requirements.txt',
    path: '/project/requirements.txt',
    downloadUrl: '/project/requirements.txt',
    language: 'text',
    description: 'Python dependencies: streamlit, scikit-fuzzy, numpy, matplotlib, pandas.',
    icon: '📦',
  },
  {
    name: 'README.md',
    path: '/project/README.md',
    downloadUrl: '/project/README.md',
    language: 'markdown',
    description: 'Full project documentation: structure, membership functions, rules, methodology, run instructions.',
    icon: '📘',
  },
];
