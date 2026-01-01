import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

import api from '../../lib/api';

import LoadingSpinner from '../../components/Common/LoadingSpinner';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalInvestments: number;
  totalRoiPaid: number;
  totalReferralCommissions: number;
  totalWithdrawals: number;
  approvedWithdrawals: number;
  rejectedWithdrawals: number;
  totalDeposits: number;
  approvedDeposits: number;
  rejectedDeposits: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalInvestments: 0,
    totalRoiPaid: 0,
    totalReferralCommissions: 0,
    totalWithdrawals: 0,
    approvedWithdrawals: 0,
    rejectedWithdrawals: 0,
    totalDeposits: 0,
    approvedDeposits: 0,
    rejectedDeposits: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);

      const { data } = await api.get('/admin/stats');

      setStats({
        totalUsers: data.users.total,
        activeUsers: data.users.active,
        inactiveUsers: data.users.total - data.users.active,
        totalInvestments: data.investments.volume, // Or sum of amounts if API returns volume
        totalRoiPaid: 0, // Backend calc needed or 0 for now
        totalReferralCommissions: 0, // Backend calc needed
        totalWithdrawals: 0,
        approvedWithdrawals: 0,
        rejectedWithdrawals: 0,
        totalDeposits: 0,
        approvedDeposits: 0,
        rejectedDeposits: 0,
        pendingDeposits: data.pending.deposits,
        pendingWithdrawals: data.pending.withdrawals,
        // Note: The new backend endpoint can be expanded to return all these details.
        // For now mapping what we have.
      });

    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
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

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      format: 'number'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      format: 'number'
    },
    {
      title: 'Inactive Users',
      value: stats.inactiveUsers,
      icon: XCircle,
      color: 'from-red-500 to-pink-500',
      format: 'number'
    },
    {
      title: 'Total Investments',
      value: stats.totalInvestments,
      icon: DollarSign,
      color: 'from-purple-500 to-indigo-500',
      format: 'currency'
    },
    {
      title: 'Total ROI Paid',
      value: stats.totalRoiPaid,
      icon: TrendingUp,
      color: 'from-orange-500 to-yellow-500',
      format: 'currency'
    },
    {
      title: 'Referral Commissions',
      value: stats.totalReferralCommissions,
      icon: Users,
      color: 'from-teal-500 to-cyan-500',
      format: 'currency'
    },
    {
      title: 'Total Withdrawals',
      value: stats.totalWithdrawals,
      icon: ArrowUpRight,
      color: 'from-red-500 to-orange-500',
      format: 'currency'
    },
    {
      title: 'Approved Withdrawals',
      value: stats.approvedWithdrawals,
      icon: CheckCircle,
      color: 'from-green-500 to-teal-500',
      format: 'currency'
    },
    {
      title: 'Rejected Withdrawals',
      value: stats.rejectedWithdrawals,
      icon: XCircle,
      color: 'from-red-500 to-pink-500',
      format: 'currency'
    },
    {
      title: 'Total Deposits',
      value: stats.totalDeposits,
      icon: ArrowDownRight,
      color: 'from-blue-500 to-purple-500',
      format: 'currency'
    },
    {
      title: 'Approved Deposits',
      value: stats.approvedDeposits,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      format: 'currency'
    },
    {
      title: 'Rejected Deposits',
      value: stats.rejectedDeposits,
      icon: XCircle,
      color: 'from-red-500 to-rose-500',
      format: 'currency'
    },
    {
      title: 'Pending Deposits',
      value: stats.pendingDeposits,
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
      format: 'number'
    },
    {
      title: 'Pending Withdrawals',
      value: stats.pendingWithdrawals,
      icon: AlertCircle,
      color: 'from-orange-500 to-red-500',
      format: 'number'
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <button
          onClick={fetchAdminStats}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-colors"
        >
          Refresh Stats
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.format === 'currency'
                    ? formatCurrency(stat.value)
                    : stat.value.toLocaleString()
                  }
                </p>
              </div>
              <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/users"
            className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-900 dark:text-blue-300">Manage Users</span>
          </a>

          <a
            href="/admin/deposits"
            className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <ArrowDownRight className="w-6 h-6 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-900 dark:text-green-300">Manage Deposits</span>
          </a>

          <a
            href="/admin/withdrawals"
            className="flex items-center space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            <ArrowUpRight className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <span className="font-medium text-orange-900 dark:text-orange-300">Manage Withdrawals</span>
          </a>

          <a
            href="/admin/plans"
            className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-purple-900 dark:text-purple-300">Investment Plans</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;