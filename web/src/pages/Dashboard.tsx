import { Server, Terminal, Database, TrendingUp, Users, Globe } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import ServiceCard from '../components/ServiceCard';

export default function Dashboard() {
  const stats = [
    { label: 'MCP Servers', value: '2', icon: Server, color: 'blue' as const },
    { label: 'CLI Tools', value: '2', icon: Terminal, color: 'green' as const },
    { label: 'Active Services', value: '4', icon: Database, color: 'purple' as const },
    { label: 'API Endpoints', value: '15+', icon: TrendingUp, color: 'orange' as const },
  ];

  const services = [
    {
      name: 'Business Register (RIK)',
      description: 'Access Estonian business registry data',
      status: 'wip' as const,
      type: 'MCP Server',
      icon: Database,
    },
    {
      name: 'Open Data Portal',
      description: 'Statistics Estonia and open government data',
      status: 'wip' as const,
      type: 'MCP Server',
      icon: Globe,
    },
    {
      name: 'EMTA Tax & Customs',
      description: 'TSD declarations and tax data',
      status: 'active' as const,
      type: 'CLI Tool',
      icon: Terminal,
    },
    {
      name: 'LHV Bank',
      description: 'Banking, transactions, and payments',
      status: 'active' as const,
      type: 'CLI Tool',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">🇪🇪 The Digital Nation's AI Toolkit</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Build AI-powered applications with Estonia's world-leading digital infrastructure
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
        <h2 className="text-2xl font-bold text-white mb-4">🌍 The Estonian Digital Revolution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-300">
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-400">3 min</div>
            <div className="text-sm">to file taxes online</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-400">2% GDP</div>
            <div className="text-sm">saved annually through digital governance</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-400">120k+</div>
            <div className="text-sm">e-Residents from 170+ countries</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-orange-400">99.9%</div>
            <div className="text-sm">of banking transactions online</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-cyan-400">900M+</div>
            <div className="text-sm">X-Road transactions yearly</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-pink-400">99%</div>
            <div className="text-sm">of government services online</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Available Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.name} {...service} />
          ))}
        </div>
      </div>
    </div>
  );
}
