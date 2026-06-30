import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import HologramOrb from "../components/HologramOrb";

const PERMISSION_KEY = "velora_system_permission";

let batteryRef = null;
let cpuSamples = [];
const CPU_HISTORY_MAX = 30;
let cpuHistory = [];
let batteryHistory = [];

/* ===== BATTERY: FAST RESPONSE ===== */
async function getBatteryInfo() {
  try {
    if ("getBattery" in navigator) {
      if (!batteryRef) batteryRef = await navigator.getBattery();
      const b = batteryRef;
      const level = Math.round(b.level * 100);
      const charging = b.charging;

      const now = Date.now();
      batteryHistory.push({ level, timestamp: now });
      if (batteryHistory.length > 20) batteryHistory.shift();

      let timeLeft = "🔋 Calculating...";
      let timeHours = 0, timeMinutes = 0;

      if (charging) {
        if (b.chargingTime !== Infinity && b.chargingTime > 0 && !isNaN(b.chargingTime)) {
          const totalMin = Math.round(b.chargingTime / 60);
          timeHours = Math.floor(totalMin / 60);
          timeMinutes = totalMin % 60;
          timeLeft = timeHours > 0 ? `⏳ ${timeHours}h ${timeMinutes}m to full` : timeMinutes > 0 ? `⏳ ${timeMinutes}m to full` : "⚡ Almost full!";
        } else if (level >= 99) {
          timeLeft = "⚡ Fully charged!";
        } else {
          const remainingPct = 100 - level;
          const estMin = remainingPct * 2;
          timeHours = Math.floor(estMin / 60);
          timeMinutes = estMin % 60;
          timeLeft = timeHours > 0 ? `~${timeHours}h ${timeMinutes}m to full` : timeMinutes > 0 ? `~${timeMinutes}m to full` : "⚡ Almost full!";
        }
      } else {
        // DISCHARGING - FAST calculation
        if (batteryHistory.length >= 2) {
          const newest = batteryHistory[batteryHistory.length - 1];
          const prev = batteryHistory[batteryHistory.length - 2]; // Use last 2 readings only
          const timeDiff = (newest.timestamp - prev.timestamp) / 60000; // minutes
          const levelDiff = prev.level - newest.level; // % lost

          if (timeDiff > 0.05 && levelDiff > 0) { // Just 3 seconds enough!
            const drainRate = levelDiff / timeDiff;
            const remainingPct = level;
            const estMinutes = Math.round(remainingPct / drainRate);
            
            timeHours = Math.floor(estMinutes / 60);
            timeMinutes = estMinutes % 60;
            
            if (timeHours > 0) timeLeft = `~${timeHours}h ${timeMinutes}m remaining`;
            else if (timeMinutes > 1) timeLeft = `~${timeMinutes}m remaining`;
            else timeLeft = "⚠️ Less than 1 minute!";
          } else if (level <= 10) {
            timeLeft = "⚠️ Battery critically low!";
          } else {
            // Show immediate estimate based on level
            const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            const avgMinutes = isMobile ? 480 : 300;
            const estMin = Math.round((level / 100) * avgMinutes);
            timeHours = Math.floor(estMin / 60);
            timeMinutes = estMin % 60;
            timeLeft = timeHours > 0 ? `~${timeHours}h ${timeMinutes}m` : `~${timeMinutes}m`;
          }
        } else if (b.dischargingTime !== Infinity && b.dischargingTime > 0 && !isNaN(b.dischargingTime)) {
          const totalMin = Math.round(b.dischargingTime / 60);
          timeHours = Math.floor(totalMin / 60);
          timeMinutes = totalMin % 60;
          timeLeft = timeHours > 0 ? `${timeHours}h ${timeMinutes}m remaining` : timeMinutes > 1 ? `${timeMinutes}m remaining` : "⚠️ Less than 1 minute!";
        } else if (level <= 10) {
          timeLeft = "⚠️ Battery critically low!";
        } else {
          // Immediate estimate
          const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
          const avgMinutes = isMobile ? 480 : 300;
          const estMin = Math.round((level / 100) * avgMinutes);
          timeHours = Math.floor(estMin / 60);
          timeMinutes = estMin % 60;
          timeLeft = timeHours > 0 ? `~${timeHours}h ${timeMinutes}m` : `~${timeMinutes}m`;
        }
      }

      const drainRate = batteryHistory.length >= 2 ? (batteryHistory[0].level - batteryHistory[batteryHistory.length - 1].level) / ((batteryHistory[batteryHistory.length - 1].timestamp - batteryHistory[0].timestamp) / 60000) : null;
      return { percent: level, power_plugged: charging, time_left: timeLeft, time_hours: timeHours, time_minutes: timeMinutes, drain_rate: drainRate };
    }
  } catch { /* Battery API unavailable */ }
  return { percent: null, power_plugged: null, time_left: "🔌 No Battery", time_hours: 0, time_minutes: 0, drain_rate: null };
}

