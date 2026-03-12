import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MapField from "./MapField";
import { getLocationName } from "../utils/geo";
import { clusterIncidents, severityWeight, colorByStatus } from "../utils/clustering";
import type { Incident, Cluster, Severity, Category, HeatmapZone, Unit } from "../types";
import { Siren, Radio, ArrowLeft, Layers, History } from "lucide-react";

// Mock Data for Predictive AI
const MOCK_HEATMAPS: HeatmapZone[] = [
    { id: 'h1', lat: 17.48, lng: 78.40, radius: 800, intensity: 0.7 },
    { id: 'h2', lat: 17.42, lng: 78.46, radius: 600, intensity: 0.5 },
    { id: 'h3', lat: 17.44, lng: 78.38, radius: 500, intensity: 0.6 },
    { id: 'h4', lat: 17.46, lng: 78.44, radius: 700, intensity: 0.4 },
];

const INITIAL_UNITS: Unit[] = [
    { id: 'u1', type: 'POLICE', lat: 17.44, lng: 78.38, status: 'IDLE' },
    { id: 'u2', type: 'POLICE', lat: 17.46, lng: 78.43, status: 'IDLE' },
    { id: 'u3', type: 'AMBULANCE', lat: 17.43, lng: 78.41, status: 'IDLE' },
    { id: 'u4', type: 'FIRE', lat: 17.47, lng: 78.45, status: 'IDLE' },
    { id: 'u5', type: 'POLICE', lat: 17.42, lng: 78.40, status: 'IDLE' },
    { id: 'u6', type: 'AMBULANCE', lat: 17.45, lng: 78.37, status: 'IDLE' },
    { id: 'u7', type: 'FIRE', lat: 17.48, lng: 78.42, status: 'IDLE' },
    { id: 'u8', type: 'POLICE', lat: 17.41, lng: 78.44, status: 'IDLE' },
];

// Initial Demo Incidents (for showcasing the system)
const DEMO_INCIDENTS: Incident[] = [
    { id: 1001, lat: 17.45, lng: 78.41, location: "Jubilee Hills", severity: "HIGH", category: "FIRE", status: "PENDING" },
    { id: 1002, lat: 17.44, lng: 78.44, location: "Banjara Hills", severity: "MEDIUM", category: "MEDICAL", status: "PENDING" },
    { id: 1003, lat: 17.46, lng: 78.39, location: "Gachibowli", severity: "HIGH", category: "POLICE", status: "PENDING" },
];

