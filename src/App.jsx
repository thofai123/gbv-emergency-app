import React from 'react';
import { Phone, AlertCircle, Shield, HeartHandshake } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 max-w-md mx-auto flex flex-col justify-between">
      <div>
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
        <main className="mt-8 space-y-8">
          <div className="text-center py-4">
            <a
              href="tel:990"
              className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 shadow-2xl shadow-red-500/40 hover:scale-105 transition-transform active:scale-95 border-4 border-slate-900"
            >
              <div className="text-center">
                <Phone className="w-12 h-12 mx-auto text-white mb-1 animate-pulse" />
                <span className="font-extrabold text-xl text-white tracking-wider">CALL SOS</span>
              </div>
            </a>
            <p className="text-xs text-slate-400 mt-4">
              Tap to instantly dial National Emergency Services (990)
            </p>
          </div>

          {/* Fast Helplines */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300">Zambian Emergency Hotlines</h3>
            <div className="grid grid-cols-2 gap-3">
              <a 
                href="tel:116" 
                className="bg-slate-800 p-4 rounded-xl text-center hover:bg-slate-750 border border-slate-700 transition"
              >
                <p className="text-xs text-slate-400">Childline & GBV</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">116</p>
              </a>
              <a 
                href="tel:999" 
                className="bg-slate-800 p-4 rounded-xl text-center hover:bg-slate-750 border border-slate-700 transition"
              >
                <p className="text-xs text-slate-400">Police Emergency</p>
                <p className="text-xl font-bold text-blue-400 mt-1">999</p>
              </a>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <p className="font-semibold text-slate-200 mb-1">Confidential & Direct</p>
              <p>Your location and calls go directly to native emergency lines without third-party tracking.</p>
            </div>
          </div>
        </main>
      </div>

      <footer className="text-center py-4 text-xs text-slate-500 border-t border-slate-800 mt-8">
        SafeAssist GBV Emergency Network
      </footer>
    </div>
  );
}
