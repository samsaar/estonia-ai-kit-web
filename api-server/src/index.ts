import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import { rikDataLoader } from './rik-data-loader.js';
import { openDataClient } from './opendata-client.js';
import { riigiteatajaClient } from './riigiteataja-client.js';

dotenv.config();

const parseXML = promisify(parseString);
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// RIK (Estonian Business Register) endpoints - Using Open Data CSV
app.get('/api/rik/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required',
      });
    }

    // Use real RIK Open Data
    const results = rikDataLoader.searchCompanies(query as string, 10);

    if (results.length > 0) {
      const formatted = results.map((company) => ({
        name: company.name,
        registry_code: company.registry_code,
        status: company.status,
        address: company.address,
        founded: company.founded || '',
      }));

      return res.json({
        success: true,
        data: formatted,
        source: 'RIK Open Data (Real Estonian Companies)',
        total: results.length,
      });
    }

    // If no results found, return empty
    res.json({
      success: true,
      data: [],
      source: 'RIK Open Data',
      message: 'No companies found matching your search',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to search companies',
      message: error.message,
    });
  }
});

// Legacy fallback endpoint (keeping for compatibility)
app.get('/api/rik/search-demo', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required',
      });
    }

    const mockCompanies = [
      {
        name: 'Bolt Technology OÜ',
        registry_code: '14532901',
        status: 'R',
        address: 'Vana-Lõuna tn 15, Tallinn',
        founded: '2013-04-17',
      },
      {
        name: 'Wise Payments Estonia OÜ',
        registry_code: '12546677',
        status: 'R',
        address: 'Roosikrantsi tn 11, Tallinn',
        founded: '2013-08-07',
      },
      {
        name: 'Pipedrive OÜ',
        registry_code: '11339750',
        status: 'R',
        address: 'Mustamäe tee 3a, Tallinn',
        founded: '2010-06-15',
      },
      {
        name: 'Skype Technologies OÜ',
        registry_code: '10629677',
        status: 'R',
        address: 'Lõõtsa tn 5, Tallinn',
        founded: '2003-04-14',
      },
      {
        name: 'Eesti Energia AS',
        registry_code: '10421629',
        status: 'R',
        address: 'Lelle tn 22, Tallinn',
        founded: '1998-09-03',
      },
      {
        name: 'Tallinna Vesi AS',
        registry_code: '10257326',
        status: 'R',
        address: 'Adala tn 10, Tallinn',
        founded: '1997-11-28',
      },
      {
        name: 'Tallink Grupp AS',
        registry_code: '10238429',
        status: 'R',
        address: 'Sadama tn 5, Tallinn',
        founded: '1997-02-11',
      },
      {
        name: 'Rimi Eesti Food AS',
        registry_code: '10121393',
        status: 'R',
        address: 'Järvevana tee 9, Tallinn',
        founded: '1992-06-24',
      },
      {
        name: 'Selver AS',
        registry_code: '10379733',
        status: 'R',
        address: 'Paldiski mnt 102, Tallinn',
        founded: '1995-05-17',
      },
      {
        name: 'Swedbank AS',
        registry_code: '10060701',
        status: 'R',
        address: 'Liivalaia tn 8, Tallinn',
        founded: '1991-12-31',
      },
      {
        name: 'SEB Pank AS',
        registry_code: '10004252',
        status: 'R',
        address: 'Tornimäe tn 2, Tallinn',
        founded: '1991-10-01',
      },
      {
        name: 'LHV Pank AS',
        registry_code: '10539549',
        status: 'R',
        address: 'Tartu mnt 2, Tallinn',
        founded: '1999-07-08',
      },
    ];

    const searchQuery = (query as string).toLowerCase();
    const filtered = mockCompanies.filter((company) =>
      company.name.toLowerCase().includes(searchQuery)
    );

    res.json({
      success: true,
      data: filtered,
      source: 'Estonian Business Register (Demo Data)',
      note: 'External API unavailable, showing demo data',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data from RIK',
      message: error.message,
    });
  }
});

