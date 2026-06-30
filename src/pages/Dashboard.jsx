import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import HologramOrb from "../components/HologramOrb";
import { fetchSystemStats } from "../services/gemini";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSystemStats();
        if (data && data.status === "success") setStats(data);
      } catch (err) {
        console.warn("System stats unavailable:", err?.message || err);
      }
      setLoading(false);
    };
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, []);

  const color = (v) => v < 50 ? "bg-green-400" : v < 80 ? "bg-yellow-400" : "bg-red-400";
  const bColor = (v) => v === null ? "text-slate-400" : v > 50 ? "text-green-400" : v > 20 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cyan-400">VELORA</h1>
            <p className="text-slate-400 text-sm md:text-base">AI Command Center</p>
          </div>
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Online</span>
          </div>
        </div>
        <div className="mb-8"><HologramOrb /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6 mt-6">
          <div className="glass p-4 md:p-6 lg:p-8 rounded-2xl">
            <p className="text-slate-400 text-xs md:text-sm">CPU Usage</p>
            <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 mt-2">{loading ? "--" : `${stats?.cpu?.percent?.toFixed(1) || 0}%`}</h2>
            <p className="text-slate-400 text-xs mt-2">{stats?.cpu?.cores || "--"} cores</p>
          </div>
          <div className="glass p-4 md:p-6 rounded-2xl">
            <p className="text-slate-400 text-xs md:text-sm">Memory Usage</p>
            <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 mt-2">{loading ? "--" : `${stats?.memory?.percent?.toFixed(1) || 0}%`}</h2>
            <p className="text-slate-400 text-xs mt-2">{loading ? "--" : `${stats?.memory?.used_gb || 0} / ${stats?.memory?.total_gb || 0} GB`}</p>
          </div>
          <div className="glass p-4 md:p-6 rounded-2xl lg:col-span-2">
            <p className="text-slate-400 text-xs md:text-sm">Battery</p>
            <h2 className={`text-xl md:text-2xl font-bold mt-2 ${bColor(stats?.battery?.percent)}`}>{loading ? "--" : stats?.battery?.percent != null ? `${stats.battery.percent}%` : "No Battery"}</h2>
            {stats?.battery?.time_left && stats.battery.time_left !== "No Battery" && <p className="text-slate-400 text-xs mt-2">{stats.battery.power_plugged ? "Charging" : `${stats.battery.time_left} left`}</p>}
          </div>
        </div>
        <div className="glass p-4 md:p-6 lg:p-8 xl:p-10 rounded-2xl mt-6 md:mt-8 lg:mt-10">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-cyan-400 mb-4">System Monitor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between mb-2 text-sm"><span>CPU</span><span>{loading ? "--" : `${stats?.cpu?.percent?.toFixed(1) || 0}%`}</span></div>
              <div className="w-full h-3 bg-slate-800 rounded-full"><div className={`h-3 rounded-full ${color(stats?.cpu?.percent || 0)}`} style={{ width: `${stats?.cpu?.percent || 0}%` }}></div></div>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm"><span>Memory</span><span>{loading ? "--" : `${stats?.memory?.percent?.toFixed(1) || 0}%`}</span></div>
              <div className="w-full h-3 bg-slate-800 rounded-full"><div className={`h-3 rounded-full ${color(stats?.memory?.percent || 0)}`} style={{ width: `${stats?.memory?.percent || 0}%` }}></div></div>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm"><span>Disk</span><span>{loading ? "--" : `${stats?.disk?.percent?.toFixed(1) || 0}%`}</span></div>
              <div className="w-full h-3 bg-slate-800 rounded-full"><div className="h-3 rounded-full bg-cyan-400" style={{ width: `${stats?.disk?.percent || 0}%` }}></div></div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-slate-400">Processor:</span><div className="text-white">{stats?.cpu?.cores || "--"} cores</div></div>
            <div><span className="text-slate-400">Frequency:</span><div className="text-white">{stats?.cpu?.frequency || "--"}</div></div>
            <div><span className="text-slate-400">Total RAM:</span><div className="text-white">{loading ? "--" : `${(stats?.memory?.total_gb || 0).toFixed(1)} GB`}</div></div>
            <div><span className="text-slate-400">Used RAM:</span><div className="text-white">{loading ? "--" : `${(stats?.memory?.used_gb || 0).toFixed(1)} GB`}</div></div>
          </div>
        </div>
      </main>
    </div>
  );
}
