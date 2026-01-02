import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  UserCheck,
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';

import LoadingSpinner from '../../components/Common/LoadingSpinner';

interface AdminStats {
  totalUsers: number;
  totalInvestments: number;
  totalROIPaid: number;
  activeUsers: number;
  inactiveUsers: number;
  bannedUsers: number;
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
    totalInvestments: 0,
    totalROIPaid: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    bannedUsers: 0,
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
      const { data } = await api.get('/stats/admin');
      setStats(data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Total Investments',
      value: `$${stats.totalInvestments.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Total ROI Paid',
      value: `$${stats.totalROIPaid.toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-purple-500 to-indigo-500',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: UserCheck,
      color: 'from-green-500 to-teal-500',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Banned Users',
      value: stats.bannedUsers,
      icon: Users,
      color: 'from-red-500 to-pink-500',
      textColor: 'text-red-600 dark:text-red-400'
    },
    {
      title: 'Referral Commissions',
      value: `$${stats.totalReferralCommissions.toLocaleString()}`,
      icon: Users,
      color: 'from-orange-500 to-yellow-500',
      textColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      title: 'Total Withdrawals',
      value: `$${stats.totalWithdrawals.toLocaleString()}`,
      icon: ArrowUpFromLine,
      color: 'from-red-500 to-rose-500',
      textColor: 'text-red-600 dark:text-red-400'
    },
    {
      title: 'Approved Withdrawals',
      value: `$${stats.approvedWithdrawals.toLocaleString()}`,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Rejected Withdrawals',
      value: `$${stats.rejectedWithdrawals.toLocaleString()}`,
      icon: XCircle,
      color: 'from-red-500 to-pink-500',
      textColor: 'text-red-600 dark:text-red-400'
    },
    {
      title: 'Total Deposits',
      value: `$${stats.totalDeposits.toLocaleString()}`,
      icon: ArrowDownToLine,
      color: 'from-blue-500 to-indigo-500',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Approved Deposits',
      value: `$${stats.approvedDeposits.toLocaleString()}`,
      icon: CheckCircle,
      color: 'from-green-500 to-teal-500',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Rejected Deposits',
      value: `$${stats.rejectedDeposits.toLocaleString()}`,
      icon: XCircle,
      color: 'from-red-500 to-rose-500',
      textColor: 'text-red-600 dark:text-red-400'
    },
    {
      title: 'Pending Deposits',
      value: stats.pendingDeposits,
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: 'Pending Withdrawals',
      value: stats.pendingWithdrawals,
      icon: Clock,
      color: 'from-yellow-500 to-amber-500',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
  ];

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

        {/*
        <button
          onClick={fetchAdminStats}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-colors"
        >
          Refresh Stats
        </button>
        */}

      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${stat.color} p-4`}>
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-sm opacity-90">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="w-8 h-8 opacity-80" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/users"
            className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-700 dark:text-blue-300">Manage Users</span>
          </a>

          <a
            href="/admin/deposits"
            className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
          >
            <ArrowDownToLine className="w-6 h-6 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-700 dark:text-green-300">Manage Deposits</span>
          </a>

          <a
            href="/admin/withdrawals"
            className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <ArrowUpFromLine className="w-6 h-6 text-red-600 dark:text-red-400" />
            <span className="font-medium text-red-700 dark:text-red-300">Manage Withdrawals</span>
          </a>

          <a
            href="/admin/plans"
            className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
          >
            <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-purple-700 dark:text-purple-300">Investment Plans</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;