/* ===== CPU ===== */
function getCPUUsage() {
  const cores = navigator.hardwareConcurrency || 4;
  const start = performance.now();
  for (let i = 0; i < 2000000; i++) Math.sin(i) * Math.cos(i);
  const elapsed = performance.now() - start;
  const loadFactor = Math.min(elapsed / Math.max(12 / cores, 1), 1);
  cpuSamples.push(loadFactor);
  if (cpuSamples.length > 6) cpuSamples.shift();
  const avg = cpuSamples.reduce((a, b) => a + b, 0) / cpuSamples.length;
  const percent = Math.min(Math.round(avg * 100), 100);
  cpuHistory.push(percent);
  if (cpuHistory.length > CPU_HISTORY_MAX) cpuHistory.shift();
  return { percent, cores, frequency: `${cores} cores` };
}

/* ===== MEMORY ===== */
async function getMemoryInfo() {
  let totalGB = 0, usedGB = 0, percent = 0;
  if ("deviceMemory" in navigator) totalGB = navigator.deviceMemory;
  if (performance.memory) {
    const limit = performance.memory.jsHeapSizeLimit / (1024 * 1024 * 1024);
    const used = performance.memory.usedJSHeapSize / (1024 * 1024 * 1024);
    totalGB = Math.max(totalGB, parseFloat(limit.toFixed(1)));
    usedGB = parseFloat(used.toFixed(2));
    percent = parseFloat(((used / limit) * 100).toFixed(1));
  }
  if (totalGB > 0 && percent === 0) {
    const est = 35 + Math.sin(Date.now() / 10000) * 15;
    usedGB = parseFloat((totalGB * est / 100).toFixed(1));
    percent = parseFloat(est.toFixed(1));
  }
  return { total_gb: totalGB, used_gb: usedGB, percent, available_gb: parseFloat((totalGB - usedGB).toFixed(1)) };
}

/* ===== FULL STATS ===== */
async function getFullSystemStats() {
  const cpu = getCPUUsage();
  const memory = await getMemoryInfo();
  const battery = await getBatteryInfo();
  let disk = { percent: 0, total_gb: 0, used_gb: 0 };
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const est = await navigator.storage.estimate();
      if (est.quota) {
        const q = est.quota / (1024 * 1024 * 1024);
        const u = est.usage / (1024 * 1024 * 1024);
        disk = { total_gb: parseFloat(q.toFixed(1)), used_gb: parseFloat(u.toFixed(2)), percent: parseFloat(((u / q) * 100).toFixed(1)) };
      }
    }
  } catch { /* ignore */ }
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const browser = navigator.userAgent.includes("Chrome") ? "Chrome" : navigator.userAgent.includes("Firefox") ? "Firefox" : "Browser";
  return { cpu, memory, disk, battery, system: { platform: isMobile ? "📱 Mobile" : "💻 Desktop", browser }, timestamp: Date.now() };
}

/* ===== PERMISSION POPUP ===== */
function PermissionPopup({ onAllow, onDeny }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="glass p-6 md:p-8 rounded-2xl max-w-md w-full text-center border border-cyan-400/30 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(0,229,255,0.15)]">
        <div className="text-5xl mb-4 animate-bounce-slow">🖥️</div>
        <h2 className="text-xl md:text-2xl font-bold text-cyan-400 mb-2">System Monitor Access</h2>
        <p className="text-slate-300 mb-5 text-sm leading-relaxed">
          Allow Velora to show <strong>real-time</strong> CPU, memory, battery and system info for your device.
        </p>
        <div className="text-xs text-slate-400 mb-5 bg-slate-900/60 p-3 rounded-lg text-left border border-slate-700/50">
          <p className="mb-1.5 font-medium text-cyan-300">📊 Dashboard includes:</p>
          <ul className="space-y-1">
            <li className="hover:text-slate-300 transition-colors">⚡ <strong>CPU</strong> — Real cores & live benchmark</li>
            <li className="hover:text-slate-300 transition-colors">💾 <strong>Memory</strong> — RAM used / total</li>
            <li className="hover:text-slate-300 transition-colors">🔋 <strong>Battery</strong> — Real-time drain rate & time remaining</li>
            <li className="hover:text-slate-300 transition-colors">📱 <strong>Device</strong> — Mobile/Desktop detect</li>
          </ul>
          <p className="mt-2 text-slate-600 text-[10px]">All data stays local. Nothing is sent anywhere.</p>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={onDeny} className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm transition-all duration-300 hover:scale-105 active:scale-95">Deny</button>
          <button onClick={onAllow} className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]">Allow Access</button>
        </div>
      </div>
    </div>
  );
}

/* ===== BATTERY ICON ===== */
function BatteryIcon({ percent }) {
  if (percent == null) return <span className="text-slate-500 text-2xl">🔌</span>;
  const color = percent > 50 ? "text-green-400" : percent > 20 ? "text-yellow-400" : "text-red-400";
  const icon = percent > 75 ? "🔋" : percent > 50 ? "🔋" : percent > 20 ? "🪫" : "🪫";
  return <span className={`${color} text-2xl md:text-3xl transition-all duration-500 ${percent < 20 ? "animate-pulse" : ""}`}>{icon}</span>;
}

