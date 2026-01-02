import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserInvestment } from '../../types';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { format } from 'date-fns';

const PlansHistory: React.FC = () => {
  const [investments, setInvestments] = useState<any[]>([]); // Using any for now to handle populated plan
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const { data } = await api.get('/investments');
      setInvestments(data || []);
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (investment: any) => {
    if (investment.is_active) {
      return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
    }
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
  };

  const getStatusIcon = (investment: any) => {
    if (investment.is_active) {
      return <CheckCircle className="w-4 h-4" />;
    }
    return <XCircle className="w-4 h-4" />;
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plans History</h1>
        <div className="bg-blue-100 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
          <span className="text-blue-800 dark:text-blue-300 font-medium">
            Total Plans: {investments.length}
          </span>
        </div>
      </div>

      {investments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Investment History</h3>
          <p className="text-gray-600 dark:text-gray-400">
            You haven't made any investments yet. Start investing to see your history here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {investments.map((investment, index) => (
            <motion.div
              key={investment.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    {/* Access plan details from populated field. Backend populates plan_id */}
                    <h3 className="text-xl font-bold mb-2">{investment.plan_id?.name || 'Unknown Plan'}</h3>
                    <p className="text-blue-100">
                      {/* Subtitle might not be populated or exist on model, relying on name */}
                    </p>
                  </div>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(investment)}`}>
                    {getStatusIcon(investment)}
                    <span className="text-sm font-medium">
                      {investment.is_active ? 'Active' : 'Completed'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Investment Amount</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${(investment.amount || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Daily ROI</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${(investment.daily_roi || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total ROI Earned</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${(investment.total_roi_earned || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {investment.plan_id?.duration_days} Days
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {investment.start_date ? format(new Date(investment.start_date), 'MMM dd, yyyy') : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {investment.end_date ? format(new Date(investment.end_date), 'MMM dd, yyyy') : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Last Claim:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {investment.last_claim_date ?
                          format(new Date(investment.last_claim_date), 'MMM dd, yyyy') :
                          'Never'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">ROI Percentage:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {investment.plan_id?.daily_roi_percentage}% Daily
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600 dark:text-gray-400">Total Expected ROI:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      ${((investment.amount * (investment.plan_id?.daily_roi_percentage || 0) * (investment.plan_id?.duration_days || 0)) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlansHistory;