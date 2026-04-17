import { create } from 'zustand'

export type AssetType = 
  | 'solar' | 'hvac' | 'ess' | 'dr' | 'ev' 
  | 'ppa_solar' | 'ppa_onshore' | 'ppa_offshore' | 'ppa_hydro' | 'ppa_biomass' | 'ppa_geothermal';

export interface Asset {
  id: string
  type: AssetType
  title: string
  capacity_kw: number
  capacity_kwh?: number
  active: boolean
}

interface SandboxState {
  assets: Asset[]
  baselineDemand: number // Simple summary
  customBaselineData: number[] | null
  setCustomBaselineData: (data: number[] | null) => void
  addAsset: (asset: Omit<Asset, 'id'>) => void
  toggleAsset: (id: string) => void
  removeAsset: (id: string) => void
  updateAsset: (id: string, updates: Partial<Asset>) => void
}

export const useSandboxStore = create<SandboxState>((set) => ({
  assets: [],
  baselineDemand: 12000, // mock 12MWh daily
  customBaselineData: null,

  setCustomBaselineData: (data) => set({ customBaselineData: data }),

  addAsset: (asset) => set((state) => ({
    assets: [...state.assets, { ...asset, id: Math.random().toString(36).substring(7) }]
  })),
  
  toggleAsset: (id) => set((state) => ({
    assets: state.assets.map(a => 
      a.id === id ? { ...a, active: !a.active } : a
    )
  })),

  removeAsset: (id) => set((state) => ({
    assets: state.assets.filter(a => a.id !== id)
  })),

  updateAsset: (id, updates) => set((state) => ({
    assets: state.assets.map(a => 
      a.id === id ? { ...a, ...updates } : a
    )
  }))
}))
