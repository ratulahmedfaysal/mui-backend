import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Calendar, TrendingUp, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { format } from 'date-fns';

interface UserReferral {
  id: string;
  referred_user: {
    email: string;
    full_name: string;
    username: string;
    is_active: boolean;
    created_at: string;
  };
  level_number: number;
  commission_earned: number;
  created_at: string;
}

const ReferredUsers: React.FC = () => {
  const [referrals, setReferrals] = useState<UserReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalCommissions: 0,
    activeReferrals: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const { data } = await api.get('/referrals/my-referrals');

      setReferrals(data || []);

      // Calculate stats
      const totalReferrals = data?.length || 0;
      const totalCommissions = data?.reduce((sum: number, ref: UserReferral) => sum + (ref.commission_earned || 0), 0) || 0;
      const activeReferrals = data?.filter((ref: UserReferral) => ref.referred_user?.is_active)?.length || 0;

      setStats({
        totalReferrals,
        totalCommissions,
        activeReferrals,
      });
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referred Users</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalReferrals}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Commissions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.totalCommissions.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Referrals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.activeReferrals}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Referrals List */}
      {referrals.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Referrals Yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start sharing your referral link to build your network and earn commissions.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Referral Tree</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Commission Earned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {referrals.map((referral, index) => (
                  <motion.tr
                    key={referral.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {referral.referred_user?.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {referral.referred_user?.full_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            @{referral.referred_user?.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {referral.level_number}
                          </span>
                        </div>
                        <span className="ml-2 text-sm text-gray-900 dark:text-white">
                          Level {referral.level_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${referral.referred_user?.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                        {referral.referred_user?.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                        ${(referral.commission_earned || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {referral.referred_user?.created_at ? format(new Date(referral.referred_user.created_at), 'MMM dd, yyyy') : '-'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferredUsers;