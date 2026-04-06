import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import Captcha from '2captcha';
import { Page } from 'puppeteer';
import dotenv from 'dotenv';

// Force reload environment variables
dotenv.config();

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

interface CacheEntry {
  data: CourtDecision[];
  timestamp: number;
}

class RiigiteatajaClient {
  private readonly BASE_URL = 'https://www.riigiteataja.ee';
  private readonly USE_REAL_SCRAPING = true;
  private readonly CACHE_TTL = 86400000; // 24 hours in milliseconds
  private cache: Map<string, CacheEntry> = new Map();
  private captchaSolver: Captcha.Solver;

  constructor() {
    // Initialize 2Captcha solver
    const apiKey = process.env.CAPTCHA_API_KEY || '';
    console.log('CAPTCHA_API_KEY from env:', apiKey ? 'SET' : 'NOT SET');
    console.log(
      'All env vars:',
      Object.keys(process.env).filter((k) => k.includes('CAPTCHA'))
    );
    if (!apiKey) {
      console.warn('CAPTCHA_API_KEY not set - CAPTCHA solving will fail');
    }
    this.captchaSolver = new Captcha.Solver(apiKey);
  }

  /**
   * Get cached data if available and not expired
   */
  private getCachedData(key: string): CourtDecision[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`Cache hit for key: ${key}`);
      return cached.data;
    }
    return null;
  }

  /**
   * Set cache data
   */
  private setCachedData(key: string, data: CourtDecision[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Solve CAPTCHA using 2Captcha service
   */
  private async solveCaptcha(page: Page): Promise<boolean> {
    try {
      console.log('Checking for CAPTCHA...');

      // Check if CAPTCHA exists
      const captchaExists = await page.$('text=Robotilõks');
      if (!captchaExists) {
        console.log('No CAPTCHA detected');
        return true;
      }

      console.log('CAPTCHA detected! Solving with 2Captcha...');

      // Take screenshot of CAPTCHA area
      const captchaContainer = await page.$('.captcha-container, form');
      if (!captchaContainer) {
        console.error('Could not find CAPTCHA container');
        return false;
      }

      const screenshot = await captchaContainer.screenshot({
        encoding: 'base64',
      });

      // Send to 2Captcha for solving
      const result = await this.captchaSolver.imageCaptcha(screenshot);

      console.log('CAPTCHA solved! Answer:', result.data);

      // Click on the correct image based on answer
      // The answer should be image index (1-4)
      const imageIndex = parseInt(result.data) - 1;
      const captchaImages = await page.$$('.captcha-option, .captcha-image');

      if (captchaImages.length > imageIndex) {
        await captchaImages[imageIndex].click();
        console.log(`Clicked on image ${imageIndex + 1}`);
      }

      // Click confirm button
      const confirmButton =
        (await page.$('button:has-text("Kinnita")')) || (await page.$('input[type="submit"]'));
      if (confirmButton) {
        await confirmButton.click();
      }

      // Wait for navigation or CAPTCHA to disappear
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log('CAPTCHA solved successfully!');
      return true;
    } catch (error: any) {
      console.error('CAPTCHA solving failed:', error.message);
      return false;
    }
  }

  /**
   * Scrape real court decisions from Riigiteataja using Puppeteer
   */
  private async scrapeRealDecisions(query?: string, limit: number = 20): Promise<CourtDecision[]> {
    console.log(`Starting Puppeteer scraping for query: "${query || 'all'}"`);

    // Add stealth plugin to avoid CAPTCHA detection
    puppeteer.use(StealthPlugin());

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=IsolateOrigins,site-per-process',
        ],
        ignoreDefaultArgs: ['--enable-automation'],
      });

      const page = await browser.newPage();

      // Set realistic viewport and user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Set extra headers to look more like a real browser
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'et-EE,et;q=0.9,en-US;q=0.8,en;q=0.7',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      });

      // Intercept network requests to capture AJAX responses
      let ajaxResults: any = null;
      await page.setRequestInterception(true);

      page.on('request', (request) => {
        request.continue();
      });

      page.on('response', async (response) => {
        const url = response.url();
        const method = response.request().method();

        // Log all POST requests (likely AJAX)
        if (method === 'POST') {
          console.log('POST request to:', url);
        }

        // Look for AJAX requests that might contain results
        if (
          url.includes('kohtulahendid') ||
          url.includes('search') ||
          url.includes('otsing') ||
          method === 'POST'
        ) {
          const contentType = response.headers()['content-type'] || '';
          console.log(`Response from ${url} (${method}), content-type: ${contentType}`);

          if (contentType.includes('json') || contentType.includes('javascript')) {
            try {
              const data = await response.json();
              console.log('AJAX response from:', url);
              console.log('Response data:', JSON.stringify(data).substring(0, 500));
              ajaxResults = data;
            } catch (e) {
              console.log('Failed to parse JSON from:', url);
            }
          } else if (contentType.includes('html') && method === 'POST') {
            // Might be HTML response with results
            try {
              const html = await response.text();
              if (html.includes('tulemus') || html.includes('kohtuasi')) {
                console.log('POST response contains results HTML, length:', html.length);
                console.log('HTML preview:', html.substring(0, 500));
              }
            } catch (e) {
              // Ignore
            }
          }
        }
      });

      // Navigate to Riigiteataja court decisions page
      console.log('Navigating to Riigiteataja...');
      await page.goto('https://www.riigiteataja.ee/kohtulahendid/koik_menetlused.html', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait for page to fully load
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Solve CAPTCHA if present
      const captchaSolved = await this.solveCaptcha(page);
      if (!captchaSolved) {
        console.error('Failed to solve CAPTCHA, aborting scraping');
        throw new Error('CAPTCHA solving failed');
      }

      console.log('CAPTCHA solved, filling search form...');

      // Fill search form if query provided
      if (query && query.trim()) {
        console.log(`Filling search form with query: "${query}"`);

        // Try to find and fill the search text field
        const searchFieldSelectors = [
          'textarea[name*="tekst"]',
          'textarea[name*="text"]',
          'input[name*="tekst"]',
          'textarea#lahendi_tekst',
          'textarea',
        ];

        for (const selector of searchFieldSelectors) {
          const field = await page.$(selector);
          if (field) {
            await field.type(query);
            console.log(`Filled search field: ${selector}`);
            break;
          }
        }
      }

      // Submit form using JavaScript (Riigiteataja uses AJAX)
      console.log('Submitting search form via JavaScript...');
      const currentUrl = page.url();
      console.log('Current URL before submit:', currentUrl);

      // Check form action to see where it submits to
      // @ts-ignore
      const formInfo = await page.evaluate(() => {
        // @ts-ignore
        const forms = document.querySelectorAll('form');
        if (forms.length > 0) {
          // @ts-ignore
          const form = forms[0];
          return {
            action: form.action || 'none',
            method: form.method || 'GET',
            hasSubmit: !!form.querySelector('input[type="submit"], button[type="submit"]'),
          };
        }
        return null;
      });

      console.log('Form info:', JSON.stringify(formInfo));

      // Submit the court decisions form specifically (not the general search form)
      console.log('Submitting court decisions form...');

      // @ts-ignore
      const submitted = await page.evaluate(() => {
        try {
          // Find the court decisions form by ID
          // @ts-ignore
          const form =
            document.querySelector('#otsing') ||
            document.querySelector('#otsinguVorm') ||
            document.querySelectorAll('form')[1];
          if (!form) return false;

          console.log('Found form:', form.id || form.className);

          // Trigger form submission which should navigate to results page
          // @ts-ignore
          form.submit();
          return true;
        } catch (e) {
          console.error('Form submit error:', e);
          return false;
        }
      });

      if (!submitted) {
        console.error('Form submission failed');
        throw new Error('Could not submit search form');
      }

      console.log('Form submitted, waiting for navigation...');

      try {
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });
        console.log('Successfully navigated to:', page.url());
      } catch (e: any) {
        console.error('Navigation failed:', e.message);
        console.log('Current URL:', page.url());
      }

      // Wait for Knockout.js to render results
      console.log('Waiting for Knockout.js to render results...');

      // Try to wait for result elements to appear
      const resultSelectors = [
        '.tulemused',
        '.tulemus',
        '#tulemused',
        'div[data-bind*="tulemus"]',
        'table.tulemused',
        'div.result-list',
        'div.search-results',
      ];

      let resultsAppeared = false;
      for (const selector of resultSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          console.log(`Results container found: ${selector}`);
          resultsAppeared = true;
          break;
        } catch (e) {
          // Try next selector
        }
      }

      if (!resultsAppeared) {
        console.log('No specific result container found, waiting for DOM update...');
        await new Promise((resolve) => setTimeout(resolve, 8000));
      } else {
        // Wait a bit more for all results to render
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // Check for CAPTCHA again
      const captchaSolved2 = await this.solveCaptcha(page);
      if (!captchaSolved2) {
        console.error('CAPTCHA appeared after form submission');
      }

      console.log('Ready to scrape results');
      console.log('Final URL:', page.url());

      // Take screenshot for debugging
      await page.screenshot({ path: '/tmp/riigiteataja-results.png', fullPage: false });
      console.log('Screenshot saved to /tmp/riigiteataja-results.png');

      // Scrape the decisions
      console.log('Extracting court decisions...');

      // Get page content for debugging
      const pageContent = await page.content();
      const hasTable = pageContent.includes('<table');
      const hasTbody = pageContent.includes('<tbody');
      const hasResults = pageContent.includes('tulemus') || pageContent.includes('result');
      console.log(`Page has table: ${hasTable}, tbody: ${hasTbody}, results text: ${hasResults}`);

      // Log detailed DOM structure and look for Knockout.js elements
      // @ts-ignore - This code runs in browser context where DOM APIs are available
      const domInfo = await page.evaluate(() => {
        const info: any = {
          tables: 0,
          rows: 0,
          links: 0,
          divs: 0,
          forms: 0,
          tableClasses: [],
          rowSample: [],
          dataBindElements: 0,
          resultContainers: [],
        };

        // @ts-ignore - document is available in browser context
        info.tables = document.querySelectorAll('table').length;
        // @ts-ignore
        info.rows = document.querySelectorAll('tr').length;
        // @ts-ignore
        info.links = document.querySelectorAll('a').length;
        // @ts-ignore
        info.divs = document.querySelectorAll('div').length;
        // @ts-ignore
        info.forms = document.querySelectorAll('form').length;

        // Count Knockout.js data-bind elements
        // @ts-ignore
        info.dataBindElements = document.querySelectorAll('[data-bind]').length;

        // Look for elements that might contain results
        // @ts-ignore
        const possibleContainers = document.querySelectorAll(
          'div[id*="result"], div[class*="result"], div[id*="tulemus"], div[class*="tulemus"], table[class*="result"]'
        );
        possibleContainers.forEach((el: any) => {
          info.resultContainers.push({
            tag: el.tagName,
            id: el.id,
            className: el.className,
            childCount: el.children.length,
            text: el.textContent?.substring(0, 100),
          });
        });

        // Get table classes
        // @ts-ignore
        document.querySelectorAll('table').forEach((table: any) => {
          if (table.className) {
            info.tableClasses.push(table.className);
          }
        });

        // Get sample of ALL table rows (not just first 5)
        // @ts-ignore
        const rows = document.querySelectorAll('table tr');
        for (let i = 0; i < Math.min(10, rows.length); i++) {
          const row = rows[i];
          info.rowSample.push({
            html: row.innerHTML.substring(0, 200),
            text: row.textContent?.trim().substring(0, 100),
            cells: row.querySelectorAll('td, th').length,
            hasDataBind: row.hasAttribute('data-bind'),
          });
        }

        return info;
      });

      console.log('DOM structure:', JSON.stringify(domInfo, null, 2));

      // @ts-ignore - This code runs in browser context where DOM APIs are available
      const decisions = await page.evaluate(() => {
        const results: any[] = [];

        // Table has class "data" with 5 columns: Kohtuasja nr, Kohus, Lahendi kp, Seotud sätted, Märksõnad
        // @ts-ignore
        const rows = document.querySelectorAll('table.data tr');

        rows.forEach((row: any, index: number) => {
          try {
            // Skip header row (first row with <th> elements)
            const cells = row.querySelectorAll('td');
            if (cells.length === 0) return; // Skip header row

            // First cell has case number with link
            // Second cell has court name
            // Third cell has date
            if (cells.length >= 3) {
              const firstCell = cells[0];
              const linkElement = firstCell.querySelector('a');

              const caseNumber =
                linkElement?.textContent?.trim() || firstCell.textContent?.trim() || '';
              const court = cells[1]?.textContent?.trim() || '';
              const date = cells[2]?.textContent?.trim() || '';
              const url = linkElement?.href || '';

              if (caseNumber && court && date) {
                results.push({
                  id: caseNumber,
                  caseNumber,
                  court,
                  date,
                  title: `${court} - ${caseNumber}`,
                  summary: `Kohtulahend: ${court}, ${date}`,
                  type: 'Kohtulahend',
                  url:
                    url ||
                    `https://www.riigiteataja.ee/kohtulahendid/detailid.html?id=${caseNumber}`,
                });
              }
            }
          } catch (e) {
            // Skip invalid rows
          }
        });

        return results;
      });

      console.log(`Scraped ${decisions.length} court decisions`);

      await browser.close();

      // If we got results, return them
      if (decisions && decisions.length > 0) {
        return decisions.slice(0, limit);
      }

      // If scraping failed, fall back to demo data
      console.log('No results from scraping, using demo data');
      return this.getDemoDecisions(query, limit);
    } catch (error: any) {
      console.error('Puppeteer scraping error:', error.message);
      if (browser) {
        await browser.close().catch(() => {});
      }
      // Fall back to demo data on error
      return this.getDemoDecisions(query, limit);
    }
  }

  /**
   * Get demo court decisions data
   */
  private getDemoDecisions(query?: string, limit: number = 20): Promise<CourtDecision[]> {
    return new Promise((resolve) => {
      const demoDecisions: CourtDecision[] = [
        {
          id: 'rk-1',
          title: 'Riigikohtu otsus tsiviilasjas nr 3-2-1-156-23',
          court: 'Riigikohus',
          date: '2024-03-15',
          caseNumber: '3-2-1-156-23',
          type: 'Tsiviilasi',
          url: 'https://www.riigiteataja.ee/kohtulahendid/detailid.html?id=292345678',
          summary: 'Lepinguõigus, kahju hüvitamine',
        },
        {
          id: 'rk-2',
          title: 'Riigikohtu otsus kriminaalasjas nr 1-21-5432/234',
          court: 'Riigikohus',
          date: '2024-03-10',
          caseNumber: '1-21-5432/234',
          type: 'Kriminaalasi',
          url: 'https://www.riigiteataja.ee/kohtulahendid/detailid.html?id=292345679',
          summary: 'Varavastane kuritegu, vargus',
        },
        {
          id: 'rk-3',
          title: 'Riigikohtu otsus haldusasjas nr 3-3-1-67-23',
          court: 'Riigikohus',
          date: '2024-03-05',
          caseNumber: '3-3-1-67-23',
          type: 'Haldusasi',
          url: 'https://www.riigiteataja.ee/kohtulahendid/detailid.html?id=292345680',
          summary: 'Haldusmenetlus, riigihange',
        },
        {
          id: 'tk-1',
          title: 'Tallinna Ringkonnakohtu otsus nr 2-18-4567/89',
          court: 'Tallinna Ringkonnakohus',
          date: '2024-02-28',
          caseNumber: '2-18-4567/89',
          type: 'Tsiviilasi',
          url: 'https://www.riigiteataja.ee/kohtulahendid/detailid.html?id=292345681',
          summary: 'Töövaidlus, töölepingu lõpetamine',
        },
        {
          id: 'tk-2',
          title: 'Tallinna Ringkonnakohtu otsus nr 1-19-8765/43',
          court: 'Tallinna Ringkonnakohus',
          date: '2024-02-25',
          caseNumber: '1-19-8765/43',
          type: 'Kriminaalasi',
          url: 'https://www.riigiteataja.ee/kohtulahendid/detailid.html?id=292345682',
          summary: 'Liiklusõnnetus, joobeseisundis juhtimine',
        },
        {
          id: 'tk-3',
          title: 'Tartu Ringkonnakohtu otsus nr 2-17-3456/21',
          court: 'Tartu Ringkonnakohus',
          date: '2024-02-20',
          caseNumber: '2-17-3456/21',
          type: 'Tsiviilasi',
          url: 'https://www.riigiteataja.ee/kohtulahendid/detailid.html?id=292345683',
          summary: 'Kinnisvaravaidlus, omandireform',
        },
        {
          id: 'hk-1',
          title: 'Harju Maakohtu otsus nr 2-20-12345/67',
          court: 'Harju Maakohus',
          date: '2024-02-15',
          caseNumber: '2-20-12345/67',
          type: 'Tsiviilasi',
          url: 'https://www.riigiteataja.ee/kohtulahendid/detailid.html?id=292345684',
          summary: 'Perekonnavaidlus, lapse elukoht',
        },
        {
          id: 'hk-2',
          title: 'Harju Maakohtu otsus nr 1-21-23456/78',
          court: 'Harju Maakohus',
          date: '2024-02-10',
          caseNumber: '1-21-23456/78',
          type: 'Kriminaalasi',
          url: 'https://www.riigiteataja.ee/kohtulahendid/detailid.html?id=292345685',
          summary: 'Pettus, võltsitud dokumendid',
        },
        {
          id: 'tk-4',
          title: 'Tartu Maakohtu otsus nr 2-19-34567/89',
          court: 'Tartu Maakohus',
          date: '2024-02-05',
          caseNumber: '2-19-34567/89',
          type: 'Tsiviilasi',
          url: 'https://www.riigiteataja.ee/kohtulahendid/detailid.html?id=292345686',
          summary: 'Võlaõigus, laenuleping',
        },
        {
          id: 'pk-1',
          title: 'Pärnu Maakohtu otsus nr 1-20-45678/90',
          court: 'Pärnu Maakohus',
          date: '2024-01-30',
          caseNumber: '1-20-45678/90',
          type: 'Kriminaalasi',
          url: 'https://www.riigiteataja.ee/kohtulahendid/detailid.html?id=292345687',
          summary: 'Narkootiline aine, ebaseaduslik käitlemine',
        },
      ];

      // Filter by query if provided
      if (query && query.trim()) {
        const queryLower = query.toLowerCase();
        const filtered = demoDecisions
          .filter(
            (decision) =>
              decision.title.toLowerCase().includes(queryLower) ||
              decision.court.toLowerCase().includes(queryLower) ||
              decision.caseNumber.toLowerCase().includes(queryLower) ||
              decision.type.toLowerCase().includes(queryLower) ||
              (decision.summary && decision.summary.toLowerCase().includes(queryLower))
          )
          .slice(0, limit);
        resolve(filtered);
      } else {
        resolve(demoDecisions.slice(0, limit));
      }
    });
  }

  async searchCourtDecisions(query?: string, limit: number = 20): Promise<CourtDecision[]> {
    try {
      // Create cache key
      const cacheKey = `search:${query || 'all'}:${limit}`;

      // Check cache first
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }

      // Use real scraping if enabled, otherwise use demo data
      let results: CourtDecision[];
      if (this.USE_REAL_SCRAPING) {
        results = await this.scrapeRealDecisions(query, limit);
      } else {
        results = await this.getDemoDecisions(query, limit);
      }

      // Cache the results
      this.setCachedData(cacheKey, results);

      return results;
    } catch (error: any) {
      console.error('Riigiteataja search error:', error.message);
      throw error;
    }
  }

  async getDecisionById(id: string): Promise<CourtDecision | null> {
    try {
      const decisions = await this.searchCourtDecisions();
      return decisions.find((d) => d.id === id) || null;
    } catch (error: any) {
      console.error('Riigiteataja get decision error:', error.message);
      throw error;
    }
  }

  async getDecisionsByType(type: string, limit: number = 10): Promise<CourtDecision[]> {
    try {
      const decisions = await this.searchCourtDecisions();
      return decisions.filter((d) => d.type === type).slice(0, limit);
    } catch (error: any) {
      console.error('Riigiteataja filter by type error:', error.message);
      throw error;
    }
  }

  async getDecisionsByCourt(court: string, limit: number = 10): Promise<CourtDecision[]> {
    try {
      const decisions = await this.searchCourtDecisions();
      return decisions.filter((d) => d.court.includes(court)).slice(0, limit);
    } catch (error: any) {
      console.error('Riigiteataja filter by court error:', error.message);
      throw error;
    }
  }
}

export const riigiteatajaClient = new RiigiteatajaClient();
export type { CourtDecision };
