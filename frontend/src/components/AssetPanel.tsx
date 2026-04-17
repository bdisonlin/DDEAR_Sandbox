import React, { useState, useRef } from 'react';
import { useSandboxStore, type AssetType } from '../store';
import { Plus, Trash2, Zap, Battery, Sun, Power, FileUp, Leaf, Car, Droplets, Flame, Wind } from 'lucide-react';

const ONSITE_ASSETS: { type: AssetType; label: string; icon: React.ReactNode }[] = [
  { type: 'solar', label: '自發自用太陽能', icon: <Sun className="w-5 h-5 text-[#00f0ff]" /> },
  { type: 'hvac', label: '空調主機', icon: <Power className="w-5 h-5 text-[#00f0ff]" /> },
  { type: 'ess', label: '儲能', icon: <Battery className="w-5 h-5 text-[#00f0ff]" /> },
  { type: 'dr', label: '台電需量反應', icon: <Zap className="w-5 h-5 text-[#00f0ff]" /> },
  { type: 'ev', label: '充電樁', icon: <Car className="w-5 h-5 text-[#00f0ff]" /> },
];

const PPA_ASSETS: { type: AssetType; label: string; icon: React.ReactNode }[] = [
  { type: 'ppa_solar', label: '太陽能電力', icon: <Sun className="w-5 h-5 text-[#10b981]" /> },
  { type: 'ppa_onshore', label: '陸域風電力', icon: <Wind className="w-5 h-5 text-[#10b981]" /> },
  { type: 'ppa_offshore', label: '離岸風電力', icon: <Wind className="w-5 h-5 text-[#3b82f6]" /> },
  { type: 'ppa_hydro', label: '水力發電', icon: <Droplets className="w-5 h-5 text-[#3b82f6]" /> },
  { type: 'ppa_biomass', label: '生質能', icon: <Leaf className="w-5 h-5 text-[#facc15]" /> },
  { type: 'ppa_geothermal', label: '地熱', icon: <Flame className="w-5 h-5 text-[#ef4444]" /> },
];

const ALL_ASSETS = [...ONSITE_ASSETS, ...PPA_ASSETS];

