import React, { useState, useEffect } from "react";
import {
  Activity,
  Cpu,
  Database,
  RefreshCw,
  Server,
  Zap,
  Layers,
  ShieldCheck,
  Clock,
  HardDrive,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { fetchSystemHealth, SystemHealthData } from "../../services/api";

export const SystemDiagnosticsTool: React.FC = () => {
  const { language } = useApp();
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadHealth = async () => {
    setLoading(true);
    const data = await fetchSystemHealth();
    setHealth(data);
    setLoading(false);
  };

  useEffect(() => {
    loadHealth();
  }, []);

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m ${seconds % 60}s`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-white">
            {language === "om" ? "Fayyaa fi Qorannoo Sirnaa (Diagnostics)" : "Live Telemetry & System Diagnostics"}
          </h3>
        </div>
        <button
          type="button"
          onClick={loadHealth}
          disabled={loading}
          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          <span>{language === "om" ? "Haaromsi" : "Refresh"}</span>
        </button>
      </div>

      {health ? (
        <div className="space-y-4">
          {/* Top Status Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 font-semibold block">{language === "om" ? "Haala Sirnaa" : "System Status"}</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-emerald-400 uppercase font-mono">{health.status}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 font-semibold block">{language === "om" ? "Yeroo Hojii (Uptime)" : "Server Uptime"}</span>
              <span className="text-xs font-bold text-white font-mono mt-1 block">{formatUptime(health.uptimeSec)}</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 font-semibold block">{language === "om" ? "Memory (Heap)" : "Memory Usage"}</span>
              <span className="text-xs font-bold text-sky-400 font-mono mt-1 block">{health.memory.heapUsedMb} MB</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 font-semibold block">{language === "om" ? "Kuusaa Cache" : "AI Cache"}</span>
              <span className="text-xs font-bold text-amber-400 font-mono mt-1 block">
                {health.cache.totalEntries}/{health.cache.maxEntries} hits
              </span>
            </div>
          </div>

          {/* Model Availability Grid */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              {language === "om" ? "Modeloota Gemini & Haala Quota" : "Gemini Models & Quota Availability"}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {health.models.map((m, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-900/80 border border-slate-800/80 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        m.available ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                    <span className="text-[11px] font-mono text-slate-200">{m.model}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      m.available
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                    }`}
                  >
                    {m.available ? "Ready" : "Cooldown"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Endpoints List */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-sky-400" />
              {language === "om" ? "Endpointoota Hojjechaa Jiran" : "Active Core API Endpoints"}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
              {health.activeEndpoints.map((ep, idx) => (
                <div
                  key={idx}
                  className="px-2 py-1.5 bg-slate-900 border border-slate-800/80 rounded font-mono text-[10px] text-slate-300 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span className="truncate">{ep}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center bg-slate-950 border border-slate-800 rounded-xl">
          <RefreshCw className="w-5 h-5 text-slate-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">
            {language === "om" ? "Ragaa sirnaa fe'aa jira..." : "Loading system telemetry..."}
          </p>
        </div>
      )}
    </div>
  );
};
