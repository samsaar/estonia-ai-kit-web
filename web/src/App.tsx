import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import MCPServers from './pages/MCPServers'
import CLITools from './pages/CLITools'
import Documentation from './pages/Documentation'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mcp-servers" element={<MCPServers />} />
          <Route path="/cli-tools" element={<CLITools />} />
          <Route path="/documentation" element={<Documentation />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
