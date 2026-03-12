import type { Incident, Cluster } from "../types";
import { distance } from "./geo";

export function clusterIncidents(incidents: Incident[]): Cluster[] {
    const clusters: Cluster[] = [];
    const RADIUS = 300; // meters

    incidents.forEach((incident) => {
        let assigned = false;

        for (const cluster of clusters) {
            if (distance(incident, cluster) <= RADIUS) {
                cluster.incidents.push(incident);
                assigned = true;
                break;
            }
        }

        if (!assigned) {
            clusters.push({
                id: Date.now() + Math.random(),
                lat: incident.lat,
                lng: incident.lng,
                incidents: [incident],
                handled: false,
            });
        }
    });

    return clusters;
}

export const severityWeight = (s: Incident["severity"]) =>
    s === "HIGH" ? 3 : s === "MEDIUM" ? 2 : 1;

export const colorByStatus = (i: Incident) =>
    i.status === "RESPONDING"
        ? "#22c55e"
        : i.severity === "HIGH"
            ? "#ef4444"
            : i.severity === "MEDIUM"
                ? "#eab308"
                : "#38bdf8";
