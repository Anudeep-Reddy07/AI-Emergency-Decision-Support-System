import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import DispatcherDashboard from "./components/DispatcherDashboard";
import CitizenDashboard from "./components/CitizenDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dispatcher" element={<DispatcherDashboard />} />
      <Route path="/citizen" element={<CitizenDashboard />} />
    </Routes>
  );
}
