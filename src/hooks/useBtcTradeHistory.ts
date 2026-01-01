import { useEffect, useState } from 'react';

type Trade = {
  price: string;
  amount: string;
  time: number;
  value: number;
  isBuyerMaker: boolean;
};

export const useBtcTradeHistory = () => {
  const [btcTrades, setBtcTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const trade: Trade = {
        price: parseFloat(data.p).toFixed(2),
        amount: parseFloat(data.q).toFixed(6),
        time: data.T,
        value: parseFloat((parseFloat(data.p) * parseFloat(data.q)).toFixed(2)),
        isBuyerMaker: data.m,
      };

      setBtcTrades((prev) => {
        const updated = [trade, ...prev];
        return updated.slice(0, 50); // Limit to 50 rows
      });
    };

    return () => {
      ws.close();
    };
  }, []);

  return { btcTrades };
};
