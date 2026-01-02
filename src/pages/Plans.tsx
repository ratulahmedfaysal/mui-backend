import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { InvestmentPlan } from '../types';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/investment-plans');
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (index: number) => {
    const colors = [
      'from-green-500 to-emerald-500',
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-indigo-500',
      'from-orange-500 to-yellow-500',
      'from-pink-500 to-rose-500',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Investment Plans
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose the perfect investment plan that matches your goals. All plans offer daily returns
              and instant withdrawals with no hidden fees.
            </p>
          </motion.div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {/* Plan Header */}
              <div className={`bg-gradient-to-r ${getPlanColor(index)} p-8 text-white`}>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-white/90 mb-4">{plan.subtitle}</p>
                  <div className="text-4xl font-bold mb-2">{plan.daily_roi_percentage}%</div>
                  <div className="text-white/90">Daily Returns</div>
                </div>
              </div>

              {/* Plan Details */}
              <div className="p-8">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 dark:text-gray-400">Min Investment</span>
                    <span className="font-bold text-gray-900 dark:text-white">${plan.min_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 dark:text-gray-400">Max Investment</span>
                    <span className="font-bold text-gray-900 dark:text-white">${plan.max_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 dark:text-gray-400">Duration</span>
                    <span className="font-bold text-gray-900 dark:text-white">{plan.duration_days} Days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Return</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {(plan.daily_roi_percentage * plan.duration_days).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-gray-600 dark:text-gray-400">Capital Return</span>
                    <span className={`font-bold ${plan.return_principal ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      {plan.return_principal ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Features</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="text-center">
                  {user ? (
                    <Link
                      to={`/user/plans?plan=${plan.id}`}
                      className={`inline-flex items-center px-8 py-4 bg-gradient-to-r ${getPlanColor(index)} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 w-full justify-center`}
                    >
                      Invest Now
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  ) : (
                    <Link
                      to="/register"
                      className={`inline-flex items-center px-8 py-4 bg-gradient-to-r ${getPlanColor(index)} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 w-full justify-center`}
                    >
                      Get Started
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Why Choose Our Investment Plans?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Guaranteed Returns</h4>
              <p className="text-gray-600 dark:text-gray-300">
                All investments are backed by our proven revenue streams ensuring consistent daily returns.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Instant Withdrawals</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Withdraw your earnings anytime with our instant withdrawal system - no waiting periods.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">24/7 Support</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Our dedicated support team is available round the clock to assist you with any questions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;