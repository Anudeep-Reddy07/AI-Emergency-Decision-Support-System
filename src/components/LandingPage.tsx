import { useNavigate } from "react-router-dom";
import { Shield, Users, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617] relative overflow-hidden">

            {/* Background blobs for premium feel */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[100px]" />

            <div className="z-10 text-center mb-12">
                <div className="flex justify-center mb-4">
                    <Activity className="text-blue-500 w-12 h-12" />
                </div>
                <h1 className="text-5xl font-bold tracking-tight text-white mb-2">HYDERABAD <span className="text-blue-500">DSS</span></h1>
                <p className="text-slate-400 max-w-md mx-auto">
                    AI-Powered Emergency Response & Decision Support System
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 z-10 w-full max-w-4xl px-4">

                {/* CITIZEN CARD */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/citizen")}
                    className="glass-panel p-8 rounded-2xl cursor-pointer group hover:bg-slate-800/50 transition-all border-l-4 border-l-green-500"
                >
                    <div className="mb-4 bg-green-500/10 w-14 h-14 rounded-full flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                        <Users className="text-green-500 w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">I am a Citizen</h2>
                    <p className="text-slate-400 text-sm">
                        Report emergencies, request ambulance or police, and track response units near you.
                    </p>
                </motion.div>

                {/* DISPATCHER CARD */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/dispatcher")}
                    className="glass-panel p-8 rounded-2xl cursor-pointer group hover:bg-slate-800/50 transition-all border-l-4 border-l-blue-500"
                >
                    <div className="mb-4 bg-blue-500/10 w-14 h-14 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                        <Shield className="text-blue-500 w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Dispatcher Login</h2>
                    <p className="text-slate-400 text-sm">
                        Monitor real-time incidents, manage fleet resources, and approve AI-driven strategies.
                    </p>
                </motion.div>

            </div>

            <div className="absolute bottom-8 text-xs text-slate-600">
                SafeCity Initiative • v2.0
            </div>
        </div>
    );
}
