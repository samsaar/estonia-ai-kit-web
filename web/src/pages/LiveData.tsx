import { useState } from 'react';
import { Search, Building2, TrendingUp, Database, Loader2 } from 'lucide-react';

interface CompanyResult {
  name: string;
  registry_code: string;
  status: string;
  address?: string;
}

interface StatisticsData {
  indicator: string;
  value: number;
  year: number;
  source: string;
}

export default function LiveData() {
  const [searchQuery, setSearchQuery] = useState('');
  const [companyResults, setCompanyResults] = useState<CompanyResult[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchCompanies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/rik/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.success && data.data) {
        setCompanyResults(Array.isArray(data.data) ? data.data : [data.data]);
      } else {
        setError('No results found');
        setCompanyResults([]);
      }
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      setCompanyResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getCompanyDetails = async (code: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/rik/company/${code}`);
      const data = await response.json();

      if (data.success) {
        setSelectedCompany(data.data);
      } else {
        setError('Failed to fetch company details');
      }
    } catch (err) {
      setError('Failed to fetch company details');
    } finally {
      setLoading(false);
    }
  };

  const getStatistics = async (indicator: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/opendata/statistics?indicator=${indicator}`);
      const data = await response.json();

      if (data.success) {
        setStatistics(data.data);
      } else {
        setError('Failed to fetch statistics');
      }
    } catch (err) {
      setError('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Data Explorer</h1>
        <p className="text-gray-600">
          Search and explore real data from Estonian government services
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* RIK Business Register Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Estonian Business Register (RIK)</h2>
        </div>

        <form onSubmit={searchCompanies} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for companies (e.g., Bolt, Wise, Pipedrive)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Search
            </button>
          </div>
        </form>

        {companyResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">
              Search Results ({companyResults.length}):
            </h3>
            {companyResults.map((company, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all"
                onClick={() => getCompanyDetails(company.registry_code)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">{company.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Registry Code:</span> {company.registry_code}
                    </p>
                    {company.address && (
                      <p className="text-sm text-gray-500 mt-1">📍 {company.address}</p>
                    )}
                    <p className="text-xs text-blue-600 mt-2">Click for details →</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      company.status === 'R'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {company.status === 'R' ? 'Active' : company.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCompany && (
          <div className="mt-6 border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Company Details</h3>
              <button
                onClick={() => setSelectedCompany(null)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ✕ Close
              </button>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Company Name</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCompany.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Registry Code</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedCompany.registry_code}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Status</p>
                  <p className="text-lg font-semibold text-green-600">
                    {selectedCompany.status_text || 'Registered'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Founded</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCompany.founded}</p>
                </div>
                {selectedCompany.address && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 font-medium">Address</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedCompany.address}</p>
                  </div>
                )}
                {selectedCompany.capital && (
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Share Capital</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedCompany.capital}</p>
                  </div>
                )}
                {selectedCompany.employees && (
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Employees</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedCompany.employees}
                    </p>
                  </div>
                )}
              </div>

              {selectedCompany.board_members && selectedCompany.board_members.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 font-medium mb-2">Board Members</p>
                  <div className="space-y-2">
                    {selectedCompany.board_members.map((member: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        <span className="text-gray-900">{member.name}</span>
                        <span className="text-sm text-gray-500">- {member.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCompany.activities && selectedCompany.activities.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 font-medium mb-2">Activities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.activities.map((activity: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Statistics Estonia */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold">Statistics Estonia</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Access real-time statistics and indicators from Statistics Estonia
        </p>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            🔄 <strong>Live API:</strong> Data fetched from andmed.stat.ee in real-time
          </p>
        </div>
        <button
          onClick={() => getStatistics('population')}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Loading...' : 'Fetch Latest Statistics'}
        </button>
        {statistics && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="font-semibold">{statistics.indicator}</p>
            <p className="text-2xl text-blue-600">{statistics.value.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Year: {statistics.year}</p>
            <p className="text-xs text-gray-400 mt-2">Source: {statistics.source}</p>
          </div>
        )}
      </div>

      {/* Open Data Portal */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <Database className="h-6 w-6 text-purple-600 mr-2" />
          <h2 className="text-xl font-semibold">Open Data Portal</h2>
        </div>
        <p className="mb-4">Access to Estonian open data datasets including:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Geographic data and maps</li>
          <li>Transport and infrastructure</li>
          <li>Environment and weather</li>
          <li>Public sector information</li>
          <li>Education and research data</li>
        </ul>
        <div className="mt-4 space-y-2">
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800">
              ✅ <strong>RIK Data:</strong> 369,250+ Estonian companies (Real-time)
            </p>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              🔄 <strong>Statistics API:</strong> andmed.stat.ee (Live)
            </p>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-200 rounded">
            <p className="text-sm text-purple-800">
              📊 <strong>Open Data API:</strong> avaandmed.eesti.ee (Live)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
