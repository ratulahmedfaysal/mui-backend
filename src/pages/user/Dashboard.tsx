import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Users,
  Copy,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

// import { useTradeHistory } from '../../hooks/useTradeHistory';
// import { useBtcTradeHistory } from '../../hooks/useBtcTradeHistory';
import { useMultiTradeHistory } from '../../hooks/useMultiTradeHistory';

import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Dashboard: React.FC = () => {
  // const { btcTrades } = useBtcTradeHistory();

  // const { trades } = useMultiTradeHistory();

  const { user, logout } = useAuth();

  const { trades, loading: tradesLoading } = useMultiTradeHistory();



  const [stats, setStats] = useState({
    totalInvested: 0,
    roiEarned: 0,
    walletBalance: 0,
    activePlans: 0,
  });
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Trading Chart State
  const [pairs, setPairs] = useState<Array<{ id: string, symbol: string }>>([]);
  const [selectedPair, setSelectedPair] = useState('BTCUSDT');

  useEffect(() => {
    if (user) {
      checkUserBanStatus();
      fetchDashboardData();
      fetchPairs();
    }
  }, [user]);

  const fetchPairs = async () => {
    try {
      const { data } = await api.get('/pairs');

      if (data && data.length > 0) {
        setPairs(data);
        // Set default to BTCUSDT if available, otherwise first pair
        const btcPair = data.find((p: any) => p.symbol.toUpperCase() === 'BTCUSDT');
        setSelectedPair(btcPair ? btcPair.symbol.toUpperCase() : data[0].symbol.toUpperCase());
      }
    } catch (error) {
      console.error('Error fetching pairs:', error);
    }
  };





  const checkUserBanStatus = async () => {
    // Ban status is now checked via AuthContext or /auth/me, but we can double check or rely on initial load
    // If we want to check strictly:
    if (user?.is_banned) {
      alert('Your account has been banned. Logging you out.');
      await logout();
      window.location.href = '/login';
    }
  };




  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get user stats via investments endpoint
      const { data: investments } = await api.get('/investments');

      const totalInvested = investments?.reduce((sum: number, inv: any) => sum + inv.amount, 0) || 0;
      const roiEarned = investments?.reduce((sum: number, inv: any) => sum + inv.total_roi_earned, 0) || 0;
      const activePlans = investments?.filter((inv: any) => inv.status === 'active').length || 0;

      setStats({
        totalInvested,
        roiEarned,
        walletBalance: user?.balance || 0,
        activePlans,
      });

      setReferralCode(user?.referral_code || '');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy referral code:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.full_name}!</h1>
        <p className="text-purple-100">Here's your investment overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Invested</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalInvested)}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ROI Earned</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.roiEarned)}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Wallet Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.walletBalance)}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Plans</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.activePlans}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Referral Code */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Referral Code</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1 flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
            <span className="text-lg font-mono text-gray-900 dark:text-white">{referralCode}</span>
          </div>
          <button
            onClick={copyReferralCode}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Trading Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Trading Chart</h2>
        <div className="mb-4">
          <label className="text-gray-700 dark:text-gray-300 mr-2">Select Pair:</label>
          <select
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
            className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
          >
            {pairs.length > 0 ? (
              pairs.map((pair) => (
                <option key={pair.id} value={pair.symbol.toUpperCase()}>
                  {pair.symbol.toUpperCase()}
                </option>
              ))
            ) : (
              <option value="BTCUSDT">BTCUSDT</option>
            )}
          </select>
        </div>
        <div className="w-full h-[500px] mt-4">
          <iframe
            className="w-full h-full rounded-lg"
            src={`https://www.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${selectedPair}&interval=30&theme=dark&style=1&locale=en`}
            frameBorder="0"
            allowFullScreen
            title="TradingView Chart"
          ></iframe>
        </div>
      </div>

      {/* Crypto Market Data */}
      {/* BTC/USDT Trade History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Market Trade History</h2>


        {tradesLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (



          <div className="overflow-x-auto rounded-lg shadow max-h-[600px]">

            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                <tr>
                  {[
                    "Time (UTC)", "Pair", "Side", "Price", "Quantity", "Transaction",
                    "Amount", "Fee", "Fee Currency", "PnL", "Denominated Asset"
                  ].map((heading, i) => (
                    <th
                      key={i}
                      className="py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-200 text-left whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {trades.map((trade, i) => (
                  <tr
                    key={i}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
                      }`}
                  >
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{trade.time}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{trade.pair}</td>
                    <td className={`py-3 px-4 text-sm font-medium ${trade.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.side}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-gray-300">
                      {trade.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-gray-300">
                      {trade.quantity.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-sm text-center text-gray-700 dark:text-gray-300">Market</td>
                    <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-gray-300">
                      {(trade.price * trade.quantity).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-gray-300">
                      -{trade.fee.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-sm text-center text-gray-700 dark:text-gray-300">{trade.feeCurrency}</td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-medium ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                    >
                      {trade.pnl.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-center text-gray-700 dark:text-gray-300">USDT</td>
                  </tr>
                ))}
              </tbody>
            </table>



          </div>

        )}


      </div>



    </div>
  );
};

export default Dashboard;