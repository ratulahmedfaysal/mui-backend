import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Clock, Star, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { UserInvestment } from '../../types';
// import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { format, isAfter, differenceInDays } from 'date-fns';

const ActivePlans: React.FC = () => {
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  // const { user } = useAuth(); // user unused here

  useEffect(() => {
    fetchActiveInvestments();
  }, []);

  const fetchActiveInvestments = async () => {
    try {
      const { data } = await api.get('/investments'); // Fetches all user investments

      // Filter for active plans and map plan_id to plan property for compatibility
      const activeInvestments = data
        .filter((inv: any) => inv.is_active)
        .map((inv: any) => ({
          ...inv,
          plan: inv.plan_id // Backend populates plan_id
        }));

      setInvestments(activeInvestments);
    } catch (error) {
      console.error('Error fetching active investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const canClaim = (investment: UserInvestment) => {
    if (!investment.next_claim_date) return true;
    return isAfter(new Date(), new Date(investment.next_claim_date));
  };

  const getDaysRemaining = (endDate: string) => {
    const days = differenceInDays(new Date(endDate), new Date());
    return Math.max(0, days);
  };

  const getProgressPercentage = (investment: UserInvestment) => {
    const totalDays = investment.plan?.duration_days || 1;
    const daysRemaining = getDaysRemaining(investment.end_date);
    const daysCompleted = totalDays - daysRemaining;
    return Math.min(100, (daysCompleted / totalDays) * 100);
  };

  const getTimeUntilNextClaim = (nextClaimDate: string) => {
    const now = new Date();
    const next = new Date(nextClaimDate);
    const diff = next.getTime() - now.getTime();

    if (diff <= 0) return 'Available now';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Active Plans</h1>
        <div className="bg-green-100 dark:bg-green-900/20 px-4 py-2 rounded-lg">
          <span className="text-green-800 dark:text-green-300 font-medium">
            Active Plans: {investments.length}
          </span>
        </div>
      </div>

      {investments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Active Plans</h3>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have any active investment plans. Create an investment to start earning ROI.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {investments.map((investment, index) => (
            <motion.div
              key={investment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{investment.plan?.name}</h3>
                    <p className="text-green-100">
                      Investment: ${investment.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${investment.daily_roi?.toFixed(2) || '0.00'}</div>
                    <div className="text-green-100">Daily ROI</div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan Progress</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {getDaysRemaining(investment.end_date)} days remaining
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(investment)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {getProgressPercentage(investment).toFixed(1)}% completed
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total ROI Earned</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${investment.total_roi_earned?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">End Date</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {format(new Date(investment.end_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Last Claim</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {investment.last_claim_date ?
                          format(new Date(investment.last_claim_date), 'MMM dd') :
                          'Never'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Next Claim</p>
                      <p className={`font-semibold ${canClaim(investment) ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                        }`}>
                        {investment.next_claim_date ?
                          getTimeUntilNextClaim(investment.next_claim_date) :
                          'Available'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Plan Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Daily ROI Rate:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {investment.plan?.daily_roi_percentage}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {investment.plan?.duration_days} Days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Expected:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            ${((investment.amount * (investment.plan?.daily_roi_percentage || 0) * (investment.plan?.duration_days || 0)) / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Earnings Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Principal Amount:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${investment.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">ROI Earned:</span>
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            ${investment.total_roi_earned.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Remaining ROI:</span>
                          <span className="font-medium text-orange-600 dark:text-orange-400">
                            ${(((investment.amount * (investment.plan?.daily_roi_percentage || 0) * (investment.plan?.duration_days || 0)) / 100) - investment.total_roi_earned).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <a
                    href="/user/claim"
                    className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${canClaim(investment)
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    <Star className="w-5 h-5" />
                    <span>
                      {canClaim(investment) ? 'Claim ROI Now' : 'Claim Not Available'}
                    </span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivePlans;