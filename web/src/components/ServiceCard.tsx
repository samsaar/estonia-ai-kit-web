import { LucideIcon, CheckCircle, Clock } from 'lucide-react';

interface ServiceCardProps {
  name: string;
  description: string;
  status: 'active' | 'wip';
  type: string;
  icon: LucideIcon;
}

export default function ServiceCard({
  name,
  description,
  status,
  type,
  icon: Icon,
}: ServiceCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start">
          <div
            className={`p-3 rounded-lg mr-4 ${
              status === 'active' ? 'bg-green-600/20' : 'bg-orange-600/20'
            }`}
          >
            <Icon
              className={`w-6 h-6 ${status === 'active' ? 'text-green-400' : 'text-orange-400'}`}
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
            <span className="text-sm text-gray-400">{type}</span>
          </div>
        </div>
        <span
          className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            status === 'active'
              ? 'bg-green-900/30 text-green-400 border border-green-500/30'
              : 'bg-orange-900/30 text-orange-400 border border-orange-500/30'
          }`}
        >
          {status === 'active' ? (
            <CheckCircle className="w-3 h-3 mr-1" />
          ) : (
            <Clock className="w-3 h-3 mr-1" />
          )}
          {status === 'active' ? 'Active' : 'WIP'}
        </span>
      </div>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}
