import React, { useState } from 'react';
import { useSandboxStore, type AssetType } from '../store';
import { Flame, Droplets, Leaf, Activity } from 'lucide-react';

const CENTER_IMAGE = "/3d-assets/semiconductor_fab_1776389780509.png";

type AssetNodeDef = {
    angle: number;
    title: string;
    color: string;
    img?: string;
    icon?: React.ReactNode;
}

const ASSET_DEF: Record<string, AssetNodeDef> = {
  solar: { angle: -90, title: "自發自用太陽能板", img: "/3d-assets/solar_array_1776327392999.png", color: "#00f0ff" },
  hvac: { angle: -57, title: "空調主機", img: "/3d-assets/smart_ev_station_1776327482333.png", color: "#a855f7" },
  ess: { angle: -24, title: "儲能", img: "/3d-assets/ess_battery_1776327431408.png", color: "#00f0ff" },
  dr: { angle: 9, title: "需量反應網", icon: <Activity className="w-12 h-12 text-[#f59e0b] drop-shadow-[0_0_8px_rgba(245,158,11,1)]"/>, color: "#f59e0b" },
  ev: { angle: 42, title: "充電樁", img: "/3d-assets/smart_ev_station_1776327482333.png", color: "#a855f7" },
  ppa_solar: { angle: 75, title: "太陽能電力", img: "/3d-assets/solar_array_1776327392999.png", color: "#10b981" },
  ppa_onshore: { angle: 108, title: "陸域風電", img: "/3d-assets/wind_ppa_1776327416564.png", color: "#10b981" },
  ppa_offshore: { angle: 141, title: "離岸風電", img: "/3d-assets/wind_ppa_1776327416564.png", color: "#3b82f6" },
  ppa_hydro: { angle: 174, title: "水力發電", icon: <Droplets className="w-12 h-12 text-[#3b82f6] drop-shadow-[0_0_8px_rgba(59,130,246,1)]"/>, color: "#3b82f6" },
  ppa_biomass: { angle: 207, title: "生質能", icon: <Leaf className="w-12 h-12 text-[#10b981] drop-shadow-[0_0_8px_rgba(16,185,129,1)]"/>, color: "#10b981" },
  ppa_geothermal: { angle: 240, title: "地熱", icon: <Flame className="w-12 h-12 text-[#ef4444] drop-shadow-[0_0_8px_rgba(239,68,68,1)]"/>, color: "#ef4444" },
};

