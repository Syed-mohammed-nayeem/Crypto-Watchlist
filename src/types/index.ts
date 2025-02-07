export interface Cryptocurrency {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
}

export interface Watchlist {
  id: string;
  name: string;
  coins: Cryptocurrency[];
}