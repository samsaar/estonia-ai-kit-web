import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MCPServers from './pages/MCPServers';
import CLITools from './pages/CLITools';
import LiveData from './pages/LiveData';
import EMTAService from './pages/EMTAService';
import LHVService from './pages/LHVService';
import CourtDecisions from './pages/CourtDecisions';
import Documentation from './pages/Documentation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="live-data" element={<LiveData />} />
          <Route path="court-decisions" element={<CourtDecisions />} />
          <Route path="emta" element={<EMTAService />} />
          <Route path="lhv" element={<LHVService />} />
          <Route path="mcp-servers" element={<MCPServers />} />
          <Route path="cli-tools" element={<CLITools />} />
          <Route path="documentation" element={<Documentation />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
