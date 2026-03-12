import { useState, useEffect } from "react";
import { Send, Shield, Flame, HeartPulse, CheckCircle2 } from "lucide-react";
import MapField from "./MapField";
import type { Incident, Severity, Category, Unit } from "../types";

export default function CitizenDashboard() {
    const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([
        { text: "Hello. I am the AI Emergency Assistant. Please describe your situation or use the SOS buttons below.", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [activeRequest, setActiveRequest] = useState<Partial<Incident> | null>(null);
    const [assignedUnit, setAssignedUnit] = useState<Unit | null>(null);
    const [eta, setEta] = useState<number | null>(null);

    // Citizen Location State (Defaults to center, but user can change)
    const [citizenLoc, setCitizenLoc] = useState({ lat: 17.45, lng: 78.42 });

    /* ===================== SIMULATION LOOP ===================== */
    useEffect(() => {
        if (!assignedUnit) return;

        const interval = setInterval(() => {
            setAssignedUnit(u => {
                if (!u || !u.destination) return u;

                const dx = u.destination.lat - u.lat;
                const dy = u.destination.lng - u.lng;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const speed = 0.0003; // Slightly slower for drama

                if (dist < speed) {
                    // Arrived
                    setEta(0);
                    return { ...u, lat: u.destination.lat, lng: u.destination.lng };
                }

                // Update ETA (approx 1 unit distance ~ 10 mins?)
                setEta(Math.ceil(dist * 200));

                const angle = Math.atan2(dy, dx);
                return {
                    ...u,
                    lat: u.lat + Math.cos(angle) * speed,
                    lng: u.lng + Math.sin(angle) * speed
                };
            });
        }, 50);

        return () => clearInterval(interval);
    }, [assignedUnit?.id]);

    // Track context for follow-up messages
    const [conversationContext, setConversationContext] = useState<{
        primaryCategory: Category | null;
        hasMedicalNeed: boolean;
        dispatchedUnits: Unit['type'][];
    }>({ primaryCategory: null, hasMedicalNeed: false, dispatchedUnits: [] });

    const handleSend = () => {
        if (!input.trim()) return;

        // User Message
        const userMsg = input;
        setMessages((prev) => [...prev, { text: userMsg, sender: "user" }]);
        setInput("");

        // If unit is assigned, chat with unit AND check for follow-ups
        if (assignedUnit) {
            const lower = userMsg.toLowerCase();

            // Check for injury/medical follow-up during active incident
            const mentionsInjury = lower.includes("injured") || lower.includes("hurt") || lower.includes("bleeding") || lower.includes("unconscious") || lower.includes("someone is hurt") || lower.includes("people are hurt");

            if (mentionsInjury && !conversationContext.dispatchedUnits.includes('AMBULANCE')) {
                // Dispatch additional ambulance
                setTimeout(() => {
                    setMessages((prev) => [...prev, {
                        text: `🚨 MEDICAL EMERGENCY DETECTED! Dispatching an Ambulance in addition to the ${assignedUnit.type} unit.`,
                        sender: "bot"
                    }]);

                    // Spawn additional ambulance
                    const startLat = citizenLoc.lat + (Math.random() * 0.02 - 0.01);
                    const startLng = citizenLoc.lng + (Math.random() * 0.02 - 0.01);
                    const ambulanceUnit: Unit = {
                        id: 'AMB-' + Date.now(),
                        type: 'AMBULANCE',
                        lat: startLat,
                        lng: startLng,
                        status: 'RESPONDING',
                        destination: citizenLoc
                    };

                    setConversationContext(prev => ({
                        ...prev,
                        hasMedicalNeed: true,
                        dispatchedUnits: [...prev.dispatchedUnits, 'AMBULANCE']
                    }));

                    setMessages((prev) => [...prev, {
                        text: `Ambulance ${ambulanceUnit.id} dispatched. Medical help is on the way.\n\n💊 FIRST AID:\n1. Apply pressure to any bleeding wounds.\n2. Do NOT move the injured unless in immediate danger.\n3. Keep them calm and warm.`,
                        sender: "bot"
                    }]);
                }, 800);
                return;
            }

            // Standard unit communication
            setTimeout(() => {
                const replies = [
                    "Copy that. We are en route.",
                    "Please stay safe, we are close.",
                    "Can you confirm if anyone is injured?",
                    "Traffic is heavy, but we are moving.",
                    "We've received your location.",
                    "Stay on the line. Help is arriving soon."
                ];
                const randomReply = replies[Math.floor(Math.random() * replies.length)];
                setMessages((prev) => [...prev, { text: `[${assignedUnit.type} UNIT]: ${randomReply}`, sender: "bot" }]);
            }, 1000);
            return;
        }

        // AI Logic (Enhanced NLP with context)
        setTimeout(() => {
            const lower = userMsg.toLowerCase();
            let cat: Category = "MEDICAL";
            let sev: Severity = "MEDIUM";
            let advice = "";
            let unitType: Unit['type'] = 'AMBULANCE';

            // Priority-based classification (most specific first)

            // DEAD BODY -> Police, LOW priority (not a medical emergency)
            if (lower.includes("dead body") || lower.includes("found a body") || lower.includes("corpse") || lower.includes("someone is dead")) {
                cat = "POLICE"; sev = "LOW"; unitType = "POLICE";
                advice = "🔵 POLICE CASE REGISTERED:\n1. Do NOT touch or move anything.\n2. Keep the area clear of bystanders.\n3. Note any details you observe.\n4. Stay nearby for the officers.";
            }
            // PETROL BUNK FIRE -> Critical explosion risk
            else if (lower.includes("petrol bunk") || lower.includes("gas station") || lower.includes("fuel station") || lower.includes("petrol pump")) {
                cat = "FIRE"; sev = "HIGH"; unitType = "FIRE";
                advice = "⚠️ CRITICAL DANGER: EXPLOSION RISK!\n1. Evacuate to at least 200m immediately.\n2. Do NOT start any vehicles.\n3. Warn others to stay away.\n4. Abandon belongings - your safety is priority.";
            }
            // GENERAL FIRE
            else if (lower.includes("fire") || lower.includes("smoke") || lower.includes("burning") || lower.includes("flames")) {
                cat = "FIRE"; sev = "HIGH"; unitType = "FIRE";
                advice = "🔥 FIRE SAFETY:\n1. Evacuate immediately.\n2. Stay low to avoid smoke.\n3. Do NOT use elevators.\n4. Cover nose/mouth with cloth.";
            }
            // HEART ATTACK / CARDIAC
            else if (lower.includes("heart attack") || lower.includes("chest pain") || lower.includes("cardiac") || lower.includes("heart stopped")) {
                cat = "MEDICAL"; sev = "HIGH"; unitType = "AMBULANCE";
                advice = "❤️ POSSIBLE CARDIAC ARREST:\n1. Have the patient sit down and rest.\n2. Loosen any tight clothing.\n3. If unconscious & not breathing, start CPR immediately.\n4. Do NOT give food or water.";
            }
            // DROWNING
            else if (lower.includes("drowning") || lower.includes("fell in water") || lower.includes("can't swim")) {
                cat = "MEDICAL"; sev = "HIGH"; unitType = "AMBULANCE";
                advice = "🌊 DROWNING EMERGENCY:\n1. Call for help loudly.\n2. Throw a flotation device if available.\n3. Do NOT jump in unless trained.\n4. If rescued, check breathing and start CPR if needed.";
            }
            // CHOKING
            else if (lower.includes("choking") || lower.includes("can't breathe") || lower.includes("something stuck")) {
                cat = "MEDICAL"; sev = "HIGH"; unitType = "AMBULANCE";
                advice = "🫁 CHOKING EMERGENCY:\n1. Ask 'Are you choking?' - if they nod, act fast.\n2. Stand behind them, give 5 back blows.\n3. Then 5 abdominal thrusts (Heimlich).\n4. Repeat until object is expelled.";
            }
            // POLICE EMERGENCIES
            else if (lower.includes("police") || lower.includes("thief") || lower.includes("gun") || lower.includes("fight") || lower.includes("robbery") || lower.includes("attack") || lower.includes("stalker") || lower.includes("threatened")) {
                cat = "POLICE"; sev = "HIGH"; unitType = "POLICE";
                advice = "🚨 STAY SAFE:\n1. Move to a safe location if possible.\n2. Do NOT confront the threat.\n3. Lock doors if indoors.\n4. Stay on the line with us.";
            }
            // TRAFFIC ACCIDENTS
            else if (lower.includes("accident") || lower.includes("crash") || lower.includes("collision") || lower.includes("traffic") || lower.includes("hit by")) {
                cat = "TRAFFIC"; sev = "HIGH"; unitType = "POLICE";
                advice = "🚗 ACCIDENT RESPONSE:\n1. Move to safety if possible.\n2. Turn on hazard lights.\n3. Do NOT move injured unless there's fire.\n4. Note vehicle details if hit-and-run.";
            }
            // GENERAL MEDICAL
            else if (lower.includes("blood") || lower.includes("pain") || lower.includes("injury") || lower.includes("ambulance") || lower.includes("medical") || lower.includes("sick") || lower.includes("hospital") || lower.includes("unconscious") || lower.includes("fainted")) {
                cat = "MEDICAL"; sev = "HIGH"; unitType = "AMBULANCE";
            }
            // GENERIC HELP
            else if (lower.includes("help") || lower.includes("emergency") || lower.includes("urgent")) {
                sev = "HIGH";
                advice = "📞 Help is being dispatched. Can you describe what's happening?";
            }

            // Update conversation context
            setConversationContext({
                primaryCategory: cat,
                hasMedicalNeed: cat === 'MEDICAL',
                dispatchedUnits: [unitType]
            });

            // Response
            setMessages((prev) => [...prev, {
                text: `Analyzing: Detected ${sev} priority ${cat} situation. Locating nearby units...`,
                sender: "bot"
            }]);

            // Send advice if available
            if (advice) {
                setTimeout(() => {
                    setMessages((prev) => [...prev, {
                        text: advice,
                        sender: "bot"
                    }]);
                }, 500);
            }

            // Simulate Dispatch with variable ETA
            setActiveRequest({ category: cat, severity: sev, status: 'RESPONDING' });
            setTimeout(() => {
                // Create Mock Unit
                const startLat = citizenLoc.lat + (Math.random() * 0.02 - 0.01);
                const startLng = citizenLoc.lng + (Math.random() * 0.02 - 0.01);

                const newUnit: Unit = {
                    id: 'RES-' + Date.now(),
                    type: unitType,
                    lat: startLat,
                    lng: startLng,
                    status: 'RESPONDING',
                    destination: citizenLoc
                };
                setAssignedUnit(newUnit);

                setMessages((prev) => [...prev, { text: `${unitType} Unit ${newUnit.id} dispatched. You are now connected to the responders.`, sender: "bot" }]);
            }, 1500);

        }, 800);
    };

    const handleSOS = (cat: Category) => {
        setMessages((prev) => [...prev, { text: `SOS: Requesting ${cat} immediately!`, sender: "user" }]);
        setTimeout(() => {
            setMessages((prev) => [...prev, { text: `SOS Signal Received. Dispatching nearest ${cat} unit.`, sender: "bot" }]);
            setActiveRequest({ category: cat, severity: 'HIGH', status: 'RESPONDING' });

            // Spawn Unit
            const startLat = citizenLoc.lat + (Math.random() * 0.02 - 0.01);
            const startLng = citizenLoc.lng + (Math.random() * 0.02 - 0.01);
            const newUnit: Unit = {
                id: 'SOS-99',
                type: cat === 'MEDICAL' ? 'AMBULANCE' : cat === 'FIRE' ? 'FIRE' : 'POLICE',
                lat: startLat,
                lng: startLng,
                status: 'RESPONDING',
                destination: citizenLoc
            };
            setAssignedUnit(newUnit);
        }, 1000);
    };

    const [isExpanded, setIsExpanded] = useState(false);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [messages, isExpanded]);

    return (
        <div className="h-screen w-full flex flex-col md:flex-row bg-[#020617] text-white overflow-hidden relative">

            {/* MAP BACKGROUND (Read Only) */}
            <div className={`absolute inset-0 z-0 transition-opacity duration-300 ${isExpanded ? 'opacity-30' : 'opacity-100'} md:opacity-100`}>
                <MapField
                    incidents={activeRequest ? [{ ...activeRequest, id: 1, lat: citizenLoc.lat, lng: citizenLoc.lng, location: "My Location" } as Incident] : []}
                    clusters={[]}
                    units={assignedUnit ? [assignedUnit] : []}
                    activeRoute={assignedUnit ? [[assignedUnit.lat, assignedUnit.lng], [citizenLoc.lat, citizenLoc.lng]] : undefined}
                    interactive={true}
                    userLocation={citizenLoc}
                    onPick={(lat, lng) => setCitizenLoc({ lat, lng })}
                />
            </div>

            {/* CHAT INTERFACE - Bottom Sheet on Mobile, Side Panel on Desktop */}
            <div
                className={`
                    z-20 flex flex-col 
                    fixed bottom-0 left-0 right-0 
                    md:relative md:w-[400px] md:h-full 
                    bg-slate-900/95 backdrop-blur-md md:bg-slate-900/80
                    border-t md:border-t-0 md:border-r border-slate-700/50 
                    transition-all duration-300 ease-in-out
                    ${isExpanded ? 'h-[85vh]' : 'h-auto'} md:h-full
                    rounded-t-3xl md:rounded-none shadow-2xl md:shadow-none
                `}
            >
                {/* Mobile Drag Handle & Header */}
                <div
                    className="p-4 border-b border-slate-700/50 flex flex-col items-center cursor-pointer md:cursor-auto"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {/* Handle for Mobile */}
                    <div className="w-12 h-1.5 bg-slate-600 rounded-full mb-3 md:hidden" />

                    <h2 className="font-bold text-lg flex items-center gap-2 w-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        AI Emergency Assistant
                        <span className="ml-auto text-xs text-slate-400 md:hidden">
                            {isExpanded ? 'Tap to collapse' : 'Tap to expand'}
                        </span>
                    </h2>
                </div>

                {/* Messages Area - Scrollable */}
                <div
                    id="chat-container"
                    className={`
                        flex-1 overflow-y-auto p-4 space-y-4 
                        ${isExpanded ? 'block' : 'hidden'} md:block
                    `}
                >
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {activeRequest && eta && (
                        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="text-green-500 h-8 w-8" />
                                <div>
                                    <h3 className="font-bold text-green-400">Help is on the way</h3>
                                    <p className="text-xs text-green-300">Nearest {activeRequest.category} unit arriving in {eta} mins.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer: SOS & Input (Always Visible) */}
                <div className="p-4 bg-slate-900/90 border-t border-slate-700/50 pb-8 md:pb-4">

                    {/* SOS BUTTONS */}
                    {!activeRequest && (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <button onClick={(e) => { e.stopPropagation(); handleSOS('MEDICAL'); }} className="flex flex-col items-center justify-center p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-xl transition text-red-500">
                                <HeartPulse size={24} className="mb-1" />
                                <span className="text-[10px] font-bold">MEDICAL</span>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleSOS('POLICE'); }} className="flex flex-col items-center justify-center p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/50 rounded-xl transition text-blue-500">
                                <Shield size={24} className="mb-1" />
                                <span className="text-[10px] font-bold">POLICE</span>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleSOS('FIRE'); }} className="flex flex-col items-center justify-center p-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/50 rounded-xl transition text-orange-500">
                                <Flame size={24} className="mb-1" />
                                <span className="text-[10px] font-bold">FIRE</span>
                            </button>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <input
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-sm outline-none focus:border-blue-500 transition"
                            placeholder="Type your emergency..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            onClick={(e) => e.stopPropagation()} // Prevent toggling when clicking input
                        />
                        <button
                            onClick={(e) => { e.stopPropagation(); handleSend(); }}
                            className="bg-blue-600 hover:bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center transition disabled:opacity-50"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