app.get('/api/rik/company/:code', async (req, res) => {
  try {
    const { code } = req.params;

    // Get company from RIK Open Data
    const company = rikDataLoader.getCompanyByCode(code);

    if (company) {
      return res.json({
        success: true,
        data: {
          name: company.name,
          registry_code: company.registry_code,
          status: company.status,
          status_text: company.status_text,
          address: company.address,
          founded: company.founded || 'N/A',
          source: 'RIK Open Data (Real Data)',
        },
      });
    }

    // Fallback to mock data if not found
    const mockDetails: any = {
      '14532901': {
        name: 'Bolt Technology OÜ',
        registry_code: '14532901',
        status: 'R',
        status_text: 'Registered',
        address: 'Vana-Lõuna tn 15, Tallinn',
        founded: '2013-04-17',
        capital: '€2,500',
        employees: '500+',
        board_members: [
          { name: 'Markus Villig', role: 'CEO' },
          { name: 'Martin Villig', role: 'Co-founder' },
        ],
        activities: ['Transportation', 'Software development', 'Food delivery'],
      },
      '12546677': {
        name: 'Wise Payments Estonia OÜ',
        registry_code: '12546677',
        status: 'R',
        status_text: 'Registered',
        address: 'Roosikrantsi tn 11, Tallinn 10119',
        founded: '2011-03-15',
        capital: '2500 EUR',
        board_members: [{ name: 'Kristo Käärmann', role: 'Board Member' }],
        activities: ['Payment services', 'Money transfer', 'Currency exchange'],
        employees: '1000+',
      },
    };

    if (mockDetails[code]) {
      return res.json({
        success: true,
        data: mockDetails[code],
        source: 'Estonian Business Register (Demo Data)',
      });
    }

    // Try real API
    try {
      const response = await axios.get(
        `https://avaandmed.ariregister.rik.ee/api/companies/${code}`,
        {
          timeout: 5000,
        }
      );

      res.json({
        success: true,
        data: response.data,
        source: 'Estonian Business Register (RIK)',
      });
    } catch (apiError) {
      res.json({
        success: true,
        data: {
          name: 'Demo Company',
          registry_code: code,
          status: 'R',
          address: 'Tallinn, Estonia',
          founded: '2020-01-01',
        },
        source: 'Demo Data (RIK API unavailable)',
      });
    }
  } catch (error: any) {
    console.error('RIK API error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company data',
      message: error.message,
    });
  }
});

// Statistics Estonia endpoints - Real-time API
app.get('/api/opendata/statistics', async (req, res) => {
  try {
    const { indicator } = req.query;

    // Try to get real-time statistics
    try {
      const result = await openDataClient.getStatistics(indicator as string);
      return res.json(result);
    } catch (apiError: any) {
      console.log('Statistics Estonia API not available, using specific indicators');
    }

    // Get specific indicators with real-time data
    let data;
    switch (indicator) {
      case 'population':
        data = await openDataClient.getPopulationData();
        break;
      case 'gdp':
        data = await openDataClient.getGDPData();
        break;
      case 'unemployment':
        data = await openDataClient.getUnemploymentRate();
        break;
      default:
        data = await openDataClient.getPopulationData();
    }

    res.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Statistics API error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message,
    });
  }
});

// Open Data Portal - Search Datasets (Real-time API)
app.get('/api/opendata/datasets', async (req, res) => {
  try {
    const { query, limit } = req.query;

    try {
      const datasets = await openDataClient.searchDatasets(
        (query as string) || 'estonia',
        parseInt(limit as string) || 10
      );

      return res.json({
        success: true,
        data: datasets,
        source: 'Estonian Open Data Portal (Real-time API)',
        timestamp: new Date().toISOString(),
      });
    } catch (apiError: any) {
      console.log('Open Data Portal API not available, using fallback');
    }

    // Fallback datasets
    const datasets = [
      {
        id: 'geographic-data',
        title: 'Geographic Data',
        description: 'Maps, coordinates, and geographic information',
        modified: '2024-03-15',
        publisher: 'Estonian Land Board',
        theme: ['geography', 'maps'],
        format: ['GeoJSON', 'WMS'],
      },
      {
        id: 'transport',
        title: 'Transport & Infrastructure',
        description: 'Public transport, roads, and infrastructure data',
        modified: '2024-03-20',
        publisher: 'Transport Administration',
        theme: ['transport', 'infrastructure'],
        format: ['CSV', 'JSON'],
      },
      {
        id: 'environment',
        title: 'Environment & Weather',
        description: 'Environmental monitoring and weather data',
        modified: '2024-03-25',
        publisher: 'Environment Agency',
        theme: ['environment', 'weather'],
        format: ['CSV', 'API'],
      },
    ];

    res.json({
      success: true,
      data: datasets,
      source: 'Estonian Open Data Portal (Cached)',
    });
  } catch (error: any) {
    console.error('Open Data API error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch datasets',
      message: error.message,
    });
  }
});

// Get specific dataset by ID
app.get('/api/opendata/datasets/:id', async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const dataset = await openDataClient.getDatasetById(id);
      return res.json({
        success: true,
        data: dataset,
        source: 'Estonian Open Data Portal (Real-time)',
        timestamp: new Date().toISOString(),
      });
    } catch (apiError: any) {
      console.log('Dataset not found in API, using fallback');
    }

    res.json({
      success: false,
      error: 'Dataset not found',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dataset',
      message: error.message,
    });
  }
});

// SPARQL Query endpoint
app.post('/api/opendata/sparql', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'SPARQL query is required',
      });
    }

    try {
      const result = await openDataClient.sparqlQuery(query);
      return res.json({
        success: true,
        data: result,
        source: 'Estonian Open Data SPARQL Endpoint',
        timestamp: new Date().toISOString(),
      });
    } catch (apiError: any) {
      return res.status(500).json({
        success: false,
        error: 'SPARQL query failed',
        message: apiError.message,
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to execute SPARQL query',
      message: error.message,
    });
  }
});

// Riigiteataja Court Decisions endpoints
app.get('/api/riigiteataja/decisions', async (req, res) => {
  try {
    const { query, limit } = req.query;

    const decisions = await riigiteatajaClient.searchCourtDecisions(
      query as string,
      parseInt(limit as string) || 20
    );

    res.json({
      success: true,
      data: decisions,
      source: 'Riigiteataja (Court Decisions)',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Riigiteataja API error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch court decisions',
      message: error.message,
    });
  }
});

app.get('/api/riigiteataja/decisions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const decision = await riigiteatajaClient.getDecisionById(id);

    if (decision) {
      res.json({
        success: true,
        data: decision,
        source: 'Riigiteataja',
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Decision not found',
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch decision',
      message: error.message,
    });
  }
});

app.get('/api/riigiteataja/decisions/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { limit } = req.query;

    const decisions = await riigiteatajaClient.getDecisionsByType(
      type,
      parseInt(limit as string) || 10
    );

    res.json({
      success: true,
      data: decisions,
      source: 'Riigiteataja',
      filter: { type },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch decisions by type',
      message: error.message,
    });
  }
});

app.get('/api/riigiteataja/decisions/court/:court', async (req, res) => {
  try {
    const { court } = req.params;
    const { limit } = req.query;

    const decisions = await riigiteatajaClient.getDecisionsByCourt(
      court,
      parseInt(limit as string) || 10
    );

    res.json({
      success: true,
      data: decisions,
      source: 'Riigiteataja',
      filter: { court },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch decisions by court',
      message: error.message,
    });
  }
});

// Health indicators
app.get('/api/health/indicators', async (req, res) => {
  try {
    const healthData = {
      life_expectancy: {
        male: 74.4,
        female: 82.8,
        year: 2023,
      },
      birth_rate: {
        value: 9.2,
        unit: 'per 1000 population',
        year: 2023,
      },
      death_rate: {
        value: 12.8,
        unit: 'per 1000 population',
        year: 2023,
      },
    };

    res.json({
      success: true,
      data: healthData,
      source: 'Estonian Health Board',
    });
  } catch (error: any) {
    console.error('Health API error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch health indicators',
      message: error.message,
    });
  }
});