export default function DispatcherDashboard() {
    const navigate = useNavigate();
    const [incidents, setIncidents] = useState<Incident[]>(DEMO_INCIDENTS);
    const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
    const [clusters, setClusters] = useState<Cluster[]>([]);
    const [pick, setPick] = useState<{ lat: number; lng: number } | null>(null);
    const [showHeatmap, setShowHeatmap] = useState(false);

    const [severity, setSeverity] = useState<Severity>("LOW");
    const [category, setCategory] = useState<Category>("MEDICAL");
    const [loadingLocation, setLoadingLocation] = useState(false);

    /* Recalculate clusters */
    useEffect(() => {
        setClusters(clusterIncidents(incidents));
    }, [incidents]);

    /* ===================== ADD INCIDENT ===================== */
    const addIncident = async () => {
        if (!pick) return;

        setLoadingLocation(true);
        const location = await getLocationName(pick.lat, pick.lng);
        setLoadingLocation(false);

        setIncidents((prev) => [
            ...prev,
            {
                id: Date.now(),
                lat: pick.lat,
                lng: pick.lng,
                location,
                severity,
                category,
                status: "PENDING",
            },
        ]);

        setPick(null);
    };

    /* ===================== AI ALERTS ===================== */
    const aiAlerts = clusters.filter((c) => {
        const load = c.incidents.reduce(
            (sum, i) => sum + severityWeight(i.severity),
            0
        );
        return load >= 6 && !c.handled;
    });

    /* ===================== AUTOMATED AI REROUTING ===================== */
    useEffect(() => {
        const interval = setInterval(() => {
            // Find clusters that need attention (> 2 incidents, not handled)
            const criticalClusters = clusters.filter(c => !c.handled && c.incidents.length > 2);

            if (criticalClusters.length === 0) return; // Nothing to do

            // Pick the most critical cluster (highest incident count)
            const mostCritical = criticalClusters.reduce((a, b) =>
                a.incidents.length > b.incidents.length ? a : b
            );

            // Find nearest idle unit
            const idleUnits = units.filter(u => u.status === 'IDLE');
            if (idleUnits.length === 0) return; // No available units

            const nearestUnit = idleUnits.reduce((closest, u) => {
                const distU = Math.sqrt((u.lat - mostCritical.lat) ** 2 + (u.lng - mostCritical.lng) ** 2);
                const distC = Math.sqrt((closest.lat - mostCritical.lat) ** 2 + (closest.lng - mostCritical.lng) ** 2);
                return distU < distC ? u : closest;
            });

            const dest = { lat: mostCritical.lat, lng: mostCritical.lng };
            setUnits(prev => prev.map(u =>
                u.id === nearestUnit.id ? { ...u, destination: dest, status: 'MOVING' } : u
            ));

            addLog(`AI AUTO: Nearest ${nearestUnit.type} (${nearestUnit.id}) rerouted to hotspot with ${mostCritical.incidents.length} incidents.`);

        }, 4000); // Check every 4 sec (balanced frequency)

        return () => clearInterval(interval);
    }, [clusters, units]);

    /* ===================== SIMULATION LOOP (ANIMATION) ===================== */
    useEffect(() => {
        const interval = setInterval(() => {
            setUnits(prevUnits => prevUnits.map(u => {
                if ((u.status === 'MOVING' || u.status === 'RESPONDING') && u.destination) {
                    const dx = u.destination.lat - u.lat;
                    const dy = u.destination.lng - u.lng;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Speed factor (approx 0.001 deg per tick ~ 100m)
                    const speed = 0.0005;

                    if (dist < speed) {
                        // Arrived
                        return { ...u, lat: u.destination.lat, lng: u.destination.lng, status: 'IDLE', destination: undefined };
                    }

                    // Move
                    const angle = Math.atan2(dy, dx);
                    return {
                        ...u,
                        lat: u.lat + Math.cos(angle) * speed,
                        lng: u.lng + Math.sin(angle) * speed,
                        heading: (angle * 180) / Math.PI // Optional heading
                    };
                }
                return u;
            }));
        }, 50); // 20 FPS

        return () => clearInterval(interval);
    }, []);

    /* ===================== ACTIONS ===================== */
    const [activeRoute, setActiveRoute] = useState<[number, number][] | undefined>(undefined);
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [msg, ...prev]);

    const handleReroute = () => {
        if (!selectedUnitId || !pick) return;

        const dest = { lat: pick.lat, lng: pick.lng };

        setUnits(prev => prev.map(u =>
            u.id === selectedUnitId ? { ...u, destination: dest, status: 'MOVING' } : u
        ));

        const unit = units.find(u => u.id === selectedUnitId);
        addLog(`MANUAL: Rerouted ${unit?.type} (${unit?.id}) to new coordinates.`);

        // Show route
        if (unit) {
            setActiveRoute([[unit.lat, unit.lng], [pick.lat, pick.lng]]);
        }

        setPick(null);
        setSelectedUnitId(null);
    };

    const dispatchSingleIncident = (id: number) => {
        setIncidents((prev) =>
            prev.map((i) =>
                i.id === id ? { ...i, status: "RESPONDING" } : i
            )
        );

        const incident = incidents.find(i => i.id === id);
        if (incident) {
            // Smart Unit Matching: Map incident category to ideal unit type
            const categoryToUnitType: Record<string, Unit['type']> = {
                'MEDICAL': 'AMBULANCE',
                'FIRE': 'FIRE',
                'POLICE': 'POLICE',
                'TRAFFIC': 'POLICE', // Police handles traffic incidents
            };
            const preferredType = categoryToUnitType[incident.category] || 'POLICE';

            // Find nearest IDLE unit of preferred type, or any idle unit
            const idleUnits = units.filter(u => u.status === 'IDLE');
            const preferredUnits = idleUnits.filter(u => u.type === preferredType);
            const candidateUnits = preferredUnits.length > 0 ? preferredUnits : idleUnits;

            // Find nearest
            const findNearest = (target: { lat: number; lng: number }, unitList: Unit[]): Unit | undefined => {
                if (unitList.length === 0) return undefined;
                return unitList.reduce((closest, u) => {
                    const distU = Math.sqrt((u.lat - target.lat) ** 2 + (u.lng - target.lng) ** 2);
                    const distC = Math.sqrt((closest.lat - target.lat) ** 2 + (closest.lng - target.lng) ** 2);
                    return distU < distC ? u : closest;
                });
            };

            const unit = findNearest(incident, candidateUnits) || units[0];

            const start: [number, number] = [unit.lat, unit.lng];
            const end: [number, number] = [incident.lat, incident.lng];

            // Assign Unit Destination
            setUnits(prev => prev.map(u =>
                u.id === unit.id ? { ...u, destination: { lat: end[0], lng: end[1] }, status: 'RESPONDING' } : u
            ));

            addLog(`DISPATCH: ${unit.type} (${unit.id}) responding to ${incident.category} incident.`);

            // Generate realistic route
            const route: [number, number][] = [
                start,
                [start[0] + (end[0] - start[0]) * 0.3, start[1] + (end[1] - start[1]) * 0.2],
                [start[0] + (end[0] - start[0]) * 0.7, start[1] + (end[1] - start[1]) * 0.8],
                end
            ];
            setActiveRoute(route);
        }
    };

    const approveDispatch = (clusterId: number) => {
        setClusters((prev) =>
            prev.map((c) =>
                c.id === clusterId ? { ...c, handled: true } : c
            )
        );

        // mark all incidents in cluster as responding
        setIncidents((prev) =>
            prev.map((i) =>
                clusters
                    .find((c) => c.id === clusterId)
                    ?.incidents.some((ci) => ci.id === i.id)
                    ? { ...i, status: "RESPONDING" }
                    : i
            )
        );
    };

    const resolveIncident = (id: number) => {
        setIncidents((prev) => prev.filter((i) => i.id !== id));
    };

    return (
        <div className="h-screen w-full flex bg-[#020617] text-white overflow-hidden relative">

            <div className="absolute inset-0 z-0">
                <MapField
                    incidents={incidents}
                    clusters={clusters}
                    units={units}
                    heatmaps={showHeatmap ? MOCK_HEATMAPS : []}
                    activeRoute={activeRoute}
                    onPick={(lat, lng) => setPick({ lat, lng })}
                />
            </div>

            {/* LEFT PANEL - INCIDENT FEED */}
            <div className="w-[360px] h-full z-10 p-4 pointer-events-none flex flex-col gap-4">
                {/* HEADER */}
                <div className="glass-panel p-4 rounded-xl pointer-events-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <button onClick={() => navigate('/')} className="hover:bg-slate-700/50 p-1 rounded transition">
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="font-bold text-lg tracking-wide">COMMAND CENTER</h2>
                    </div>

                    {/* TOGGLES */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setShowHeatmap(!showHeatmap)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-bold transition ${showHeatmap ? 'bg-indigo-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}
                        >
                            <Layers size={14} />
                            PREDICTIVE AI
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-slate-400">LIVE SYSTEM</span>
                        </div>
                        <div className="text-2xl font-bold font-mono">{incidents.length} <span className="text-xs font-sans text-slate-500 font-normal">ACTIVE</span></div>
                    </div>
                </div>

                {/* FEED */}
                <div className="glass-panel flex-1 rounded-xl p-3 overflow-y-auto pointer-events-auto">
                    <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Incident Feed</h3>

                    {incidents.length === 0 && (
                        <div className="text-center py-8 text-slate-500 text-sm">
                            No active incidents.
                            <br />
                            System monitoring...
                        </div>
                    )}

                    {incidents.map((i) => (
                        <div key={i.id} className="mb-3 p-3 bg-slate-900/50 border border-slate-700/50 rounded hover:bg-slate-800/50 transition">
                            <div className="flex justify-between items-start mb-2">
                                <span
                                    className="text-[10px] font-bold px-2 py-0.5 rounded border"
                                    style={{
                                        borderColor: colorByStatus(i),
                                        color: colorByStatus(i),
                                        backgroundColor: `${colorByStatus(i)}10`
                                    }}
                                >
                                    {i.status}
                                </span>
                                <span className="text-[10px] text-slate-500">{new Date(i.id).toLocaleTimeString()}</span>
                            </div>

                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm">{i.category} ALERT</span>
                                {i.severity === 'HIGH' && <AlertBadge />}
                            </div>
                            <p className="text-xs text-slate-400 mb-3 truncate">{i.location}</p>

                            <div className="flex gap-2">
                                {i.status === "PENDING" && (
                                    <button
                                        className="flex-1 text-xs bg-blue-600 hover:bg-blue-500 py-1.5 rounded transition font-medium"
                                        onClick={() => dispatchSingleIncident(i.id)}
                                    >
                                        Dispatch
                                    </button>
                                )}
                                <button
                                    className="flex-1 text-xs bg-slate-700 hover:bg-slate-600 py-1.5 rounded transition"
                                    onClick={() => resolveIncident(i.id)}
                                >
                                    Resolve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CENTER - PICKER INDICATOR */}
            {pick && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-panel px-6 py-2 rounded-full z-20 pointer-events-auto flex items-center gap-3 animate-in slide-in-from-top-4">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                    <span className="text-sm">Location Selected</span>
                    <button onClick={() => setPick(null)} className="text-xs underline text-slate-400 hover:text-white">Cancel</button>
                </div>
            )}

            {/* RIGHT PANEL - AI & CONTROLS */}
            <div className="absolute right-0 top-0 bottom-0 w-[400px] p-4 pointer-events-none flex flex-col gap-4">

                {/* AI ALERTS */}
                {aiAlerts.length > 0 && (
                    <div className="glass-panel p-4 rounded-xl pointer-events-auto border-l-4 border-l-red-500 animate-in slide-in-from-right">
                        <div className="flex items-center gap-2 mb-3 text-red-400">
                            <Siren className="animate-pulse" />
                            <h3 className="font-bold">AI CRITICAL ALERT</h3>
                        </div>

                        {aiAlerts.map((c) => (
                            <div key={c.id} className="mb-4 last:mb-0">
                                <p className="text-sm mb-1">Abnormal concentration detected.</p>
                                <div className="bg-red-500/10 p-2 rounded mb-2">
                                    <div className="text-2xl font-bold text-white">{c.incidents.length} <span className="text-xs font-normal text-red-300">INCIDENTS</span></div>
                                    <div className="text-xs text-red-300">{c.incidents[0].location}</div>
                                </div>
                                <button
                                    className="w-full bg-red-600 hover:bg-red-500 py-2 rounded font-bold text-sm transition flex items-center justify-center gap-2"
                                    onClick={() => approveDispatch(c.id)}
                                >
                                    <Radio size={16} />
                                    APPROVE MASS DISPATCH
                                </button>
                            </div>
                        ))}
                    </div>
                )}


                {/* MANUAL ADD */}
                <div className="mt-auto glass-panel p-4 rounded-xl pointer-events-auto">
                    <h3 className="font-bold text-sm text-slate-400 mb-3 uppercase tracking-wider">Manual Entry / Reroute</h3>

                    {/* UNIT SELECTION FOR REROUTE */}
                    <div className="mb-3">
                        <label className="text-[10px] text-slate-500 block mb-1">SELECT UNIT TO REROUTE (OPTIONAL)</label>
                        <select
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm outline-none focus:border-blue-500"
                            value={selectedUnitId || ""}
                            onChange={(e) => setSelectedUnitId(e.target.value || null)}
                        >
                            <option value="">-- No Unit Selected --</option>
                            {units.map(u => (
                                <option key={u.id} value={u.id}>{u.type} ({u.status})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                            <label className="text-[10px] text-slate-500 block mb-1">CATEGORY</label>
                            <select
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm outline-none focus:border-blue-500"
                                value={category}
                                onChange={(e) => setCategory(e.target.value as Category)}
                                disabled={!!selectedUnitId}
                            >
                                <option>MEDICAL</option>
                                <option>POLICE</option>
                                <option>TRAFFIC</option>
                                <option>FIRE</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500 block mb-1">SEVERITY</label>
                            <select
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm outline-none focus:border-blue-500"
                                value={severity}
                                onChange={(e) => setSeverity(e.target.value as Severity)}
                                disabled={!!selectedUnitId}
                            >
                                <option>LOW</option>
                                <option>MEDIUM</option>
                                <option>HIGH</option>
                            </select>
                        </div>
                    </div>

                    <button
                        disabled={!pick || loadingLocation}
                        onClick={selectedUnitId ? handleReroute : addIncident}
                        className={`w-full py-2 rounded font-medium transition text-sm disabled:opacity-50 disabled:cursor-not-allowed ${selectedUnitId ? 'bg-orange-600 hover:bg-orange-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                    >
                        {loadingLocation ? "Locating..." : pick ? (selectedUnitId ? "Reroute Unit Here" : "Confirm Incident") : "Select on Map First"}
                    </button>
                </div>

                {/* AI LOGS */}
                <div className="glass-panel p-4 rounded-xl pointer-events-auto flex-1 overflow-hidden flex flex-col min-h-[150px]">
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <History size={14} />
                        <h3 className="font-bold text-xs uppercase tracking-wider">System Logs</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {logs.length === 0 && <span className="text-[10px] text-slate-600 italic">No activity logs recorded.</span>}
                        {logs.map((log, i) => (
                            <div key={i} className="text-[10px] p-2 bg-slate-900/50 rounded border border-slate-800 text-slate-300 font-mono">
                                <span className="text-blue-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                {log}
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
}

function AlertBadge() {
    return (
        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            CRITICAL
        </span>
    );
}
