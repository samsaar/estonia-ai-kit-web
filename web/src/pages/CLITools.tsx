import { Terminal, Shield, CreditCard, FileText, CheckCircle } from 'lucide-react'

export default function CLITools() {
  const tools = [
    {
      name: 'EMTA Tax & Customs',
      command: 'emta-cli',
      description: 'Access your tax declarations and customs data through the Estonian Tax and Customs Board.',
      status: 'active',
      icon: FileText,
      auth: 'Smart-ID',
      features: [
        'Login via Smart-ID QR code',
        'List TSD declarations',
        'View declaration details',
        'Export data in JSON format',
      ],
      installation: 'go install github.com/stefanoamorelli/estonia-ai-kit/cli/emta@latest',
      usage: [
        'emta-cli login                     # Login via Smart-ID QR code',
        'emta-cli tsd list                  # List your TSD declarations',
        'emta-cli tsd show <declaration-id> # Show declaration details',
      ],
    },
    {
      name: 'LHV Bank',
      command: 'lhv',
      description: 'Manage your LHV bank accounts, view transactions, and make SEPA payments.',
      status: 'active',
      icon: CreditCard,
      auth: 'Smart-ID',
      features: [
        'Authenticate via Smart-ID',
        'List bank accounts',
        'View transaction history',
        'Make SEPA payments',
        'Export account data',
      ],
      installation: 'go install github.com/stefanoamorelli/estonia-ai-kit/cli/lhv@latest',
      usage: [
        'lhv auth --interactive             # Authenticate via Smart-ID',
        'lhv get-accounts                   # List accounts',
        'lhv get-transactions               # View transactions',
        'lhv pay --help                     # SEPA payment options',
      ],
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">CLI Tools</h1>
        <p className="text-gray-300 text-lg">
          Command-line tools for authenticated access to Estonian government and private sector services
        </p>
      </div>

      <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-orange-300 mb-2 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Authentication & Security
        </h3>
        <p className="text-gray-300">
          CLI tools that require authentication (Smart-ID, ID-card) authenticate as <strong>you</strong> and 
          access <strong>your</strong> data. Sessions expire after approximately 30 minutes for security.
        </p>
      </div>

      <div className="space-y-6">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <div
              key={tool.name}
              className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start">
                  <div className="bg-green-600/20 p-3 rounded-lg mr-4">
                    <Icon className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{tool.name}</h3>
                    <code className="text-sm text-gray-400">{tool.command}</code>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/30 text-green-400 border border-green-500/30">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Active
                  </span>
                  <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900/30 text-blue-400 border border-blue-500/30">
                    <Shield className="w-4 h-4 mr-1" />
                    {tool.auth}
                  </span>
                </div>
              </div>

              <p className="text-gray-300 mb-4">{tool.description}</p>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Features:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tool.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-300">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Installation:</h4>
                <pre className="bg-slate-900 rounded-lg p-4">
                  <code className="text-sm text-green-400">{tool.installation}</code>
                </pre>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Usage:</h4>
                <pre className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-gray-300">
                    {tool.usage.join('\n')}
                  </code>
                </pre>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Claude Code Plugins</h3>
        <p className="text-gray-300 mb-4">
          Use these CLI tools directly in Claude Code with pre-configured skills:
        </p>
        <div className="space-y-4">
          <div>
            <p className="text-gray-300 mb-2">1. Add the marketplace (one-time setup):</p>
            <pre className="bg-slate-900 rounded-lg p-4">
              <code className="text-sm text-green-400">/plugin marketplace add stefanoamorelli/estonia-ai-kit</code>
            </pre>
          </div>
          <div>
            <p className="text-gray-300 mb-2">2. Install a plugin:</p>
            <pre className="bg-slate-900 rounded-lg p-4">
              <code className="text-sm text-gray-300">
                /plugin install lhv@estonia-ai-kit{'\n'}
                /plugin install emta@estonia-ai-kit
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
