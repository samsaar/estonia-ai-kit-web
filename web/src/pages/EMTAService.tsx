import { useState, useEffect } from 'react';
import { FileText, Calendar, Euro, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Declaration {
  id: string;
  type: string;
  period: string;
  status: string;
  amount: number;
  submitted_date: string | null;
  due_date: string;
}

interface DeclarationDetail {
  id: string;
  type: string;
  period: string;
  status: string;
  total_amount: number;
  submitted_date: string;
  due_date: string;
  items: Array<{ description: string; amount: number }>;
}

export default function EMTAService() {
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [selectedDeclaration, setSelectedDeclaration] = useState<DeclarationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeclarations();
  }, []);

  const fetchDeclarations = async () => {
    try {
      const response = await fetch('/api/emta/declarations');
      const data = await response.json();
      if (data.success) {
        setDeclarations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch declarations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeclarationDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/emta/declaration/${id}`);
      const data = await response.json();
      if (data.success) {
        setSelectedDeclaration(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch declaration details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Submitted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Draft':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">EMTA Tax & Customs</h1>
        <p className="text-gray-600">View your tax declarations and customs data (Demo Mode)</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Demo Mode</h3>
            <p className="text-sm text-blue-700">
              This is demonstration data. Real EMTA data requires Smart-ID authentication via CLI
              tools.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading declarations...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Total Declarations</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{declarations.length}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">Submitted</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {declarations.filter((d) => d.status === 'Submitted').length}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <Euro className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Total Amount</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                €{declarations.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Tax Declarations (TSD)</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {declarations.map((declaration) => (
                <div
                  key={declaration.id}
                  className="p-6 hover:bg-blue-50 cursor-pointer transition-all"
                  onClick={() => fetchDeclarationDetails(declaration.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(declaration.status)}
                        <h3 className="font-semibold text-gray-900">{declaration.id}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(declaration.status)}`}
                        >
                          {declaration.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-500">Type</p>
                          <p className="font-medium text-gray-900">{declaration.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Period</p>
                          <p className="font-medium text-gray-900">{declaration.period}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="font-medium text-gray-900">
                            €{declaration.amount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Due Date</p>
                          <p className="font-medium text-gray-900">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {declaration.due_date}
                          </p>
                        </div>
                      </div>
                      {declaration.submitted_date && (
                        <p className="text-sm text-gray-500 mt-2">
                          Submitted: {declaration.submitted_date}
                        </p>
                      )}
                      <p className="text-xs text-blue-600 mt-2">Click for details →</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedDeclaration && (
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Declaration Details</h2>
                <button
                  onClick={() => setSelectedDeclaration(null)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ✕ Close
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Declaration ID</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedDeclaration.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Period</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedDeclaration.period}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Amount</p>
                    <p className="text-lg font-semibold text-purple-600">
                      €{selectedDeclaration.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Breakdown</h3>
                  <div className="space-y-3">
                    {selectedDeclaration.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-gray-900">{item.description}</span>
                        <span className="font-semibold text-gray-900">
                          €{item.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t mt-6 pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Submitted Date</p>
                    <p className="font-medium text-gray-900">
                      {selectedDeclaration.submitted_date}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="font-medium text-gray-900">{selectedDeclaration.due_date}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
