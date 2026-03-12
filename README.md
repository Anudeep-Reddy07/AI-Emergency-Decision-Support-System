# AI-Based Emergency Decision Support System

## 1. Introduction
This project implements an AI-assisted Emergency Decision Support System (DSS) designed to improve situational awareness and decision-making for public safety services such as ambulance, police, and traffic management. The system focuses on assisting human dispatchers rather than replacing emergency services.

## 2. Problem Statement
Emergency response systems often struggle with identifying high-risk areas in real time and prioritizing incidents during peak loads. Fixed zones and manual monitoring can lead to delayed responses. This system dynamically detects emergency hotspots and assists dispatchers in managing resources efficiently.

## 3. System Overview
The application is a web-based command center dashboard that allows operators to add incidents on a map, visualize them in real time, and receive AI-generated alerts when abnormal concentrations of incidents occur in the same area.

## 4. Core Features
*   **Interactive Mapping**: Uses OpenStreetMap for real-time visualization.
*   **Live Incident Creation**: Operators can add incidents directly by clicking on the map.
*   **Severity Classification**: Incidents are categorized by severity (Low, Medium, High).
*   **Dynamic Hotspot Detection**: AI-based clustering identifies high-risk areas.
*   **Human-in-the-loop**: AI provides recommendations, but human approval is required for dispatch.
*   **Lifecycle Management**: Incidents track through Pending → Responding → Resolved states.

## 5. How the AI Logic Works
The system uses rule-based AI suitable for public safety systems. Instead of predefined zones, incidents are grouped based on geographic proximity (approximately 300 meters).

*   **Severity Weighting**:
    *   Low = 1
    *   Medium = 2
    *   High = 3
*   **Hotspot Calculation**: The combined weight of incidents in a cluster is calculated. If the total load exceeds a predefined threshold, the cluster is marked as a critical hotspot and an AI alert is generated.

## 6. Human-in-the-Loop Design
The system does not automatically dispatch resources. Instead, it presents AI recommendations that must be approved by a human operator. This ensures accountability, transparency, and realistic emergency management practices.

## 7. Handling Single Incidents
Single incidents are treated as routine cases. Dispatchers can manually dispatch a unit for such incidents without AI intervention. This prevents alert fatigue and reflects real-world emergency workflows.

## 8. How to Test the System
Follow these steps to experience the full workflow of the application:

1.  **Open the Dashboard**: Launch the application in your browser.
2.  **Create an Incident**: Click on any location on the map to select a point.
3.  **Define Details**: Choose an incident category and severity, then click “Add Incident”.
4.  **Trigger AI Alert**: Add multiple high-severity incidents close to each other (within ~300m) to trigger an AI hotspot alert.
5.  **Approve Dispatch**: Click “Approve Dispatch” to acknowledge the AI recommendation.
6.  **Resolve Incidents**: Click “Resolve” on incidents to simulate resolution and observe the AI recalculation.

## 9. Expected Outcomes
*   AI alerts appear only during abnormal incident concentrations.
*   Single incidents are handled through manual dispatch.
*   Hotspot alerts disappear when incidents are resolved.
*   The system continuously adapts to real-time changes.

## 10. Conclusion
This project demonstrates a realistic AI-assisted emergency decision support system suitable for smart city applications. It improves operational awareness while maintaining human control, making it ideal for academic and prototype use cases.

---

## Installation & Running Locally

This project is built with React + TypeScript + Vite.

### Prerequisites
*   Node.js installed on your machine.

### Steps
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
3.  Open the browser at the URL shown in the terminal (usually `http://localhost:5173`).
