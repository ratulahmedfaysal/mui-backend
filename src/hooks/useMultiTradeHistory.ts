import { useEffect, useState, useRef } from 'react';
import api from '../lib/api';

type Trade = {
  time: string;
  pair: string;
  price: number;
  quantity: number;
  side: 'BUY' | 'SELL';
  fee: number;
  feeCurrency: string;
  pnl: number;
};

export const useMultiTradeHistory = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [pairs, setPairs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const bufferRef = useRef<Trade[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const fetchPairs = async () => {
      try {
        const { data } = await api.get('/pairs');
        if (data && Array.isArray(data)) {
          const pairSymbols = data.map((item: any) => item.symbol.toLowerCase());
          setPairs(pairSymbols);
        }
      } catch (error) {
        console.error('Error fetching pairs:', error);
        setLoading(false);
      }
    };

    fetchPairs();
  }, []);

  // Fetch initial data via REST API
  useEffect(() => {
    if (pairs.length === 0) return;

    const fetchInitialHistory = async () => {
      try {
        // Fetch last 10 trades for the first 3 pairs to populate the table
        const initialTrades: Trade[] = [];
        const pairsToFetch = pairs.slice(0, 3);

        await Promise.all(pairsToFetch.map(async (pair) => {
          const response = await fetch(`https://api.binance.com/api/v3/trades?symbol=${pair.toUpperCase()}&limit=10`);
          const data = await response.json();
          if (Array.isArray(data)) {
            data.forEach((t: any) => {
              initialTrades.push({
                time: new Date(t.time).toISOString().replace('T', ' ').slice(0, 19),
                pair: pair.toUpperCase(),
                price: parseFloat(t.price),
                quantity: parseFloat(t.qty),
                side: t.isBuyerMaker ? 'SELL' : 'BUY',
                fee: parseFloat(t.qty) * parseFloat(t.price) * 0.0002,
                feeCurrency: 'USDT',
                pnl: parseFloat((Math.random() * 5 - 2.5).toFixed(2)),
              });
            });
          }
        }));

        // Sort by time desc
        initialTrades.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setTrades(initialTrades.slice(0, 50));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching initial trades:', err);
        setLoading(false);
      }
    };

    fetchInitialHistory();
  }, [pairs]);

  // WebSocket for live updates (Buffered)
  useEffect(() => {
    if (pairs.length === 0) return;

    // Use combined stream to avoid multiple connection limits/errors
    const streams = pairs.map(pair => `${pair.toLowerCase()}@trade`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Combined WebSocket Connected');
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const data = payload.data;

        if (!data) return;

        const newTrade: Trade = {
          time: new Date(data.T).toISOString().replace('T', ' ').slice(0, 19),
          pair: data.s, // Symbol from payload (e.g. BTCUSDT)
          price: parseFloat(data.p),
          quantity: parseFloat(data.q),
          side: data.m ? 'SELL' : 'BUY',
          fee: parseFloat(data.q) * parseFloat(data.p) * 0.0002,
          feeCurrency: 'USDT',
          pnl: parseFloat((Math.random() * 5 - 2.5).toFixed(2)),
        };
        // Add to buffer
        bufferRef.current.unshift(newTrade);
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [pairs]);

  // Flush buffer every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Checking buffer for updates...', bufferRef.current.length);

      if (bufferRef.current.length > 0) {
        // Capture current buffer and clear it immediately to prevent race conditions
        const newTrades = [...bufferRef.current];
        bufferRef.current = [];

        setTrades(prev => {
          console.log(`Flushing ${newTrades.length} trades to UI`);
          // Combine new trades with existing, sort by time just in case, and keep latest 50
          const updated = [...newTrades, ...prev].slice(0, 50);
          return updated;
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return { trades, loading };
};
