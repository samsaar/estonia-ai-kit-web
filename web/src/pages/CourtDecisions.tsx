import { useState } from 'react';
import { Search, Scale, Calendar, Building2, FileText, ExternalLink } from 'lucide-react';

interface CourtDecision {
  id: string;
  title: string;
  court: string;
  date: string;
  caseNumber: string;
  type: string;
  url: string;
  summary?: string;
}

export default function CourtDecisions() {
  const [decisions, setDecisions] = useState<CourtDecision[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<CourtDecision | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Advanced search filters
  const [caseNumber, setCaseNumber] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [proceedingDateFrom, setProceedingDateFrom] = useState('');
  const [proceedingDateTo, setProceedingDateTo] = useState('');
  const [court, setCourt] = useState('');
  const [courtLocation, setCourtLocation] = useState('');
  const [judgeOrCourt, setJudgeOrCourt] = useState('');
  const [proceedingNumber, setProceedingNumber] = useState('');
  const [proceedingType, setProceedingType] = useState('');
  const [caseType, setCaseType] = useState('');
  const [orderType, setOrderType] = useState('');
  const [caseCategory, setCaseCategory] = useState('');
  const [caseSubcategory, setCaseSubcategory] = useState('');
  const [decisionText, setDecisionText] = useState('');
  const [annotationText, setAnnotationText] = useState('');

  const searchDecisions = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Build query parameters from all filters
      const params = new URLSearchParams();
      if (caseNumber) params.append('caseNumber', caseNumber);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (court) params.append('court', court);
      if (proceedingType) params.append('type', proceedingType);
      if (decisionText) params.append('query', decisionText);
      params.append('limit', '20');

      const response = await fetch(
        `http://localhost:3001/api/riigiteataja/decisions?${params.toString()}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setDecisions(data.data);
      } else {
        setError('Otsing ei andnud tulemusi');
        setDecisions([]);
      }
    } catch (err) {
      setError('Viga andmete laadimisel. CAPTCHA lahendamine võib võtta 15-30 sekundit.');
      setDecisions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllDecisions = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/riigiteataja/decisions?limit=20');
      const data = await response.json();

      if (data.success && data.data) {
        setDecisions(data.data);
      }
    } catch (err) {
      setError('Viga andmete laadimisel. CAPTCHA lahendamine võib võtta 15-30 sekundit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <Scale className="h-8 w-8 text-indigo-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Riigiteataja Kohtulahendid</h1>
            <p className="text-sm text-gray-600">Eesti kohtute lahendite andmebaas</p>
          </div>
        </div>

        <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded">
          <p className="text-sm text-indigo-800">
            📚 <strong>Riigiteataja:</strong> Kohtulahendite avalik andmebaas (reaalajas andmed)
          </p>
          <p className="text-xs text-indigo-600 mt-1">
            🤖 2Captcha integratsioon - Esimene otsing võtab 15-30 sekundit (CAPTCHA lahendamine).
            Järgnevad päringud on kiired (24h cache). Andmed uuendatakse automaatselt iga 24h.
          </p>
        </div>

        <form onSubmit={searchDecisions} className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kohtuasja number:
                </label>
                <input
                  type="text"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  placeholder="nt. 3-2-1-156-23"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lahendi kuupäev:
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Menetluse alguse kuupäev:
                  </label>
                  <input
                    type="date"
                    value={proceedingDateFrom}
                    onChange={(e) => setProceedingDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                  <input
                    type="date"
                    value={proceedingDateTo}
                    onChange={(e) => setProceedingDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kohus:</label>
                <select
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Vali kohus</option>
                  <option value="Riigikohus">Riigikohus</option>
                  <option value="Tallinna Ringkonnakohus">Tallinna Ringkonnakohus</option>
                  <option value="Tartu Ringkonnakohus">Tartu Ringkonnakohus</option>
                  <option value="Harju Maakohus">Harju Maakohus</option>
                  <option value="Tartu Maakohus">Tartu Maakohus</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Riigikohtu koosseisu tunnus:
                </label>
                <input
                  type="text"
                  value={courtLocation}
                  onChange={(e) => setCourtLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kohtunik/kohtu koosseis:
                </label>
                <input
                  type="text"
                  value={judgeOrCourt}
                  onChange={(e) => setJudgeOrCourt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kohtuteelse menetluse number:
                </label>
                <input
                  type="text"
                  value={proceedingNumber}
                  onChange={(e) => setProceedingNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annotatsioon tekst:
                </label>
                <input
                  type="text"
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Menetluse liik:
                </label>
                <select
                  value={proceedingType}
                  onChange={(e) => setProceedingType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Vali menetluse liik</option>
                  <option value="Kriminaalasi">Kriminaalasi</option>
                  <option value="Tsiviilasi">Tsiviilasi</option>
                  <option value="Haldusasi">Haldusasi</option>
                  <option value="Väärteoasi">Väärteoasi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lahendi liik:
                </label>
                <select
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Vali lahendi liik</option>
                  <option value="Otsus">Otsus</option>
                  <option value="Määrus">Määrus</option>
                  <option value="Kohtuotsus">Kohtuotsus</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Menetluse tüüp:
                </label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Vali menetluse tüüp</option>
                  <option value="Esimene">Esimene</option>
                  <option value="Teine">Teine</option>
                  <option value="Kassatsioon">Kassatsioon</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taotluse liik:
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asja kategooria:
                </label>
                <select
                  value={caseCategory}
                  onChange={(e) => setCaseCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Vali kategooria</option>
                  <option value="Varaline">Varaline</option>
                  <option value="Isikuõigused">Isikuõigused</option>
                  <option value="Haldus">Haldus</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asja alakategooria:
                </label>
                <select
                  value={caseSubcategory}
                  onChange={(e) => setCaseSubcategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Vali alakategooria</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lahendus:</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Karistuse liigid:
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lahendi tekst:
                </label>
                <textarea
                  value={decisionText}
                  onChange={(e) => setDecisionText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  placeholder="Sisesta otsingusõnad..."
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={loadAllDecisions}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100"
            >
              Tühjenda
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-8 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Otsin... (CAPTCHA lahendamine 15-30s)
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Otsi
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {decisions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Leitud {decisions.length} kohtulahendit</h2>
          <div className="space-y-4">
            {decisions.map((decision) => (
              <div
                key={decision.id}
                onClick={() => setSelectedDecision(decision)}
                className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{decision.title}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        <span>{decision.court}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{decision.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{decision.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs">{decision.caseNumber}</span>
                      </div>
                    </div>
                    {decision.summary && (
                      <p className="mt-2 text-sm text-gray-700">{decision.summary}</p>
                    )}
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400 ml-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail View */}
      {selectedDecision && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedDecision.title}</h2>
                <button
                  onClick={() => setSelectedDecision(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Kohus</label>
                    <p className="text-gray-900">{selectedDecision.court}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Kuupäev</label>
                    <p className="text-gray-900">{selectedDecision.date}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Menetluse liik
                    </label>
                    <p className="text-gray-900">{selectedDecision.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Kohtuasja number
                    </label>
                    <p className="text-gray-900 font-mono">{selectedDecision.caseNumber}</p>
                  </div>
                </div>

                {selectedDecision.summary && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Kokkuvõte
                    </label>
                    <p className="text-gray-900">{selectedDecision.summary}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <a
                    href={selectedDecision.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Vaata Riigiteatajas
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
