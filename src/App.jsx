import React, { useState } from 'react';
import AcousticListener from './components/AcousticListener';
import { Phone, AlertCircle, Shield, Radio } from 'lucide-react';

export default function App() {
  const [emergencyLog, setEmergencyLog] = useState(null);

  const handleEmergencyDetected = (data) => {
    setEmergencyLog(data);
    // Silent alert trigger: opens native dialer or logs payload
    console.log("🚨 Emergency Alert Triggered:", data);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-red-500" />
          <h1 className="text-xl font-bold tracking-tight">SafeAssist</h1>
        </div>
        <span className="text-xs bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full font-medium border border-red-500/20">
          Zambia GBV Response
        </span>
      </header>

      {/* Primary SOS Action */}
      <main className="mt-6 space-y-6">
        <div className="text-center py-4">
          <a
            href="tel:990"
            className="inline-flex items-center justify-center w-36 h-36 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 shadow-xl shadow-red-500/30 hover:scale-105 transition-transform active:scale-95 border-4 border-slate-900"
          >
            <div className="text-center">
              <Phone className="w-10 h-10 mx-auto text-white mb-1 animate-pulse" />
              <span className="font-extrabold text-lg text-white tracking-wider">CALL SOS</span>
            </div>
          </a>
          <p className="text-xs text-slate-400 mt-3">Tap to instantly dial National Emergency Services (990)</p>
        </div>

        {/* AI Acoustic Safeguard Listener */}
        <AcousticListener onEmergencyDetected={handleEmergencyDetected} />

        {/* Alert Notification Card */}
        {emergencyLog && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Automated Incident Alert Logged</p>
              <p>Type: {emergencyLog.type} ({emergencyLog.decibels} dB)</p>
              <p>Time: {new Date(emergencyLog.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        )}

        {/* Fast Helplines */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-300">Zambian Emergency Hotlines</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="tel:116" className="bg-slate-800 p-3 rounded-lg text-center hover:bg-slate-750 border border-slate-700">
              <p className="text-xs text-slate-400">Childline & GBV</p>
              <p className="text-lg font-bold text-emerald-400">116</p>
            </a>
            <a href="tel:999" className="bg-slate-800 p-3 rounded-lg text-center hover:bg-slate-750 border border-slate-700">
              <p className="text-xs text-slate-400">Police Emergency</p>
              <p className="text-lg font-bold text-blue-400">999</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