export const DigitalTwinMap = () => {
   const { assets } = useSandboxStore();
   const [zoom, setZoom] = useState(1);
   
   const activeAssetTypes = Array.from(new Set(assets.filter(a => a.active).map(a => a.type)));

   const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
      setZoom(prev => Math.min(Math.max(0.4, prev - e.deltaY * 0.002), 2.5));
   };

   // Calc radial position
   const getPos = (angle: number, radius = 35) => {
       const rad = angle * (Math.PI / 180);
       return {
           x: 50 + radius * Math.cos(rad),
           y: 50 + radius * Math.sin(rad)
       };
   };

   return (
       <div 
         className="absolute inset-0 w-full h-full overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent cursor-crosshair"
         onWheel={handleWheel}
       >
           {/* Decorative Grid Plane */}
           <div 
             className="absolute w-[300%] h-[300%] bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] pointer-events-none -left-[100%] -top-[100%]"
             style={{
                backgroundSize: '100px 100px',
                transform: `rotateX(60deg) rotateZ(0deg) translateY(0%) scale(${zoom})`,
                transformOrigin: 'center center',
             }}
           ></div>

           {/* Zoomable Inner Canvas */}
           <div 
              className="absolute inset-0 w-full h-full flex items-center justify-center transition-transform duration-75 origin-center pointer-events-none"
              style={{ transform: `scale(${zoom})` }}
           >
               <div className="relative w-full h-full max-w-[1400px] max-h-[1000px] flex items-center justify-center">
                   
                   {/* CONNECTING ENERGY SVG LINES */}
                   <svg className="absolute inset-0 w-full h-full -z-10 overflow-visible" style={{ filter: 'drop-shadow(0 0 10px rgba(0,240,255,0.8))' }}>
                       {activeAssetTypes.map((type) => {
                           const def = ASSET_DEF[type];
                           if (!def) return null;
                           const pos = getPos(def.angle, 35); // 35% distance
                           return (
                               <path 
                                   key={`line-${type}`}
                                   d={`M ${pos.x}%,${pos.y}% L 50%,50%`} 
                                   fill="none" 
                                   stroke={def.color} 
                                   strokeWidth="2.5" 
                                   className="animate-dash mix-blend-screen"
                               />
                           );
                       })}
                   </svg>

                   {/* CENTER SEMICONDUCTOR FAB */}
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 pointer-events-auto animate-float-slow">
                       <img 
                          src={CENTER_IMAGE} 
                          alt="Semiconductor Fab" 
                          className="w-[450px] h-[450px] object-contain drop-shadow-[0_0_40px_rgba(0,240,255,0.5)] transition-transform duration-1000 hover:scale-105"
                       />
                       <div className="mt-[-60px] text-center panel-3d px-6 py-2 rounded-full border border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.3)] relative z-20">
                           <span className="text-cyan-300 font-mono text-[14px] tracking-[0.4em] font-bold uppercase drop-shadow-[0_0_8px_rgba(0,240,255,1)] textShadow"> 半導體製程主廠 </span>
                       </div>
                   </div>

                   {/* 11 RADIAL DYNAMIC NODES */}
                   {Object.entries(ASSET_DEF).map(([key, def]) => {
                       const isActive = activeAssetTypes.includes(key);
                       const pos = getPos(def.angle, 35);
                       return (
                           <div 
                               key={key}
                               className={`absolute transition-all duration-1000 transform pointer-events-auto origin-center ${isActive ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none'}`}
                               style={{ top: `${pos.y}%`, left: `${pos.x}%`, transform: `translate(-50%, -50%) ${isActive ? 'scale(1)' : 'scale(0.5)'}` }}
                           >
                              <RadialNodeCard def={def} />
                           </div>
                       );
                   })}
                   
               </div>
           </div>
           
           <div className="absolute bottom-4 left-4 text-cyan-600/50 font-mono text-[10px] tracking-widest uppercase flex items-center gap-2 pointer-events-none">
              <span className="w-1 h-1 bg-cyan-600/50 animate-ping rounded-full"></span> Scroll To Zoom Framework ({(zoom * 100).toFixed(0)}%)
           </div>
       </div>
   );
};

const RadialNodeCard = ({ def }: { def: AssetNodeDef }) => (
    <div className="flex flex-col items-center group cursor-pointer animate-float perspective-1000">
        <div className="relative overflow-visible flex items-center justify-center filter group-hover:drop-shadow-[0_0_35px_rgba(255,255,255,0.6)] transition-all duration-500 transform group-hover:-translate-y-2 group-hover:rotateX-12">
            {def.img ? (
                <img src={def.img} alt={def.title} className="w-40 h-40 object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)]" />
            ) : (
                <div className="w-32 h-32 rounded-xl panel-3d flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl group-hover:scale-110 transition-transform duration-500 shadow-[0_20px_20px_rgba(0,0,0,0.8)]" style={{ borderColor: def.color, boxShadow: `inset 0 0 20px ${def.color}40, 10px 10px 30px rgba(0,0,0,0.8)` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(255,255,255,0.1)] to-transparent pointer-events-none"></div>
                    {def.icon}
                </div>
            )}
        </div>
        
        {/* Holographic Projection Base */}
        <div 
           className="w-20 h-2 mt-[-10px] rounded-[50%] z-0 relative transition-all duration-500 group-hover:scale-110 group-hover:w-24 group-hover:blur-md"
           style={{ backgroundColor: def.color, filter: `blur(8px)`, opacity: 0.8 }}
        ></div>

        <div className="mt-4 text-center panel-3d px-3 py-1.5 rounded-md z-10 relative transform group-hover:-translate-y-1 transition-all duration-300">
            <h4 className="text-[12px] font-bold tracking-widest font-mono shadow-sm" style={{ color: def.color }}>{def.title}</h4>
        </div>
    </div>
);
