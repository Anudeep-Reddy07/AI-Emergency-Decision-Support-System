import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMapEvents, Polyline, Marker } from "react-leaflet";
import { divIcon, type LeafletMouseEvent } from "leaflet";
import type { Cluster, Incident, Unit, HeatmapZone } from "../types";
// import { AlertTriangle, MapPin } from "lucide-react"; // Unused currently

interface MapFieldProps {
    incidents: Incident[];
    clusters: Cluster[];
    units?: Unit[]; // Optional for now
    heatmaps?: HeatmapZone[];
    activeRoute?: [number, number][];
    userLocation?: { lat: number; lng: number };
    onPick?: (lat: number, lng: number) => void;
    interactive?: boolean;
}

function MapClick({ onPick }: { onPick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e: LeafletMouseEvent) {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function MapField({ incidents, clusters, heatmaps, activeRoute, units, userLocation, onPick, interactive = true }: MapFieldProps) {
    return (
        <div className={`h-full w-full relative z-0 ${interactive && onPick ? 'cursor-crosshair' : 'cursor-pointer'}`}>
            <MapContainer
                center={[17.45, 78.42]}
                zoom={12}
                className={`h-full w-full ${interactive && onPick ? '[&_.leaflet-container]:cursor-crosshair' : '[&_.leaflet-container]:cursor-pointer'}`}
                zoomControl={false} // clean look
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {interactive && onPick && <MapClick onPick={onPick} />}

                {/* SMART ROUTE */}
                {activeRoute && (
                    <Polyline
                        positions={activeRoute}
                        pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 10', opacity: 0.8 }}
                    />
                )}

                {/* PREDICTIVE HEATMAPS */}
                {heatmaps?.map((h) => (
                    <Circle
                        key={h.id}
                        center={[h.lat, h.lng]}
                        radius={h.radius}
                        pathOptions={{
                            color: "transparent",
                            fillColor: "#ef4444",
                            fillOpacity: h.intensity * 0.5,
                        }}
                    >
                        <Popup className="glass-popup" closeButton={false}>
                            <div className="text-center">
                                <span className="text-red-400 font-bold text-xs uppercase block">High Risk Zone</span>
                                <span className="text-xs text-slate-300">Predicted Incident Area</span>
                            </div>
                        </Popup>
                    </Circle>
                ))}

                {/* UNITS */}
                {units?.map((u) => (
                    <CircleMarker
                        key={u.id}
                        center={[u.lat, u.lng]}
                        radius={10}
                        pathOptions={{
                            color: "white",
                            fillColor: u.type === 'POLICE' ? '#3b82f6' : u.type === 'FIRE' ? '#f97316' : '#ef4444',
                            fillOpacity: 1,
                            weight: 2
                        }}
                    >
                        <Popup className="glass-popup">
                            <div className="p-2 text-center">
                                <h3 className="font-bold">{u.type} UNIT</h3>
                                <div className="text-xs text-slate-300">{u.status}</div>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}

                {/* CLUSTERS/HOTSPOTS */}
                {clusters.map((c) => (
                    <CircleMarker
                        key={c.id}
                        center={[c.lat, c.lng]}
                        radius={20}
                        pathOptions={{
                            color: c.handled ? "#22c55e" : "#ef4444",
                            fillColor: c.handled ? "#22c55e" : "#ef4444",
                            fillOpacity: 0.4,
                            weight: 0
                        }}
                    >
                        <Popup className="glass-popup">
                            <div className="p-2">
                                <h3 className="font-bold mb-1">{c.incidents.length} Incidents</h3>
                                <span className={`text-xs px-2 py-1 rounded ${c.handled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {c.handled ? "Handled" : "Critical Hotspot"}
                                </span>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}

                {/* INDIVIDUAL INCIDENTS (Optional visualization) */}
                {incidents.map((i) => (
                    <CircleMarker
                        key={i.id}
                        center={[i.lat, i.lng]}
                        radius={5}
                        pathOptions={{
                            color: i.status === "RESPONDING" ? "#3b82f6" : "#f59e0b",
                            fillOpacity: 0.8,
                            weight: 0
                        }}
                    />
                ))}

                {/* USER LOCATION MARKER */}
                {userLocation && (
                    <Marker
                        position={[userLocation.lat, userLocation.lng]}
                        icon={divIcon({
                            html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full drop-shadow-md filter"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg>`,
                            className: "bg-transparent",
                            iconSize: [40, 40],
                            iconAnchor: [20, 40],
                        })}
                    >
                        <Popup offset={[0, -35]} className="glass-popup">
                            <div className="text-center p-1">
                                <span className="font-bold text-slate-800">Your Location</span>
                            </div>
                        </Popup>
                    </Marker>
                )}

            </MapContainer>

            {/* Overlay Gradient at bottom for style */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
        </div>
    );
}
