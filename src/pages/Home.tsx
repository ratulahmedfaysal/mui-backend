import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';
import {
  ArrowRight, Shield, TrendingUp, Users, Globe, Star,
  UserPlus, PieChart, Zap, Headphones, Percent, DollarSign, Activity, Lock,
  Calculator, Bitcoin, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

import { InvestmentPlan } from '../types';
import api from '../lib/api';

import { Skeleton } from '../components/ui/Skeleton';

const Home: React.FC = () => {
  const { settings, loading: settingsLoading, updateSettings } = useSiteSettings();
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [calculatorAmount, setCalculatorAmount] = useState<number>(1000);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  // TEMPORARY: Force update Why Choose Us data in database if it matches old data
  useEffect(() => {
    if (!settingsLoading && settings.whyChooseUs && settings.whyChooseUs[0]?.title !== 'Institutional-Grade AI') {
      console.log('Migrating Why Choose Us data...');
      updateSettings('whyChooseUs', [
        { id: '1', title: 'Institutional-Grade AI', description: 'Access the same high-frequency trading algorithms used by top hedge funds, now available for personal investing.', icon: 'Zap' },
        { id: '2', title: 'Secure Capital Protection', description: 'Advanced risk management systems and insurance protocols ensure your principal investment is always safeguarded.', icon: 'Lock' },
        { id: '3', title: 'Daily Automated Payouts', description: 'Profits are credited to your account every 24 hours. Withdraw your earnings instantly to your crypto wallet.', icon: 'DollarSign' },
        { id: '4', title: 'Complete Transparency', description: 'Track every trade in real-time. Detailed performance reports show you exactly how your money is working.', icon: 'Activity' },
      ]);
    }
  }, [settingsLoading, settings.whyChooseUs, updateSettings]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/investment-plans');
      /* Backend returns all active plans sorted by min_amount by default? 
         Let's check backend: .find({ is_active: true }).sort({ min_amount: 1 }) -> YES
      */

      if (data) {
        const mappedPlans = data.map((p: any) => ({ ...p, id: p._id || p.id }));
        setPlans(mappedPlans.slice(0, 6));
        if (mappedPlans.length > 0) setSelectedPlanId(mappedPlans[0].id);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setPlansLoading(false);
    }
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const dailyProfit = selectedPlan ? (calculatorAmount * selectedPlan.daily_roi_percentage / 100) : 0;
  const totalReturn = selectedPlan ? dailyProfit * selectedPlan.duration_days : 0;

  useEffect(() => {
    if (selectedPlan) {
      setCalculatorAmount(selectedPlan.min_amount);
    }
  }, [selectedPlan?.id]);


  const iconMap: any = {
    TrendingUp, Shield, Users, Globe, UserPlus, PieChart, Zap, Headphones, Percent, DollarSign, Activity, Lock, Bitcoin, Layers
  };

  // Live Trades Data (Mock)
  const [liveTrades, setLiveTrades] = useState([
    { pair: 'BTC/USDT', type: 'buy', amount: '0.45', profit: '+$1,250.00', time: 'Just now' },
    { pair: 'ETH/USDT', type: 'sell', amount: '4.20', profit: '+$850.50', time: '2s ago' },
    { pair: 'XRP/USDT', type: 'buy', amount: '15000', profit: '+$320.00', time: '5s ago' },
    { pair: 'SOL/USDT', type: 'buy', amount: '150', profit: '+$450.25', time: '8s ago' },
    { pair: 'ADA/USDT', type: 'sell', amount: '5000', profit: '+$180.00', time: '12s ago' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'BNB/USDT'];
      const types = ['buy', 'sell'];
      const newTrade = {
        pair: pairs[Math.floor(Math.random() * pairs.length)],
        type: types[Math.floor(Math.random() * types.length)] as string,
        amount: (Math.random() * 10).toFixed(2),
        profit: `+$${(Math.random() * 500 + 50).toFixed(2)}`,
        time: 'Just now'
      };

      setLiveTrades(prev => [newTrade, ...prev.slice(0, 4)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);



  const stats = [
    { label: 'Active Traders', value: '25K+' },
    { label: 'Total Volume', value: '$150M+' },
    { label: 'Win Rate', value: '87%' },
    { label: 'Markets', value: '100+' },
  ];

  // if (loading) return null; // Using default settings instead


  // Market Ticker Data
  const marketPairs = [
    { pair: 'BTC/USD', price: '47,250.00', change: '+2.4%' },
    { pair: 'ETH/USD', price: '3,450.50', change: '+1.8%' },
    { pair: 'EUR/USD', price: '1.0920', change: '+0.1%' },
    { pair: 'GBP/USD', price: '1.2650', change: '-0.2%' },
    { pair: 'XAU/USD', price: '2,045.00', change: '+0.5%' },
    { pair: 'USD/JPY', price: '148.50', change: '+0.3%' },
    { pair: 'SOL/USD', price: '105.20', change: '+5.1%' },
    { pair: 'ADA/USD', price: '0.5520', change: '+1.2%' },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Market Ticker */}
      <div className="bg-gray-900 text-white py-2 overflow-hidden border-b border-gray-800">
        <motion.div
          className="flex space-x-8 whitespace-nowrap"
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          {[...marketPairs, ...marketPairs, ...marketPairs].map((item, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <span className="font-bold text-gray-400">{item.pair}</span>
              <span className="font-mono">{item.price}</span>
              <span className={item.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
                {item.change}
              </span>
            </div>
          ))}
        </motion.div>
      </div>


      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center space-x-2 bg-orange-500/20 px-4 py-2 rounded-full mb-6">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">{settings.hero.tagline}</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {settingsLoading ? <Skeleton width="80%" height={60} /> : settings.hero.title}
              </h1>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {settingsLoading ? (
                  <>
                    <Skeleton width="100%" height={24} className="mb-2" />
                    <Skeleton width="90%" height={24} />
                  </>
                ) : (
                  settings.hero.subtitle
                )}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 shadow-lg"
                >
                  {settings.hero.ctaPrimary}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/plans"
                  className="inline-flex items-center px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200"
                >
                  {settings.hero.ctaSecondary}
                </Link>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold text-orange-400">{stat.value}</div>
                    <div className="text-sm text-gray-300">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="hidden lg:flex justify-center"
            >
              <div className="w-full max-w-md mx-auto">
                <Player
                  autoplay
                  loop
                  src="/Cryptocurrency Lottie Animation.json"
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Plans Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Featured Trading Strategies</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose from our expertly managed algorithmic trading portfolios.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
            {plansLoading ? (
              // Loading Skeletons for Plans
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-full">
                      <Skeleton width="60%" height={32} className="mb-2" />
                      <Skeleton width="40%" height={20} />
                    </div>
                  </div>
                  <Skeleton width="50%" height={48} className="mb-8" />
                  <div className="space-y-4 mb-8">
                    <Skeleton width="100%" height={24} />
                    <Skeleton width="100%" height={24} />
                    <Skeleton width="100%" height={24} />
                  </div>
                  <Skeleton width="100%" height={56} className="rounded-xl" />
                </div>
              ))
            ) : (
              // Actual Plans Data
              plans.slice(0, 3).map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-orange-500/50 transition-colors"
                >
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{plan.subtitle}</p>
                      </div>
                      <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-1 rounded-full text-sm font-semibold">
                        {plan.duration_days} Days
                      </div>
                    </div>

                    <div className="flex items-baseline mb-8">
                      <span className="text-4xl font-bold text-orange-600 dark:text-orange-500">{plan.daily_roi_percentage}%</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">Daily ROI</span>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Min Investment</span>
                        <span className="font-semibold text-gray-900 dark:text-white">${plan.min_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Max Investment</span>
                        <span className="font-semibold text-gray-900 dark:text-white">${plan.max_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Capital Return</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">{plan.return_principal ? 'Yes' : 'No'}</span>
                      </div>
                    </div>

                    <Link
                      to="/plans"
                      className="w-full block text-center py-4 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-white font-semibold hover:opacity-90 transition-opacity"
                    >
                      Start Strategy
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="text-center">
            <Link
              to="/plans"
              className="inline-flex items-center px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
            >
              View all Strategies
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Profit Calculator Section */}
      <section className="py-20 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Estimate Your Earnings</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Use our profit calculator to see exactly how much passive income you could be earning with our AI trading bots.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calculator className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Transparent Returns</h3>
                    <p className="text-gray-600 dark:text-gray-400">No hidden fees or complicated formulas. What you see is what you earn.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Compound Growth</h3>
                    <p className="text-gray-600 dark:text-gray-400">Reinvest your daily profits to accelerate your wealth accumulation.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Investment Strategy
                  </label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white"
                  >
                    {plans.map(plan => (
                      <option key={plan.id} value={plan.id}>{plan.name} ({plan.daily_roi_percentage}% Daily)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Investment Amount ($)
                  </label>
                  <input
                    type="number"
                    value={calculatorAmount}
                    onChange={(e) => setCalculatorAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="Enter amount..."
                  />
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Daily Profit</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${dailyProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Return</div>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      ${totalReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-center text-gray-500 mt-4">
                  * Calculations are estimates based on the selected plan's ROI and duration.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{settings.section_headers.about.title}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {settings.section_headers.about.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center mb-6">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Algorithmic Trading</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our proprietary AI bots trade 24/7 across major Forex pairs and Crypto markets, capturing opportunities that human traders miss.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-8 rounded-xl">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Global Markets</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We provide access to liquid markets worldwide, ensuring your capital is working in the most profitable environments continuously.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Proven Returns</h3>
              <p className="text-gray-600 dark:text-gray-300">
                5+ years of verified trading history. Our strategy minimizes drawdown while maximizing yield through smart diversification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Trades Section */}
      <section className="py-20 bg-gray-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Live Market Performance</h2>
              <p className="text-gray-400 mb-8 text-lg">
                Watch our AI algorithms executing profitable trades in real-time across global markets.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-medium">System Online & Trading</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Activity className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-300">24/7 High-Frequency Execution</span>
                </div>
              </div>

              <div className="mt-10 p-6 bg-gray-800 rounded-2xl border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">Total Profit Paid (24h)</span>
                  <span className="text-2xl font-bold text-green-400">{settings.livePerformance?.totalProfitPaid || '$1,245,890.00'}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-2xl">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                Recent Winning Trades
              </h3>
              <div className="space-y-4 h-[340px] overflow-y-auto pr-2 custom-scrollbar relative">
                <AnimatePresence mode='popLayout'>
                  {liveTrades.map((trade, index) => (
                    <motion.div
                      key={`${trade.pair}-${index}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-between items-center p-4 bg-gray-700/50 rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {trade.type === 'buy' ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 transform rotate-180" />}
                        </div>
                        <div>
                          <div className="font-bold">{trade.pair}</div>
                          <div className="text-xs text-gray-400">{trade.type.toUpperCase()} • {trade.amount}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-400">{trade.profit}</div>
                        <div className="text-xs text-gray-500">{trade.time}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{settings.section_headers.how_it_works.title}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {settings.section_headers.how_it_works.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {settings.howItWorks.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center">
                    {item.description}
                  </p>
                </div>
                {index < settings.howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-orange-500 to-yellow-500 transform -translate-y-1/2"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Asset Diversification (New Section) */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white relative overflow-hidden">
        {/* Abstract shapes/glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Strategic Asset Diversification</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our AI doesn't just trade one market. We minimize risk and maximize yields by spreading exposure across three uncorrelated, high-liquidity asset classes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {settings.diversificationItems?.map((item, index) => {
              const Icon = iconMap[item.icon] || Layers;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors"
                >
                  <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-400 mb-4">
                    {item.description}
                  </p>
                  <ul className="space-y-2">
                    {item.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-300">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{settings.section_headers.why_choose_us.title}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {settings.section_headers.why_choose_us.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {settingsLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center p-4">
                  <Skeleton variant="circular" width={64} height={64} className="mx-auto mb-6" />
                  <Skeleton width="60%" height={24} className="mx-auto mb-4" />
                  <Skeleton width="90%" height={48} className="mx-auto" />
                </div>
              ))
            ) : (
              settings.whyChooseUs.map((feature, index) => {
                const Icon = iconMap[feature.icon] || Shield;
                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{settings.section_headers.investor_reviews.title}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {settings.section_headers.investor_reviews.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {settingsLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center mb-4">
                    <Skeleton variant="circular" width={48} height={48} className="mr-4" />
                    <div className="flex-1">
                      <Skeleton width="50%" height={20} className="mb-2" />
                      <Skeleton width="30%" height={16} />
                    </div>
                  </div>
                  <Skeleton width="100%" height={16} className="mb-2" />
                  <Skeleton width="90%" height={16} />
                </div>
              ))
            ) : (
              settings.reviews.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.comment}"</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-14 bg-gradient-to-br from-[#1e1e2f] via-[#2b2d42] to-[#1e1e2f] text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              {settings.section_headers.cta.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-200 max-w-md mx-auto md:mx-0">
              {settings.section_headers.cta.subtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-medium hover:opacity-90 transition duration-300"
            >
              {settings.section_headers.cta.buttonText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Background Glow Effects (original theme) */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-purple-700 opacity-30 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-500 opacity-20 rounded-full blur-3xl -z-10 animate-pulse" />
      </section>



    </div>
  );
};

export default Home;