export const AssetPanel = () => {
  const { assets, addAsset, removeAsset, toggleAsset, setCustomBaselineData, customBaselineData } = useSandboxStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState<AssetType>('solar');
  const [newCapacityKw, setNewCapacityKw] = useState(100);
  const [newCapacityKwh, setNewCapacityKwh] = useState(200);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const assetDef = ALL_ASSETS.find(t => t.type === newType);
    addAsset({
      title: `${newCapacityKw}kW ${assetDef?.label}`,
      type: newType,
      capacity_kw: newCapacityKw,
      capacity_kwh: newType === 'ess' ? newCapacityKwh : undefined,
      active: true,
    });
    setShowAdd(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rawLines = text.split('\n').map(l => l.trim()).filter(l => l !== '');
      const parsedValues = rawLines.map(v => parseFloat(v));
      
      const validValues = parsedValues.filter(v => !isNaN(v));
      if (validValues.length >= 96) {
        setCustomBaselineData(validValues.slice(0, 96));
        alert("System Interlocked: Baseline Overridden.");
      } else {
        alert("Error: Baseline data corruption or insufficient rows.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const existingOnsites = assets.filter(a => ONSITE_ASSETS.some(oa => oa.type === a.type));
  const existingPPAs = assets.filter(a => PPA_ASSETS.some(pa => pa.type === a.type));

  const AssetCard = ({ asset }: { asset: any }) => {
     const assetDef = ALL_ASSETS.find(t => t.type === asset.type);
     return (
        <div className={`p-4 rounded-lg transition-all duration-300 transform perspective-1000 ${
        asset.active 
            ? 'panel-3d' 
            : 'bg-[#060b17] border border-slate-800 opacity-60 hover:opacity-100 hover:-translate-y-1 hover:shadow-lg'
        }`}>
        <div className="flex justify-between items-center group">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${asset.active ? 'bg-[#040f24] shadow-[inset_0_0_8px_rgba(0,240,255,0.2)]' : 'bg-[#0f172a]'}`}>
                {assetDef?.icon}
                </div>
            <div>
                <h3 className={`text-xs font-semibold tracking-wide ${asset.active ? 'text-white' : 'text-slate-500'}`}>{asset.title}</h3>
                <div className="flex items-center gap-1 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${asset.active ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`}></span>
                    <span className={`text-[9px] tracking-wider uppercase ${asset.active ? 'text-cyan-300' : 'text-slate-500'}`}>
                        {asset.active ? 'Ready for Simulation' : 'Offline'}
                    </span>
                </div>
            </div>
            </div>
            <div className="flex space-x-3 items-center">
            <input 
                type="checkbox" 
                checked={asset.active} 
                onChange={() => toggleAsset(asset.id)} 
                className="w-4 h-4 accent-cyan-500 cursor-pointer btn-press" 
            />
            <button onClick={() => removeAsset(asset.id)} className="text-slate-500 hover:text-rose-500 transition-colors btn-press">
                <Trash2 className="w-4 h-4" />
            </button>
            </div>
        </div>
        </div>
     );
  }

  return (
    <div className="flex flex-col h-full bg-[#070d19]/90 backdrop-blur-xl border-r border-[#00f0ff]/30 w-84 min-w-[340px] shadow-[5px_0_20px_rgba(0,240,255,0.05)] z-20">
      <div className="p-6 border-b border-[#00f0ff]/30 space-y-4 shrink-0">
        <div>
          <h2 className="text-sm font-bold tracking-widest flex items-center gap-2 neon-text uppercase">
            Dynamic Asset Library
          </h2>
          <p className="text-[#8b9bb4] text-[10px] mt-1 uppercase tracking-wide">Select Assets for AI Simulation Engine</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        
        {/* Category A: On-Site Assets */}
        <div className="space-y-3">
           <h3 className="text-xs text-slate-400 border-b border-slate-800 pb-1 uppercase tracking-widest font-mono">企業佈建資產 (On-Site Operations)</h3>
           {existingOnsites.length > 0 ? (
               existingOnsites.map((asset) => <AssetCard key={asset.id} asset={asset} />)
           ) : (
               <p className="text-[10px] text-slate-600 italic">No on-site assets configured.</p>
           )}
        </div>

        {/* Category B: Purchased Green Power */}
        <div className="space-y-3">
           <h3 className="text-xs text-emerald-600 border-b border-emerald-900/50 pb-1 uppercase tracking-widest font-mono">企業外購綠能 (Purchased Green Power)</h3>
           {existingPPAs.length > 0 ? (
               existingPPAs.map((asset) => <AssetCard key={asset.id} asset={asset} />)
           ) : (
               <p className="text-[10px] text-slate-600 italic">No external PPA assets configured.</p>
           )}
        </div>

        {/* Add Asset Form */}
        {showAdd && (
          <div className="p-4 rounded-lg glass-panel border border-cyan-800/80 space-y-4 mt-8 shadow-[0_0_15px_rgba(0,180,255,0.1)]">
             <div className="flex flex-col gap-1.5">
               <label className="text-[10px] text-cyan-400 uppercase tracking-widest">Asset Class</label>
               <select 
                value={newType} 
                onChange={(e) => setNewType(e.target.value as AssetType)}
                className="w-full bg-[#060b17] p-2 rounded border border-slate-700 text-xs text-white focus:border-cyan-500 focus:outline-none"
               >
                  <optgroup label="企業佈建資產">
                      {ONSITE_ASSETS.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
                  </optgroup>
                  <optgroup label="企業外購綠能">
                      {PPA_ASSETS.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
                  </optgroup>
               </select>
             </div>
             
             <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-cyan-400 uppercase tracking-widest">Target Capacity (kW)</label>
                <input type="number" value={newCapacityKw} onChange={(e) => setNewCapacityKw(Number(e.target.value))} className="w-full p-2 bg-[#060b17] text-white rounded border border-slate-700 text-xs focus:border-cyan-500 outline-none"/>
             </div>
             
             {newType === 'ess' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-cyan-400 uppercase tracking-widest">Storage Pool (kWh)</label>
                  <input type="number" value={newCapacityKwh} onChange={(e) => setNewCapacityKwh(Number(e.target.value))} className="w-full p-2 bg-[#060b17] text-white rounded border border-slate-700 text-xs focus:border-cyan-500 outline-none"/>
               </div>
             )}
             
             <div className="flex gap-2 pt-2">
               <button onClick={handleAdd} className="flex-1 bg-cyan-950/50 border border-cyan-500 text-cyan-400 rounded py-2 text-[11px] uppercase tracking-wider font-bold hover:bg-cyan-900 transition-colors">Deploy</button>
               <button onClick={() => setShowAdd(false)} className="flex-1 bg-slate-900 text-slate-400 rounded py-2 text-[11px] uppercase tracking-wider font-bold hover:bg-slate-800 transition-colors">Abort</button>
             </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-[#00f0ff]/30 bg-[#080d1a] shrink-0">
        <button onClick={() => setShowAdd(true)} className="w-full flex items-center justify-center gap-2 bg-[#0c1a36] border border-cyan-800 text-cyan-400 shadow-[0_0_10px_rgba(0,180,255,0.1)] rounded p-3 hover:border-cyan-400 hover:text-cyan-200 transition-colors uppercase tracking-widest text-[11px] font-bold btn-press">
          <Plus className="w-4 h-4" /> Provision Asset
        </button>
      </div>
    </div>
  );
};
