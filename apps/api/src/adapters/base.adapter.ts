/**
 * Base Source Adapter Interface
 * 
 * All source adapters (LPSE, BUMN, Corporate, etc.) must implement this interface.
 * This provides a plugin-like architecture for adding new tender data sources.
 */

export interface CrawlResult {
  /** Unique identifier from the source system */
  externalId: string;
  /** Full URL to the tender page */
  url: string;
  /** Tender title */
  title: string;
  /** Organization/institution name that published the tender */
  organizationName?: string;
  /** Budget in IDR */
  budget?: number;
  /** Category or classification */
  category?: string;
  /** Subcategory */
  subcategory?: string;
  /** Procurement type: lelang, seleksi, pengadaan_langsung */
  procurementType?: string;
  /** Region/province */
  region?: string;
  /** Province */
  province?: string;
  /** City */
  city?: string;
  /** Qualification requirements */
  qualification?: string;
  /** Eligibility text */
  eligibility?: string;
  /** Registration deadline */
  registrationDeadline?: Date;
  /** Submission deadline */
  submissionDeadline?: Date;
  /** Status: open, closed, cancelled, awarded */
  status?: string;
  /** Raw HTML or JSON data from the source */
  rawData?: Record<string, unknown>;
}

export interface AdapterConfig {
  /** Base URL of the source */
  baseUrl: string;
  /** Custom configuration for this adapter */
  config?: Record<string, unknown>;
  /** Maximum number of pages to crawl per run */
  maxPages?: number;
  /** Delay between requests in ms */
  requestDelay?: number;
}

export interface CrawlStats {
  itemsFound: number;
  itemsNew: number;
  itemsUpdated: number;
  errors: string[];
  startedAt: Date;
  completedAt?: Date;
}

export abstract class BaseAdapter {
  protected name: string;
  protected adapterType: string;
  protected config: AdapterConfig;

  constructor(name: string, adapterType: string, config: AdapterConfig) {
    this.name = name;
    this.adapterType = adapterType;
    this.config = config;
  }

  /**
   * Crawl the source and return discovered tender items.
   * Each adapter implements its own crawling strategy.
   */
  abstract crawl(): Promise<CrawlResult[]>;

  /**
   * Check if the source is reachable and healthy.
   * Returns true if the source responds correctly.
   */
  abstract healthCheck(): Promise<boolean>;

  /**
   * Get adapter metadata for logging/monitoring
   */
  getInfo() {
    return {
      name: this.name,
      adapterType: this.adapterType,
      baseUrl: this.config.baseUrl,
    };
  }

  /**
   * Generate a content hash for deduplication.
   * Uses title + externalId + organizationName as the hash input.
   */
  protected generateContentHash(item: CrawlResult): string {
    const crypto = require('crypto');
    const content = `${item.externalId}|${item.title}|${item.organizationName || ''}|${item.budget || ''}`;
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}
