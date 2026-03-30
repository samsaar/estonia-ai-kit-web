import { BookOpen, ExternalLink, Code, Github, Globe } from 'lucide-react'

export default function Documentation() {
  const resources = [
    {
      title: 'e-Business Register',
      url: 'https://ariregister.rik.ee/eng',
      description: 'Official business registry portal',
      icon: Globe,
    },
    {
      title: 'EMTA (Tax & Customs)',
      url: 'https://www.emta.ee/en',
      description: 'Estonian Tax and Customs Board',
      icon: Globe,
    },
    {
      title: 'Open Data Portal',
      url: 'https://andmed.eesti.ee/',
      description: 'Estonian government open data',
      icon: Globe,
    },
    {
      title: 'X-Road',
      url: 'https://x-tee.ee/en/',
      description: 'Estonian data exchange platform',
      icon: Globe,
    },
    {
      title: 'e-Estonia',
      url: 'https://e-estonia.com/',
      description: 'Digital society overview',
      icon: Globe,
    },
    {
      title: 'RIK Developer Portal',
      url: 'https://avaandmed.ariregister.rik.ee/en',
      description: 'Business registry API documentation',
      icon: Code,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">Documentation</h1>
        <p className="text-gray-300 text-lg">
          Resources and guides for working with Estonia AI Kit
        </p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <BookOpen className="w-6 h-6 mr-2" />
          Getting Started
        </h2>
        <div className="space-y-4 text-gray-300">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Prerequisites</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Node.js 20+ and Bun 1.0+ — for MCP servers and TypeScript packages</li>
              <li>Go 1.21+ — for CLI tools</li>
              <li>Smart-ID or ID-card — for authenticated services</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Installation</h3>
            <pre className="bg-slate-900 rounded-lg p-4 overflow-x-auto mb-2">
              <code className="text-sm text-green-400">
                git clone https://github.com/stefanoamorelli/estonia-ai-kit.git{'\n'}
                cd estonia-ai-kit{'\n'}
                {'\n'}
                # TypeScript packages{'\n'}
                bun install{'\n'}
                bun run build{'\n'}
                {'\n'}
                # Go CLI tools{'\n'}
                cd cli/emta && go build -o emta-cli .{'\n'}
                cd cli/lhv && make install
              </code>
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Project Structure</h3>
            <pre className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <code className="text-sm text-gray-300">
                estonia-ai-kit/{'\n'}
                ├── cli/                       # CLI tools / skills (authenticated services){'\n'}
                │   ├── emta/                  # EMTA Tax & Customs CLI (Go){'\n'}
                │   └── lhv/                   # LHV Bank CLI (Go){'\n'}
                ├── mcp/                       # MCP servers{'\n'}
                │   ├── rik/                   # Business Register{'\n'}
                │   └── open-data/             # Statistics Estonia{'\n'}
                ├── plugins/                   # Claude Code plugin marketplace{'\n'}
                │   ├── emta/                  # EMTA plugin + skill{'\n'}
                │   └── lhv/                   # LHV plugin + skill{'\n'}
                ├── packages/                  # Shared TypeScript libraries{'\n'}
                │   ├── shared/                # Common utilities{'\n'}
                │   └── riigiteataja-api-client/{'\n'}
                ├── rag/                       # RAG pipelines{'\n'}
                │   └── riigiteataja/          # Legal documents{'\n'}
                └── tests/                     # E2E tests
              </code>
            </pre>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Globe className="w-6 h-6 mr-2" />
          Estonian Government Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource) => {
            const Icon = resource.icon
            return (
              <a
                key={resource.title}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors group"
              >
                <div className="bg-blue-600/20 p-2 rounded-lg mr-3">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors flex items-center">
                    {resource.title}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </h3>
                  <p className="text-sm text-gray-400">{resource.description}</p>
                </div>
              </a>
            )
          })}
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Github className="w-6 h-6 mr-2" />
          Contributing
        </h2>
        <p className="text-gray-300 mb-4">
          PRs and issues are welcome! Follow the standard GitHub workflow:
        </p>
        <div className="flex items-center space-x-2 text-gray-300">
          <span className="bg-slate-700/50 px-3 py-1 rounded">Fork</span>
          <span>→</span>
          <span className="bg-slate-700/50 px-3 py-1 rounded">Branch</span>
          <span>→</span>
          <span className="bg-slate-700/50 px-3 py-1 rounded">Commit</span>
          <span>→</span>
          <span className="bg-slate-700/50 px-3 py-1 rounded">Push</span>
          <span>→</span>
          <span className="bg-slate-700/50 px-3 py-1 rounded">PR</span>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
        <h2 className="text-2xl font-bold text-white mb-4">License</h2>
        <p className="text-gray-300 mb-4">
          This open-source project is licensed under the <strong>GNU Affero General Public License v3.0 (AGPL-3.0)</strong>.
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
          <li>✅ You can use, modify, and distribute this software</li>
          <li>✅ If you modify and distribute it, you must release your changes under AGPL-3.0</li>
          <li>✅ If you run a modified version on a server, you must provide the source code to users</li>
        </ul>
        <p className="text-gray-400 mt-4 text-sm">
          For commercial licensing options or other licensing inquiries, please contact{' '}
          <a href="mailto:stefano@amorelli.tech" className="text-blue-400 hover:underline">
            stefano@amorelli.tech
          </a>
        </p>
      </div>
    </div>
  )
}
