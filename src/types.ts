/**
 * Type definitions for Alpha Vantage API and application data structures
 */

export interface StockData {
  ticker: string;
  price: string;
  change_amount: string;
  change_percentage: string;
  volume: string;
}

export interface AlphaVantageResponse {
  metadata: string;
  last_updated: string;
  top_gainers: StockData[];
  top_losers: StockData[];
  most_actively_traded: StockData[];
}

export interface TopMoversData {
  top_gainers: StockData[];
  top_losers: StockData[];
  most_actively_traded: StockData[];
  last_updated: string;
}

export interface ToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
  structuredContent?: TopMoversData;
  _meta?: any;
  isError?: boolean;
}
