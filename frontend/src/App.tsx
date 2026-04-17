import { AssetPanel } from './components/AssetPanel';
import { SimulationChart } from './components/SimulationChart';

function App() {
  return (
    <div className="flex h-screen w-full overflow-hidden font-sans antialiased">
      {/* Sidebar for VPP Configuration */}
      <AssetPanel />
      
      {/* Main Dashboard Area */}
      <SimulationChart />
    </div>
  );
}

export default App;
