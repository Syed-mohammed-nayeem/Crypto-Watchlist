import axios from 'axios';
import { Cryptocurrency } from '../types';
import { BINANCE_WS_URL, BINANCE_API_URL } from './base-service'


export const searchCryptocurrencies = async (query: string): Promise<Cryptocurrency[]> => {
  try {
    const response = await axios.get(`${BINANCE_API_URL}/ticker/24hr`);
    return response.data
      .filter((coin: any) => 
        coin.symbol.toLowerCase().includes(query.toLowerCase()) &&
        coin.symbol.endsWith('USDT')
      )
      .slice(0, 10)
      .map((coin: any) => ({
        symbol: coin.symbol.replace('USDT', ''),
        name: coin.symbol.replace('USDT', ''),
        price: parseFloat(coin.lastPrice),
        priceChange24h: parseFloat(coin.priceChangePercent),
        volume24h: parseFloat(coin.volume),
        marketCap: parseFloat(coin.quoteVolume)
      }));
  } catch (error) {
    console.error('Error searching cryptocurrencies:', error);
    return [];
  }
};

export const createWebSocketConnection = (
  symbols: string[],
  onMessage: (data: any) => void
) => {
  const ws = new WebSocket(BINANCE_WS_URL);
  
  ws.onopen = () => {
    const subscribeMessage = {
      method: 'SUBSCRIBE',
      params: symbols.map(symbol => `${symbol.toLowerCase()}usdt@ticker`),
      id: 1
    };
    ws.send(JSON.stringify(subscribeMessage));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  return ws;
};