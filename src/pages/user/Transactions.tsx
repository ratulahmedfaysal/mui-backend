import React, { useState, useEffect } from 'react';
import { Filter, Download, ArrowUpRight, ArrowDownRight, DollarSign, Users, TrendingUp, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  created_at: string;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, filter]);

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/transactions');
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    if (filter === 'all') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(transactions.filter(tx => tx.type === filter));
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownRight className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'investment':
        return <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'roi_claim':
        return <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'referral_commission':
        return <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600 dark:text-green-400';
      case 'withdrawal':
        return 'text-red-600 dark:text-red-400';
      case 'investment':
        return 'text-blue-600 dark:text-blue-400';
      case 'roi_claim':
        return 'text-purple-600 dark:text-purple-400';
      case 'referral_commission':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'investment':
        return 'Investment';
      case 'roi_claim':
        return 'ROI Claim';
      case 'referral_commission':
        return 'Referral Commission';
      default:
        return type;
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">Filter by Type</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Transactions' },
            { key: 'deposit', label: 'Deposits' },
            { key: 'withdrawal', label: 'Withdrawals' },
            { key: 'investment', label: 'Investments' },
            { key: 'roi_claim', label: 'ROI Claims' },
            { key: 'referral_commission', label: 'Referral Commissions' },
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === filterOption.key
                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Transactions Found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'all'
              ? "You haven't made any transactions yet."
              : `No ${formatTransactionType(filter).toLowerCase()} transactions found.`
            }
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance Before
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance After
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.02 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                            {formatTransactionType(transaction.type)}
                          </div>
                          {transaction.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {transaction.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${['deposit', 'roi_claim', 'referral_commission'].includes(transaction.type)
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                        }`}>
                        {['deposit', 'roi_claim', 'referral_commission'].includes(transaction.type) ? '+' : '-'}
                        ${transaction.amount?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${transaction.balance_before?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${transaction.balance_after?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
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

export default Transactions;