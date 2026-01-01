import { useState, useEffect } from 'react';
import { CryptoData } from '../types';

export const useCryptoData = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ws: WebSocket | null = null;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');

        ws.onopen = () => {
          console.log('Connected to Binance WebSocket');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (Array.isArray(data)) {
              // Filter top 15 cryptocurrencies
              const topCryptos = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT', 'SOLUSDT', 'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'SHIBUSDT', 'MATICUSDT', 'LTCUSDT', 'ATOMUSDT', 'LINKUSDT', 'ETCUSDT'];

              const filteredData = data
                .filter((item: any) => topCryptos.includes(item.s))
                .map((item: any) => ({
                  symbol: item.s.replace('USDT', ''),
                  price: parseFloat(item.c).toFixed(2),
                  priceChange: parseFloat(item.P).toFixed(2),
                  priceChangePercent: parseFloat(item.P).toFixed(2),
                  volume: parseFloat(item.v).toFixed(0),
                  marketCap: (parseFloat(item.c) * parseFloat(item.v)).toFixed(0),
                }));

              setCryptoData(filteredData);
              setLoading(false);
            }
          } catch (error) {
            console.error('Error parsing WebSocket data:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket connection closed');
          // Reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        setLoading(false);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return { cryptoData, loading };
};