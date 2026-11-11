import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AcousticListener({ onEmergencyDetected }) {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Standby');
  const [volumeLevel, setVolumeLevel] = useState(0);

  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsListening(true);
      setStatus('Monitoring local environment (Privacy Protected)...');

      analyzeAudio();
    } catch (err) {
      console.error('Microphone access denied:', err);
      setStatus('Permission denied. Acoustic detection offline.');
    }
  };

  const stopListening = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();

    setIsListening(false);
    setStatus('Standby');
    setVolumeLevel(0);
  };

  const analyzeAudio = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    let highFreqEnergy = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
      if (i > dataArray.length * 0.6) {
        highFreqEnergy += dataArray[i];
      }
    }

    const averageVolume = sum / dataArray.length;
    const highFreqAvg = highFreqEnergy / (dataArray.length * 0.4);
    setVolumeLevel(Math.min(100, Math.round(averageVolume)));

    if (averageVolume > 85 && highFreqAvg > 70) {
      setStatus('🚨 CRITICAL SOUND DETECTED!');
      onEmergencyDetected({
        type: 'Acoustic Trigger',
        decibels: Math.round(averageVolume),
        timestamp: new Date().toISOString()
      });
      stopListening();
      return;
    }

    animFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  useEffect(() => {
    return () => stopListening();
  }, []);

  return (
    <div className="bg-slate-800 text-white p-4 rounded-xl shadow-lg border border-slate-700 my-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isListening ? (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          ) : (
            <ShieldCheck className="text-emerald-400 w-5 h-5" />
          )}
          <div>
            <h4 className="font-semibold text-sm">AI Acoustic Safeguard</h4>
            <p className="text-xs text-slate-400">{status}</p>
          </div>
        </div>

        <button
          onClick={isListening ? stopListening : startListening}
          className={`p-2.5 rounded-full font-medium transition ${
            isListening
              ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>

      {isListening && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Live Local Audio Level</span>
            <span>{volumeLevel}%</span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${volumeLevel > 75 ? 'bg-red-500' : 'bg-emerald-400'}`}
              style={{ width: `${volumeLevel}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