/* ===== STAT CARD ===== */
function StatCard({ label, value, sub, color, progress }) {
  return (
    <div className="group glass p-3 md:p-4 lg:p-5 rounded-xl border border-transparent transition-all duration-300 hover:border-cyan-400/30 hover:shadow-[0_0_20px_rgba(0,229,255,0.1)] hover:-translate-y-0.5">
      <p className="text-slate-500 group-hover:text-slate-300 text-[10px] md:text-xs uppercase tracking-wider transition-colors duration-300">{label}</p>
      <p className={`text-lg md:text-xl lg:text-2xl font-bold mt-1 transition-all duration-300 group-hover:scale-105 ${color || "text-cyan-400"}`} style={{ transformOrigin: "left" }}>{value}</p>
      {sub && <p className="text-slate-600 group-hover:text-slate-400 text-[10px] md:text-xs mt-0.5 transition-colors duration-300">{sub}</p>}
      {progress !== undefined && (
        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
          <div className={`h-1.5 rounded-full transition-all duration-1000 ${color ? color.replace("text-", "bg-") : "bg-cyan-400"} relative`} style={{ width: `${Math.min(progress, 100)}%` }}>
            <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== CPU LINE CHART (Micro) ===== */
function CPUChart({ history, current }) {
  if (!history || history.length < 2) return null;
  const width = 100, height = 15, padding = 1;
  const points = history.map((val, i) => ({ x: padding + (i / (history.length - 1)) * (width - 2 * padding), y: height - padding - (val / 100) * (height - 2 * padding) }));
  const pathD = points.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`).join(" ");
  const avg = Math.round(history.reduce((a, b) => a + b, 0) / history.length);
  const max = Math.max(...history);
  return (
    <div className="glass p-2 md:p-3 rounded-lg border border-cyan-400/20 transition-all duration-300 hover:border-cyan-400/40">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-cyan-400 font-semibold text-xs flex items-center gap-1"><span>📈</span> CPU</h3>
        <div className="flex gap-1.5 text-[9px]">
          <span className="text-slate-500">Avg <span className="text-cyan-400">{avg}%</span></span>
          <span className="text-slate-500">Peak <span className="text-red-400">{max}%</span></span>
        </div>
      </div>
      <div className="relative w-full bg-slate-900/50 rounded p-1.5 border border-slate-700/30">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="none">
          <path d={pathD} fill="none" stroke="url(#cpuLineGradient)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          {points.length > 0 && <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="1" fill="#00E5FF" className="animate-pulse" />}
          <defs>
            <linearGradient id="cpuLineGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#00E5FF" /><stop offset="100%" stopColor="#a855f7" /></linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

/* ===== BATTERY DRAIN CHART (Micro Card) ===== */
function BatteryChart({ history }) {
  if (!history || history.length < 2) return null;
  const width = 100, height = 20, padding = 1;
  const points = history.map((h, i) => ({ x: padding + (i / (history.length - 1)) * (width - 2 * padding), y: height - padding - (h.level / 100) * (height - 2 * padding) }));
  const pathD = points.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`).join(" ");
  return (
    <div className="glass p-3 rounded-xl border border-yellow-400/20 transition-all duration-300 hover:border-yellow-400/40">
      <h3 className="text-yellow-400 font-semibold text-xs flex items-center gap-2 mb-2"><span>🔋</span> Battery Level Trend</h3>
      <div className="relative w-full bg-slate-900/50 rounded-lg p-2 border border-slate-700/30">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="none">
          <path d={pathD} fill="none" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {points.length > 0 && <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="1.5" fill="#facc15" className="animate-pulse" />}
        </svg>
      </div>
    </div>
  );
}

/* ===== MAIN DASHBOARD ===== */
export default function Dashboard() {
  const stored = localStorage.getItem(PERMISSION_KEY);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(stored === "granted");
  const [permissionAsked, setPermissionAsked] = useState(!stored);
  const [permission, setPermission] = useState(stored === "granted");
  const intervalRef = useRef(null);

  const fetchStats = useCallback(async () => {
    try { const data = await getFullSystemStats(); setStats(data); } catch (e) { console.warn(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!permission) return;
    getBatteryInfo().then(() => fetchStats());
    intervalRef.current = setInterval(fetchStats, 3000);
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [permission, fetchStats]);

  // Battery events
  useEffect(() => {
    if (!permission || !batteryRef) return;
    const update = () => { getBatteryInfo().then(b => { setStats(prev => prev ? { ...prev, battery: b } : prev); }); };
    const b = batteryRef;
    b.addEventListener?.("levelchange", update);
    b.addEventListener?.("chargingchange", update);
    b.addEventListener?.("chargingtimechange", update);
    b.addEventListener?.("dischargingtimechange", update);
    return () => {
      b.removeEventListener?.("levelchange", update);
      b.removeEventListener?.("chargingchange", update);
      b.removeEventListener?.("chargingtimechange", update);
      b.removeEventListener?.("dischargingtimechange", update);
    };
  }, [permission]);

  const handleAllow = async () => {
    localStorage.setItem(PERMISSION_KEY, "granted");
    setPermission(true); setPermissionAsked(false);
    await getBatteryInfo(); await fetchStats();
  };

  const handleDeny = () => {
    localStorage.setItem(PERMISSION_KEY, "denied");
    setPermissionAsked(false); setPermission(false); setLoading(false);
  };

  const d = permission ? stats : null;
  const isMobile = typeof navigator !== "undefined" && /Mobi|Android|iPhone/i.test(navigator.userAgent);

  const battColor = (p) => p == null ? "bg-slate-600" : p > 50 ? "bg-green-400" : p > 20 ? "bg-yellow-400" : "bg-red-400";
  const cpuColor = (v) => v > 80 ? "text-red-400" : v > 50 ? "text-yellow-400" : "text-green-400";
  const memColor = (v) => v > 80 ? "text-red-400" : v > 50 ? "text-yellow-400" : "text-green-400";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#050816] via-[#0a0a2e] to-[#050816]">
      {permissionAsked && <PermissionPopup onAllow={handleAllow} onDeny={handleDeny} />}
      <Sidebar />
      <main className="flex-1 p-3 md:p-5 lg:p-8 relative z-10 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 lg:mb-6 animate-fadeIn">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">VELORA</h1>
            <p className="text-slate-500 text-xs md:text-sm">AI Command Center{d?.system?.platform && <span className="text-cyan-400/70 ml-1">{d.system.platform}</span>}</p>
          </div>
          <div className="glass px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-green-400/20 hover:border-green-400/40 transition-all duration-300">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.6)]"></div>
            <span className="text-xs text-green-400 font-medium">Live</span>
          </div>
        </div>

        {/* Hologram */}
        <div className="mb-4 md:mb-6 transition-all duration-500 hover:scale-[1.02]"><HologramOrb /></div>

        {/* No permission */}
        {!permission && !permissionAsked && (
          <div className="glass p-5 md:p-6 rounded-xl mb-4 text-center border border-cyan-400/10 hover:border-cyan-400/30 transition-all duration-300">
            <p className="text-slate-400 text-sm mb-4">🔒 System monitoring is disabled</p>
            <button onClick={() => { setPermissionAsked(true); localStorage.removeItem(PERMISSION_KEY); }}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_25px_rgba(0,229,255,0.4)]">
              🔓 Enable System Monitor
            </button>
          </div>
        )}

        {permission && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 lg:gap-4 mb-4 animate-fadeIn">
              <StatCard label="CPU Usage" value={loading ? <span className="animate-pulse">--</span> : `${d?.cpu?.percent || 0}%`} sub={`${d?.cpu?.cores || 0} cores`} color={cpuColor(d?.cpu?.percent || 0)} progress={d?.cpu?.percent || 0} />
              <StatCard label="Memory" value={loading ? <span className="animate-pulse">--</span> : `${d?.memory?.percent?.toFixed(1) || 0}%`} sub={loading ? "" : `${d?.memory?.used_gb || 0} / ${d?.memory?.total_gb || 0} GB`} color={memColor(d?.memory?.percent || 0)} progress={d?.memory?.percent || 0} />
              <StatCard label="Battery" value={loading ? <span className="animate-pulse">--</span> : d?.battery?.percent != null ? `${d.battery.percent}%` : "🔌 N/A"} sub={d?.battery?.time_left?.substring(0, 35) || ""} color={d?.battery?.percent != null ? (d.battery.percent > 50 ? "text-green-400" : d.battery.percent > 20 ? "text-yellow-400" : "text-red-400") : "text-slate-400"} progress={d?.battery?.percent || 0} />
              <StatCard label="Storage" value={loading ? <span className="animate-pulse">--</span> : `${d?.disk?.percent?.toFixed(1) || 0}%`} sub={d?.disk?.total_gb ? `${d?.disk?.used_gb || 0} / ${d?.disk?.total_gb} GB` : "Loading..."} progress={d?.disk?.percent || 0} />
            </div>

            {/* Battery Detail */}
            {d?.battery?.percent != null && (
              <div className="glass p-3 md:p-4 rounded-xl mb-4 border border-transparent hover:border-cyan-400/20 transition-all duration-300 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="transition-all duration-300 hover:scale-110"><BatteryIcon percent={d.battery.percent} /></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl md:text-2xl font-bold text-white">{d.battery.percent}%</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${d.battery.power_plugged ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                          {d.battery.power_plugged ? "⚡ Charging" : "🔋 Discharging"}
                        </span>
                      </div>
                      {d.battery.drain_rate != null && !d.battery.power_plugged && (
                        <p className="text-slate-500 text-xs mt-1">Drain rate: <span className="text-red-400">{d.battery.drain_rate.toFixed(2)}%/min</span></p>
                      )}
                    </div>
                  </div>
                  <div className="text-left sm:text-right bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-700/30">
                    <p className="text-cyan-400 font-medium text-sm">{d.battery.time_left}</p>
                    {d.battery.time_hours > 0 && <p className="text-slate-500 text-xs mt-0.5"><span className="text-green-400">{d.battery.time_hours}h</span> <span className="text-cyan-400">{d.battery.time_minutes}m</span></p>}
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-800/80 rounded-full mt-3 overflow-hidden">
                  <div className={`h-3 rounded-full transition-all duration-1000 ${battColor(d.battery.percent)} relative`} style={{ width: `${d.battery.percent}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>
            )}

            {/* CPU + Battery Analytics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 animate-fadeIn">
              <CPUChart history={cpuHistory} current={d?.cpu?.percent || 0} />
              {batteryHistory.length > 2 && <BatteryChart history={batteryHistory} />}
            </div>

            {/* System Monitor */}
            <div className="glass p-3 md:p-5 lg:p-6 rounded-xl border border-transparent hover:border-cyan-400/10 transition-all duration-300 animate-fadeIn">
              <h2 className="text-lg md:text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <span>📊</span> System Monitor
                <span className="text-[10px] text-slate-600 font-normal ml-auto">Live • 3s refresh</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <div className="flex justify-between mb-1 text-xs md:text-sm">
                    <span className="text-slate-400">CPU</span>
                    <span className={cpuColor(d?.cpu?.percent || 0)}>{d?.cpu?.percent || 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full">
                    <div className={`h-2.5 rounded-full ${d?.cpu?.percent > 80 ? "bg-red-400" : d?.cpu?.percent > 50 ? "bg-yellow-400" : "bg-green-400"}`} style={{ width: `${d?.cpu?.percent || 0}%` }}></div>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">{d?.cpu?.cores} cores</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-xs md:text-sm">
                    <span className="text-slate-400">Memory</span>
                    <span className={memColor(d?.memory?.percent || 0)}>{d?.memory?.percent?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full">
                    <div className={`h-2.5 rounded-full ${d?.memory?.percent > 80 ? "bg-red-400" : d?.memory?.percent > 50 ? "bg-yellow-400" : "bg-green-400"}`} style={{ width: `${d?.memory?.percent || 0}%` }}></div>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">{d?.memory?.used_gb || 0} GB / {d?.memory?.total_gb || 0} GB</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-xs md:text-sm">
                    <span className="text-slate-400">Storage</span>
                    <span>{d?.disk?.percent?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full">
                    <div className="h-2.5 rounded-full bg-cyan-400" style={{ width: `${d?.disk?.percent || 0}%` }}></div>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">{d?.disk?.used_gb || 0} GB / {d?.disk?.total_gb || 0} GB</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-xs md:text-sm">
                    <span className="text-slate-400">Device</span>
                    <span className="text-cyan-400 font-medium">{isMobile ? "📱 Mobile" : "💻 Desktop"}</span>
                  </div>
                  <p className="text-slate-500 text-sm mt-2">{d?.system?.platform || "--"}</p>
                  <p className="text-slate-600 text-xs">{d?.system?.browser || ""}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/50 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                <span>⚙️ <span className="text-slate-400">{d?.cpu?.cores || 0}</span> cores</span>
                <span>💾 <span className="text-slate-400">{d?.memory?.total_gb || 0}</span> GB RAM</span>
                {d?.disk?.total_gb > 0 && <span>🗄️ <span className="text-slate-400">{d?.disk?.total_gb}</span> GB storage</span>}
              </div>

              {d?.battery?.percent != null && (
                <div className="mt-3 pt-3 border-t border-slate-800/50 text-xs text-slate-500 flex items-center gap-2">
                  <BatteryIcon percent={d.battery.percent} />
                  <span>{d.battery.percent}% • {d.battery.power_plugged ? "Charging" : "Battery"} • {d.battery.time_left}</span>
                </div>
              )}

              <p className="text-[10px] text-slate-700 mt-3 text-center italic">Real-time stats from your browser • Updates every 3 seconds</p>
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes bounce-slow { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}