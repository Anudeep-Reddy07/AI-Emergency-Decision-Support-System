---
marp: true
theme: default
paginate: true
backgroundColor: #ffffff
color: #333333
---

<!-- _class: lead -->
# AI-Based Emergency Decision Support System
### Enhancing Situational Awareness for Public Safety

---

# Agenda

1. Problem Statement
2. Solution Overview
3. Core Features
4. AI Logic & Hotspot Detection
5. Operational Workflow
6. Technical Architecture
7. Conclusion

---

# Problem Statement

**Challenges in Current Emergency Response:**

- **Fixed Zones:** Rigid jurisdiction boundaries can delay response across borders.
- **Manual Monitoring:** Dispatchers can be overwhelmed by high call volumes.
- **Reactive vs. Proactive:** Difficulty in identifying rising incident trends in real-time.
- **Resource Allocation:** Inefficient distribution of units during peak loads.

---

# Solution Overview

**AI-Assisted Decision Support System (DSS)**

A web-based command center dashboard that:
+ **Visualizes** incidents in real-time on an interactive map.
+ **Detects** abnormal concentrations of incidents (hotspots) using AI.
+ **Assists** dispatchers with data-driven alerts.
+ **Maintains** Human-in-the-Loop control for final decisions.

> *Focuses on assisting human dispatchers rather than replacing them.*

---

# Core Features

- **Interactive Mapping:**
  - Real-time OpenStreetMap integration.
  - Direct incident creation via map interface.

- **Incident Management:**
  - Severity Classification: **Low**, **Medium**, **High**.
  - Categories: **Medical**, **Police**, **Fire**, **Traffic**.

- **Dynamic Analysis:**
  - Real-time AI clustering of recurring incidents.
  - Visual indicators for High-Risk areas.

---

# AI Logic & Hotspot Detection

The system uses **Rule-Based Geospatial Clustering**:

1. **Proximity Grouping:**
   - Incidents within **~300 meters** are grouped into clusters.

2. **Severity Weighting:**
   - Low Severity = **1 point**
   - Medium Severity = **2 points**
   - High Severity = **3 points**

3. **Threshold Trigger:**
   - If a cluster's total weight exceeds the threshold, a **Hotspot Alert** is generated.

---

# Operational Workflow

1. **Input:** Operator logs an incident (Location, Category, Severity).
2. **Analysis:** System continuously evaluates incident density and weights.
3. **Alert:** AI detects a hotspot and flags it to the dispatcher.
4. **Decision:** Dispatcher reviews the alert and approves resource dispatch.
5. **Resolution:** Field units resolve incidents; system updates status to 'Resolved' and clears hotspots.

---

# Human-in-the-Loop Design

**Why keep the human involved?**

- **Accountability:** Critical decisions require human judgment.
- **Context:** AI may miss subtle contextual clues (e.g., duplicate calls).
- **Control:** Prevents "automation bias" and allows manual override.

*Single incidents are treated as routine and can be dispatched manually without AI triggers.*

---

# Technical Architecture

**Frontend Stack:**
- **Framework:** React + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS

**Data Structures:**
- **Incidents:** Track `Location`, `Severity`, `Category`, `Status`.
- **Clusters:** Aggregated groups of incidents for heatmap generation.
- **Units:** Real-time status (`IDLE`, `RESPONDING`) of emergency vehicles.

---

# Conclusion

**Impact of the System:**

- **Improved Response Time:** Faster identification of critical areas.
- **Better Resource Management:** Data-driven allocation of police/fire/medical units.
- **Scalability:** Adaptable to various emergency scenarios.
- **Simplicity:** Intuitive interface for immediate operational use.

---

<!-- _class: lead -->
# Thank You
## Questions?
