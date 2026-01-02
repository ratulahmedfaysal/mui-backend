import React, { useState, useEffect } from 'react';
import { Clock, Star, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { format, isAfter } from 'date-fns';

interface InvestmentPlan {
  id: string;
  name: string;
  duration_days: number;
  daily_roi_percentage: number;
  return_principal: boolean;
}

interface UserInvestment {
  id: string;
  amount: number;
  daily_roi: number;
  total_roi_earned: number;
  start_date: string;
  end_date: string;
  last_claim_date: string;
  next_claim_date: string;
  is_active: boolean;
  plan_id: InvestmentPlan; // Populated
}

const Claim: React.FC = () => {
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    fetchInvestments();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdowns: Record<string, string> = {};
      investments.forEach((inv) => {
        if (inv.next_claim_date) {

          // If expired and not completed, show different text?
          // If next_claim_date > now, show countdown
          // If next_claim_date <= now, show Available

          newCountdowns[inv.id] = getTimeUntilNextClaim(inv.next_claim_date);
        }
      });
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [investments]);

  const fetchInvestments = async () => {
    try {
      const { data } = await api.get('/investments');
      // Backend returns all investments. Filter for active only?
      // Filter for active investments on client side
      const activeInvestments = (data || []).filter((inv: UserInvestment) => inv.is_active);
      setInvestments(activeInvestments);
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const canClaim = (investment: UserInvestment) => {
    if (!investment.next_claim_date) return true;
    return isAfter(new Date(), new Date(investment.next_claim_date));
  };

  const isExpired = (investment: UserInvestment) => {
    return isAfter(new Date(), new Date(investment.end_date));
  };

  const handleClaim = async (investment: UserInvestment) => {
    if (!user) return;

    // Allow if can claim (ROI) or if expired (to finish/withdraw capital)
    if (!canClaim(investment) && !isExpired(investment)) return;

    setClaiming(investment.id);

    try {
      const { data } = await api.post(`/investments/${investment.id}/claim`, {});

      alert(data.message);

      await refreshUser();
      await fetchInvestments();
    } catch (error: any) {
      console.error('Error processing investment:', error);
      alert(error.response?.data?.error || 'Failed to process. Please try again.');
    } finally {
      setClaiming(null);
    }
  };

  const getTimeUntilNextClaim = (nextClaimDate: string) => {
    const now = new Date().getTime();
    const target = new Date(nextClaimDate).getTime();
    const diff = target - now;

    if (diff <= 0) return 'Available now';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(seconds).padStart(2, '0')}`;
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Claim ROI</h1>
        <div className="bg-green-100 dark:bg-green-900/20 px-4 py-2 rounded-lg">
          <span className="text-green-800 dark:text-green-300 font-medium">
            Balance: ${user?.balance?.toLocaleString() || '0.00'}
          </span>
        </div>
      </div>

      {investments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Active Investments</h3>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have any active investments. Create an investment to start earning ROI.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {investments.map((investment: UserInvestment, index: number) => (
            <motion.div
              key={investment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{investment.plan_id?.name}</h3>
                    <p className="text-purple-100">Investment: ${investment.amount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${investment.daily_roi?.toFixed(2) || '0.00'}</div>
                    <div className="text-purple-100">Daily ROI</div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total ROI Earned</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${investment.total_roi_earned?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Investment End Date</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {format(new Date(investment.end_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last Claim</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {investment.last_claim_date
                          ? format(new Date(investment.last_claim_date), 'MMM dd, yyyy HH:mm')
                          : 'Never'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Next Claim</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {investment.next_claim_date
                          ? format(new Date(investment.next_claim_date), 'MMM dd, yyyy HH:mm')
                          : 'Available'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Time Until Next Claim</span>
                      <span className={`font-semibold ${canClaim(investment)
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-orange-600 dark:text-orange-400'
                        }`}>
                        {countdowns[investment.id] || 'Available now'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status</span>
                      <span className={`font-semibold ${isExpired(investment)
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                        }`}>
                        {isExpired(investment) ? 'Expired' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleClaim(investment)}
                    disabled={(!canClaim(investment) && !isExpired(investment)) || claiming === investment.id}
                    className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${(canClaim(investment) && !isExpired(investment)) || (isExpired(investment) && investment.plan_id?.return_principal)
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:shadow-lg'
                      : isExpired(investment)
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    {claiming === investment.id ? (
                      <LoadingSpinner size="sm" />
                    ) : isExpired(investment) ? (
                      <>
                        <Clock className="w-5 h-5" />
                        <span>
                          {investment.plan_id?.return_principal
                            ? 'Withdraw Capital & Finish'
                            : 'Complete Investment'}
                        </span>
                      </>
                    ) : canClaim(investment) ? (
                      <>
                        <Star className="w-5 h-5" />
                        <span>Claim ROI</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5" />
                        <span>{countdowns[investment.id] || 'Calculating...'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Claim;
