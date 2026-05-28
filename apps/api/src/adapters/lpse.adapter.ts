import { BaseAdapter, type AdapterConfig, type CrawlResult } from './base.adapter.js';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Apply stealth plugin
puppeteer.default.use(StealthPlugin());

/**
 * LPSE Adapter
 * 
 * Crawls Indonesian government e-procurement portals (LPSE/SPSE).
 * LPSE portals expose a JSON API at /dt/lelang endpoint which we leverage
 * for data extraction using a headless browser to bypass WAF/Cloudflare.
 */

interface LpseApiResponse {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: Array<Array<string>>;
  aaData?: Array<Array<string>>;
}

export class LpseAdapter extends BaseAdapter {
  constructor(name: string, config: AdapterConfig) {
    super(name, 'lpse', {
      ...config,
      maxPages: config.maxPages || 5,
      requestDelay: config.requestDelay || 2000,
    });
  }

  async crawl(): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    const pageSize = 50;
    const maxPages = this.config.maxPages || 5;

    console.log(`[LPSE:${this.name}] Launching Puppeteer Stealth Browser...`);
    
    let browser;
    try {
      browser = await puppeteer.default.launch({
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox', 
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process'
        ],
      });
      
      const page = await browser.newPage();
      // Mock common headers
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      });

      for (let p = 0; p < maxPages; p++) {
        const start = p * pageSize;
        const url = `${this.config.baseUrl}/dt/lelang?draw=${p + 1}&columns%5B0%5D%5Bdata%5D=0&start=${start}&length=${pageSize}&search%5Bvalue%5D=`;

        try {
          console.log(`[LPSE:${this.name}] Navigating to: ${url}`);
          // Puppeteer navigates to the JSON endpoint
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
          
          // Extract the JSON text from the body
          const jsonText = await page.evaluate(() => {
            return document.body.innerText || document.body.textContent || '{}';
          });

          const json: LpseApiResponse = JSON.parse(jsonText);
          const rows = json.data || json.aaData || [];

          if (rows.length === 0) {
            break; // No more data
          }

          for (const row of rows) {
            const parsed = this.parseRow(row);
            if (parsed) {
              results.push(parsed);
            }
          }

          // Respect rate limiting
          if (p < maxPages - 1 && rows.length === pageSize) {
            await this.delay(this.config.requestDelay || 2000);
          } else {
            break; // Last page had fewer results
          }
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          console.error(`[LPSE:${this.name}] Error crawling page ${p}: ${errMsg}`);
          break;
        }
      }
    } catch (launchErr) {
      console.error(`[LPSE:${this.name}] Failed to launch browser:`, launchErr);
    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
    }

    console.log(`[LPSE:${this.name}] Crawled ${results.length} tenders from ${this.config.baseUrl}`);
    return results;
  }

  async healthCheck(): Promise<boolean> {
    let browser;
    try {
      browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
      const page = await browser.newPage();
      await page.goto(`${this.config.baseUrl}/dt/lelang?draw=1&start=0&length=1`, {
        waitUntil: 'networkidle2',
        timeout: 15000,
      });
      
      const content = await page.evaluate(() => document.body.innerText);
      JSON.parse(content); // Try parsing
      return true;
    } catch {
      return false;
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  }

  /**
   * Parse a single LPSE data row into a CrawlResult.
   * 
   * LPSE dt/lelang typically returns rows like:
   *  [0] = HTML link with tender ID and title
   *  [1] = Instansi/Agency name
   *  [2] = Tahap/Stage 
   *  [3] = HPS/Budget value
   *  [4] = Kualifikasi
   *  [5] = Metode/Method
   */
  private parseRow(row: Array<string>): CrawlResult | null {
    try {
      if (!row || row.length < 2) return null;

      // Extract tender ID and title from HTML anchor tag in first column
      const titleHtml = row[0] || '';
      const idMatch = titleHtml.match(/\/lelang\/(\d+)\//);
      const titleMatch = titleHtml.match(/>([^<]+)<\/a>/);

      if (!idMatch || !titleMatch) {
        // Try alternative parsing - sometimes it's plain text
        const plainMatch = titleHtml.match(/(\d+)\s*-\s*(.+)/);
        if (!plainMatch) return null;
        
        return {
          externalId: plainMatch[1],
          url: `${this.config.baseUrl}/lelang/${plainMatch[1]}/pengumumanlelang`,
          title: plainMatch[2].trim(),
          organizationName: (row[1] || '').replace(/<[^>]*>/g, '').trim(),
          status: 'open',
          rawData: { row },
        };
      }

      const externalId = idMatch[1];
      const title = titleMatch[1].trim();

      // Parse budget from HPS column (row[3])
      let budget: number | undefined;
      if (row[3]) {
        const budgetStr = row[3].replace(/<[^>]*>/g, '').replace(/[^\d]/g, '');
        const parsed = parseInt(budgetStr, 10);
        if (!isNaN(parsed) && parsed > 0) {
          budget = parsed;
        }
      }

      // Parse organization name (strip HTML tags)
      const orgName = (row[1] || '').replace(/<[^>]*>/g, '').trim();

      // Parse stage/status
      const stage = (row[2] || '').replace(/<[^>]*>/g, '').trim().toLowerCase();
      let status = 'open';
      if (stage.includes('selesai') || stage.includes('evaluasi')) {
        status = 'closed';
      } else if (stage.includes('batal')) {
        status = 'cancelled';
      }

      // Parse qualification
      const qualification = (row[4] || '').replace(/<[^>]*>/g, '').trim();

      // Parse procurement type/method
      const procurementType = (row[5] || '').replace(/<[^>]*>/g, '').trim();

      return {
        externalId,
        url: `${this.config.baseUrl}/lelang/${externalId}/pengumumanlelang`,
        title,
        organizationName: orgName,
        budget,
        qualification: qualification || undefined,
        procurementType: procurementType || undefined,
        status,
        rawData: { row },
      };
    } catch (error) {
      console.warn(`[LPSE:${this.name}] Failed to parse row:`, error);
      return null;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
