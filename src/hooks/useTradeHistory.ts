import { useEffect, useState } from 'react';

interface TradeRecord {
  pair: string;
  time: string;
  amount: string;
  averagePrice: string;
  transactionValue: string;
  fee: string;
  sltp: string;
  pnl: string;
}

const generateMock = () => {
  const random = (min: number, max: number) => (Math.random() * (max - min) + min).toFixed(2);
  return {
    fee: random(0.01, 0.2),
    sltp: `${random(-2, 2)}%`,
    pnl: `${random(-10, 10)}%`
  };
};

export const useTradeHistory = () => {
  const [tradeHistory, setTradeHistory] = useState<TradeRecord[]>([]);

  useEffect(() => {
    const ws = new WebSocket(
      'wss://stream.binance.com:9443/stream?streams=btcusdt@aggTrade/ethusdt@aggTrade/solusdt@aggTrade'
    );

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const data = msg.data;

      if (data && data.s && data.p && data.q) {
        const pair = data.s;
        const amount = parseFloat(data.q).toFixed(4);
        const avgPrice = parseFloat(data.p).toFixed(2);
        const value = (parseFloat(data.p) * parseFloat(data.q)).toFixed(2);
        const time = new Date(data.T).toLocaleTimeString();
        const { fee, sltp, pnl } = generateMock();

        const newRecord: TradeRecord = {
          pair,
          time,
          amount,
          averagePrice: avgPrice,
          transactionValue: value,
          fee,
          sltp,
          pnl
        };

        setTradeHistory((prev) => [...prev.slice(-49), newRecord]);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return { tradeHistory };
};