// List available endpoints
app.get('/api', (req, res) => {
  res.json({
    name: 'Estonia AI Kit API',
    version: '1.0.0',
    description: 'Access Estonian government data and services',
    endpoints: {
      health: {
        path: 'GET /health',
        description: 'API health check',
      },
      rik: {
        search: {
          path: 'GET /api/rik/search?query=company_name',
          description: 'Search companies in Estonian Business Register',
          example: '/api/rik/search?query=Bolt',
        },
        company: {
          path: 'GET /api/rik/company/:code',
          description: 'Get company details by registry code',
          example: '/api/rik/company/14532901',
        },
      },
      statistics: {
        indicators: {
          path: 'GET /api/opendata/statistics?indicator=<type>',
          description: 'Get statistics from Statistics Estonia',
          indicators: ['population', 'gdp', 'employment', 'average_salary', 'unemployment'],
          example: '/api/opendata/statistics?indicator=population',
        },
      },
      opendata: {
        datasets: {
          path: 'GET /api/opendata/datasets',
          description: 'List available open data datasets',
        },
      },
      health_indicators: {
        path: 'GET /api/health/indicators',
        description: 'Get health statistics and indicators',
      },
    },
    documentation: 'Visit http://88.196.165.84:8089 for full documentation',
  });
});

// EMTA (Tax & Customs) endpoints - Demo mode
app.get('/api/emta/declarations', async (req, res) => {
  try {
    const declarations = [
      {
        id: 'TSD-2024-001',
        type: 'TSD',
        period: '2024-02',
        status: 'Submitted',
        amount: 1250.5,
        submitted_date: '2024-03-15',
        due_date: '2024-03-20',
      },
      {
        id: 'TSD-2024-002',
        type: 'TSD',
        period: '2024-03',
        status: 'Draft',
        amount: 1180.0,
        submitted_date: null,
        due_date: '2024-04-20',
      },
    ];

    res.json({
      success: true,
      data: declarations,
      source: 'EMTA Demo Data',
      note: 'Real data requires Smart-ID authentication',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch EMTA data',
      message: error.message,
    });
  }
});

app.get('/api/emta/declaration/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const declarationDetails = {
      id: id,
      type: 'TSD',
      period: '2024-02',
      status: 'Submitted',
      total_amount: 1250.5,
      submitted_date: '2024-03-15',
      due_date: '2024-03-20',
      items: [
        { description: 'Social tax', amount: 850.0 },
        { description: 'Unemployment insurance', amount: 250.5 },
        { description: 'Funded pension', amount: 150.0 },
      ],
    };

    res.json({
      success: true,
      data: declarationDetails,
      source: 'EMTA Demo Data',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch declaration details',
      message: error.message,
    });
  }
});

// LHV Bank endpoints - Demo mode
app.get('/api/lhv/accounts', async (req, res) => {
  try {
    const accounts = [
      {
        id: 'ACC-001',
        name: 'Main Account',
        iban: 'EE123456789012345678',
        balance: 5420.75,
        currency: 'EUR',
        type: 'Current Account',
      },
      {
        id: 'ACC-002',
        name: 'Savings Account',
        iban: 'EE987654321098765432',
        balance: 12500.0,
        currency: 'EUR',
        type: 'Savings Account',
      },
    ];

    res.json({
      success: true,
      data: accounts,
      source: 'LHV Demo Data',
      note: 'Real data requires Smart-ID authentication',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch LHV accounts',
      message: error.message,
    });
  }
});

app.get('/api/lhv/transactions', async (req, res) => {
  try {
    const { account_id } = req.query;

    const transactions = [
      {
        id: 'TXN-001',
        date: '2024-03-30',
        description: 'Salary',
        amount: 2500.0,
        type: 'credit',
        balance_after: 5420.75,
      },
      {
        id: 'TXN-002',
        date: '2024-03-28',
        description: 'Grocery Store',
        amount: -45.2,
        type: 'debit',
        balance_after: 2920.75,
      },
      {
        id: 'TXN-003',
        date: '2024-03-25',
        description: 'Electricity Bill',
        amount: -85.5,
        type: 'debit',
        balance_after: 2965.95,
      },
      {
        id: 'TXN-004',
        date: '2024-03-20',
        description: 'Online Purchase',
        amount: -129.99,
        type: 'debit',
        balance_after: 3051.45,
      },
    ];

    res.json({
      success: true,
      data: transactions,
      account_id: account_id || 'ACC-001',
      source: 'LHV Demo Data',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Estonia AI Kit API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 API docs: http://localhost:${PORT}/api`);
});
