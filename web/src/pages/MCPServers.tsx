import { Database, Globe, Code, CheckCircle, Clock } from 'lucide-react';

export default function MCPServers() {
  const servers = [
    {
      name: 'Estonian Business Register (RIK)',
      package: '@estonia-ai-kit/rik-mcp-server',
      description:
        'Access comprehensive business registry data including company information, board members, and financial reports.',
      status: 'wip',
      icon: Database,
      features: [
        'Company search and details',
        'Board member information',
        'Financial reports',
        'Historical data access',
      ],
      setup: `{
  "mcpServers": {
    "estonia-rik": {
      "command": "node",
      "args": ["/path/to/estonia-ai-kit/mcp/rik/dist/index.js"]
    }
  }
}`,
    },
    {
      name: 'Statistics Estonia / Open Data Portal',
      package: '@estonia-ai-kit/open-data-mcp-server',
      description: 'Access official statistics and open government data from Statistics Estonia.',
      status: 'wip',
      icon: Globe,
      features: [
        'Population statistics',
        'Economic indicators',
        'Environmental data',
        'Social statistics',
      ],
      setup: `{
  "mcpServers": {
    "estonia-open-data": {
      "command": "node",
      "args": ["/path/to/estonia-ai-kit/mcp/open-data/dist/index.js"]
    }
  }
}`,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">MCP Servers</h1>
        <p className="text-gray-300 text-lg">
          Model Context Protocol servers for seamless AI integration with Estonian government
          services
        </p>
      </div>

      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-300 mb-2 flex items-center">
          <Code className="w-5 h-5 mr-2" />
          What is MCP?
        </h3>
        <p className="text-gray-300">
          Model Context Protocol (MCP) is an open protocol that standardizes how AI applications
          connect with external data sources and tools. Estonia AI Kit implements MCP servers for
          various Estonian services, making them accessible to AI models like Claude, GPT, and
          others.
        </p>
      </div>

      <div className="space-y-6">
        {servers.map((server) => {
          const Icon = server.icon;
          return (
            <div
              key={server.name}
              className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start">
                  <div className="bg-blue-600/20 p-3 rounded-lg mr-4">
                    <Icon className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{server.name}</h3>
                    <code className="text-sm text-gray-400">{server.package}</code>
                  </div>
                </div>
                <span
                  className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    server.status === 'active'
                      ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                      : 'bg-orange-900/30 text-orange-400 border border-orange-500/30'
                  }`}
                >
                  {server.status === 'active' ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <Clock className="w-4 h-4 mr-1" />
                  )}
                  {server.status === 'active' ? 'Active' : 'Work in Progress'}
                </span>
              </div>

              <p className="text-gray-300 mb-4">{server.description}</p>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Features:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {server.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-300">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">
                  Claude Desktop Configuration:
                </h4>
                <pre className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-gray-300">{server.setup}</code>
                </pre>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Installation</h3>
        <div className="space-y-4">
          <div>
            <p className="text-gray-300 mb-2">1. Install dependencies:</p>
            <pre className="bg-slate-900 rounded-lg p-4">
              <code className="text-sm text-green-400">bun install</code>
            </pre>
          </div>
          <div>
            <p className="text-gray-300 mb-2">2. Build all packages:</p>
            <pre className="bg-slate-900 rounded-lg p-4">
              <code className="text-sm text-green-400">bun run build</code>
            </pre>
          </div>
          <div>
            <p className="text-gray-300 mb-2">
              3. Add the configuration to your Claude Desktop config file:
            </p>
            <code className="text-sm text-gray-400">
              ~/Library/Application Support/Claude/claude_desktop_config.json
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
