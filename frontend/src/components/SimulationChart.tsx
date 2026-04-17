import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { useSandboxStore } from '../store';
import axios from 'axios';
import { PlayCircle, Loader2, Activity } from 'lucide-react';
import { DigitalTwinMap } from './DigitalTwinMap';

interface SimData {
  timeline: string[];
  baseline_curve: number[];
  simulated_curve: number[];
  cumulative_savings_curve: number[];
  metrics: {
    re_percent: number;
    energy_reduction_percent: number;
    total_baseline_kwh: number;
    total_simulated_kwh: number;
    total_savings_ntd: number;
    yoy_savings_percent: number;
    mom_savings_percent: number;
  };
  insights: {
    color: string;
    title: string;
    description: string;
  }[];
}

export const SimulationChart = () => {
  const { assets } = useSandboxStore();
  const [data, setData] = useState<SimData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runSimulation();
    // eslint-disable-next-line
  }, [assets]);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const activeAssets = assets.filter(a => a.active);
      const res = await axios.post('http://localhost:8001/simulate', {
        baseline_id: "demo-baseline",
        assets: activeAssets.map(a => ({
          id: a.id,
          type: a.type,
          capacity_kw: a.capacity_kw,
          capacity_kwh: a.capacity_kwh
        }))
      });
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = data?.timeline.map((time, i) => ({
    time,
    "Baseline kWh": data.baseline_curve[i],
    "Simulated kWh": Math.max(0, data.simulated_curve[i]),
    "Cumulative Savings (NTD)": data.cumulative_savings_curve[i],
  })) || [];

  return (
    <div className="flex-1 flex overflow-hidden">
      
      {/* ---------------- CENTER COLUMN ---------------- */}
      <div className="flex-1 flex flex-col p-8 relative z-10 overflow-hidden">
        
        {/* Header Block */}
        <div className="flex justify-between items-end mb-6 z-10 sticky top-0 bg-[#040a18]/80 backdrop-blur-md pb-4 pt-2 -mt-4 border-b border-[#00f0ff]/20 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-[#00f0ff] uppercase tracking-widest flex items-center gap-2 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
              <Activity className="w-6 h-6" /> enteliTwin: Digital Sandbox
            </h1>
            <p className="text-cyan-700/80 font-medium tracking-widest text-[10px] uppercase mt-1">AI Optimization Active — Real-time Simulation Engine</p>
          </div>
          
          <button 
            onClick={runSimulation}
            disabled={loading}
            className="flex items-center gap-2 bg-[#0c1a36] border border-[#00f0ff] text-[#00f0ff] px-6 py-2.5 rounded shadow-[0_0_10px_rgba(0,240,255,0.2)] hover:bg-[#00f0ff]/10 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all disabled:opacity-50 tracking-wider text-xs font-bold uppercase"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
            Execute Optimization
          </button>
        </div>

        {/* 3D MAP PLACEHOLDER */}
        <div className="flex-1 border border-cyan-800/60 rounded-xl relative overflow-hidden mb-6 flex items-center justify-center shadow-[inset_0_0_50px_rgba(0,180,255,0.05)] bg-[#030712]/80 group">
             <DigitalTwinMap />
        </div>

        {/* BOTTOM TIMELINE CHART */}
        {data ? (
          <div className="shrink-0 h-[220px] 2xl:h-[280px] glass-panel rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.05)] border border-cyan-800/50 p-4 relative overflow-hidden flex flex-col">
            <h3 className="font-medium text-[10px] text-cyan-400 mb-2 font-mono tracking-widest uppercase flex items-center justify-between">
              <span>Timeline Navigator (730 Days)</span>
            </h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.6} />
                  <XAxis 
                    dataKey="time" 
                    axisLine={{ stroke: '#1e293b' }} 
                    tickLine={false} 
                    tick={{fill: '#475569', fontSize: 10, fontFamily: 'monospace'}} 
                    dy={10} 
                    minTickGap={60} 
                  />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dx={-10} tickFormatter={(val) => `${val/1000}k`} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#10b981', fontSize: 10}} dx={10} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#040a18', borderRadius: '4px', border: '1px solid #00f0ff', boxShadow: '0 0 10px rgba(0,240,255,0.2)' }}
                    itemStyle={{fontWeight: 600, fontFamily: 'monospace', fontSize: '12px'}}
                    labelStyle={{color: '#94a3b8', marginBottom: '4px', fontSize: '10px'}}
                  />
                  
                  {/* Energy Data on Left Y-Axis */}
                  <Line yAxisId="left" type="monotone" dataKey="Baseline kWh" stroke="#334155" strokeWidth={2} strokeDasharray="4 4" dot={false} activeDot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="Simulated kWh" stroke="#00f0ff" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#00f0ff', stroke: '#fff', strokeWidth: 1 }} style={{ filter: 'drop-shadow(0px 0px 4px rgba(0,240,255,0.6))' }} />
                  
                  {/* Financial Data on Right Y-Axis */}
                  <Area yAxisId="right" type="monotone" dataKey="Cumulative Savings (NTD)" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#10b981', stroke: '#fff' }} style={{ filter: 'drop-shadow(0px 0px 4px rgba(16,185,129,0.4))' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="shrink-0 h-[220px] 2xl:h-[280px] rounded-lg border border-dashed border-cyan-800/50 flex flex-col items-center justify-center text-cyan-600/50 bg-[#0a1426]/30 backdrop-blur-sm">
             <span className="text-xs uppercase tracking-widest font-mono">Run Optimization to Load Timeline</span>
          </div>
        )}
      </div>

      {/* ---------------- RIGHT COLUMN: METRICS & INSIGHTS ---------------- */}
      <div className="w-[380px] 2xl:w-[420px] border-l border-[#00f0ff]/30 bg-[#070d19]/90 backdrop-blur-xl shrink-0 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
         <h2 className="text-sm font-bold tracking-widest flex items-center gap-2 neon-text uppercase shrink-0">
           Simulation Insights & Forecast
         </h2>

         {data ? (
           <>
              <div className="space-y-4 shrink-0">
                <MetricCard 
                    title="Projected Cost Reduction" 
                    value={`$${((data.metrics?.total_savings_ntd || 0) / 10000).toFixed(1)}w`} 
                    trend={(data.metrics?.yoy_savings_percent ?? 0) !== 0 ? `${(data.metrics?.yoy_savings_percent ?? 0) > 0 ? '+' : ''}${(data.metrics?.yoy_savings_percent ?? 0).toFixed(1)}% YoY` : undefined} 
                    trendColor={(data.metrics?.yoy_savings_percent ?? 0) >= 0 ? "emerald" : "rose"}
                />
                <MetricCard 
                    title="MoM Velocity" 
                    value={`${(data.metrics?.mom_savings_percent ?? 0) > 0 ? '+' : ''}${(data.metrics?.mom_savings_percent ?? 0).toFixed(1)}%`} 
                    trend="vs Last Month"
                    trendColor={(data.metrics?.mom_savings_percent ?? 0) >= 0 ? "emerald" : "rose"}
                />
                <MetricCard 
                    title="Projected RE Percentage" 
                    value={`${(data.metrics?.re_percent || 0).toFixed(1)}%`} 
                    trend="Green Pipeline"
                />
              </div>

              {/* Dynamic Insights Text Boxes */}
              <div className="flex-1 flex flex-col gap-3 min-h-0">
                 <h3 className="font-bold text-[11px] text-indigo-400 flex items-center gap-2 uppercase tracking-widest mt-2 border-b border-indigo-900/50 pb-2">
                   [ AI Strategic Assessment ]
                 </h3>
                 <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                    {data.insights.map((insight, idx) => (
                      <div key={idx} className="flex flex-col gap-1.5 p-3.5 bg-[#060b17] border border-slate-800 rounded relative group hover:border-[#00f0ff]/40 transition-colors">
                         <div className="flex items-center gap-2">
                             <span 
                                className="shrink-0 w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]" 
                                style={{ backgroundColor: insight.color, color: insight.color }}
                             ></span>
                             <span className="text-white text-[11px] font-bold uppercase tracking-wider">{insight.title}</span>
                         </div>
                         <p className="text-slate-400 text-[10px] leading-relaxed tracking-wide pl-3 border-l border-slate-800 group-hover:border-slate-600 transition-colors">
                            {insight.description}
                         </p>
                      </div>
                    ))}
                 </div>
              </div>
           </>
         ) : (
           <div className="flex-1 flex items-center justify-center text-cyan-600/30 text-[10px] font-mono tracking-widest uppercase text-center border border-dashed border-cyan-800/30 rounded-lg p-6">
              Awaiting Datastream...
           </div>
         )}
      </div>

    </div>
  );
};

const MetricCard = ({ title, value, trend, trendColor = "emerald" }: { title: string, value: string, trend?: string, trendColor?: "emerald" | "rose" }) => {
  const colorMap = {
    emerald: 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20',
    rose: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20',
  };
  
  return (
    <div className="glass-panel rounded-lg p-5 border border-cyan-800/40 relative overflow-hidden group hover:border-cyan-400/50 transition-colors shadow-lg">
      <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-400/5 blur-[30px] rounded-full group-hover:bg-cyan-400/10 transition-colors"></div>
      <h4 className="text-cyan-600 font-bold text-[10px] mb-2 tracking-widest uppercase font-mono">{title}</h4>
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <span className="text-2xl font-bold text-white tracking-widest font-mono drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">{value}</span>
        {trend && (
          <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border ${colorMap[trendColor]}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
