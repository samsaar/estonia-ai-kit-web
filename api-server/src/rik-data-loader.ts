import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import iconv from 'iconv-lite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CompanyData {
  name: string;
  registry_code: string;
  status: string;
  status_text: string;
  address: string;
  founded?: string;
}

class RIKDataLoader {
  private companies: Map<string, CompanyData> = new Map();
  private nameIndex: Map<string, string[]> = new Map();
  private loaded = false;
  private loading = false;

  async loadData(): Promise<void> {
    if (this.loaded || this.loading) return;

    this.loading = true;
    console.log('Loading RIK Open Data...');

    const csvPath = path.join(__dirname, '../ettevotja_rekvisiidid__lihtandmed.csv');

    if (!fs.existsSync(csvPath)) {
      console.error('RIK CSV file not found:', csvPath);
      this.loading = false;
      return;
    }

    return new Promise((resolve, reject) => {
      let count = 0;

      fs.createReadStream(csvPath)
        .pipe(iconv.decodeStream('utf-8'))
        .pipe(csv({ separator: ';' }))
        .on('data', (row: any) => {
          try {
            // Handle BOM and different column name formats
            const name = row.nimi || row[' nimi'] || row.NIMI || '';
            const registryCode = row.ariregistri_kood || row.ARIREGISTRI_KOOD || '';
            const status = row.ettevotja_staatus || row.ETTEVOTJA_STAATUS || '';
            const statusText =
              row.ettevotja_staatus_tekstina || row.ETTEVOTJA_STAATUS_TEKSTINA || '';
            const address = row.ettevotja_aadress || row.ETTEVOTJA_AADRESS || '';

            if (name && registryCode) {
              const company: CompanyData = {
                name: name.trim(),
                registry_code: registryCode.trim(),
                status: status.trim(),
                status_text: statusText.trim(),
                address: address.trim(),
              };

              // Store by registry code
              this.companies.set(registryCode.trim(), company);

              // Index by name (lowercase for search)
              const nameLower = name.toLowerCase().trim();
              const words = nameLower.split(/\s+/);

              words.forEach((word: string) => {
                if (word.length >= 2) {
                  if (!this.nameIndex.has(word)) {
                    this.nameIndex.set(word, []);
                  }
                  this.nameIndex.get(word)!.push(registryCode.trim());
                }
              });

              count++;
              if (count % 50000 === 0) {
                console.log(`Loaded ${count} companies...`);
              }
            }
          } catch (error) {
            // Skip malformed rows
          }
        })
        .on('end', () => {
          this.loaded = true;
          this.loading = false;
          console.log(`✅ Loaded ${count} companies from RIK Open Data`);
          resolve();
        })
        .on('error', (error) => {
          console.error('Error loading RIK data:', error);
          this.loading = false;
          reject(error);
        });
    });
  }

  searchCompanies(query: string, limit: number = 10): CompanyData[] {
    if (!this.loaded) {
      return [];
    }

    const queryLower = query.toLowerCase().trim();
    const scoredResults = new Map<string, number>();

    // Search by words in query
    const words = queryLower.split(/\s+/).filter((w) => w.length >= 2);

    // First pass: exact matches and starts-with matches (high priority)
    for (const [code, company] of this.companies.entries()) {
      const nameLower = company.name.toLowerCase();
      let score = 0;

      // Exact name match - highest priority
      if (nameLower === queryLower) {
        score = 1000;
      }
      // Name starts with query - very high priority
      else if (nameLower.startsWith(queryLower)) {
        score = 500;
      }
      // Name contains query as whole phrase - high priority
      else if (nameLower.includes(queryLower)) {
        score = 250;
      }
      // Word-by-word matching
      else {
        let matchedWords = 0;
        let startsWithMatch = false;

        for (const word of words) {
          if (nameLower.includes(word)) {
            matchedWords++;
            if (nameLower.startsWith(word)) {
              startsWithMatch = true;
            }
          }
        }

        if (matchedWords > 0) {
          score = matchedWords * 10;
          if (startsWithMatch) {
            score += 50;
          }
          // Bonus if all words match
          if (matchedWords === words.length) {
            score += 100;
          }
        }
      }

      if (score > 0) {
        scoredResults.set(code, score);
      }

      // Stop if we have enough high-quality results
      if (scoredResults.size >= limit * 10) {
        break;
      }
    }

    // Sort by score (descending) and get company data
    const companies = Array.from(scoredResults.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([code]) => this.companies.get(code))
      .filter((c): c is CompanyData => c !== undefined);

    return companies;
  }

  getCompanyByCode(registryCode: string): CompanyData | undefined {
    return this.companies.get(registryCode.trim());
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  getStats() {
    return {
      total_companies: this.companies.size,
      indexed_words: this.nameIndex.size,
      loaded: this.loaded,
    };
  }
}

// Singleton instance
export const rikDataLoader = new RIKDataLoader();

// Start loading immediately
rikDataLoader.loadData().catch(console.error);
