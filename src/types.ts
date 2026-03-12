export type Severity = "LOW" | "MEDIUM" | "HIGH";
export type Category = "MEDICAL" | "POLICE" | "FIRE" | "TRAFFIC";
export type Status = "PENDING" | "RESPONDING" | "RESOLVED";

export interface Incident {
    id: number;
    lat: number;
    lng: number;
    location: string;
    severity: Severity;
    category: Category;
    status: Status;
    description?: string; // For NLP/Chatbot later
}

export interface Cluster {
    id: number;
    lat: number;
    lng: number;
    incidents: Incident[];
    handled: boolean;
}

export interface Unit {
    id: string;
    type: "POLICE" | "FIRE" | "AMBULANCE";
    lat: number;
    lng: number;
    status: "IDLE" | "BUSY" | "MOVING" | "RESPONDING";
    destination?: { lat: number; lng: number };
    heading?: number;
}

export interface HeatmapZone {
    id: string;
    lat: number;
    lng: number;
    radius: number;
    intensity: number; // 0-1
}
