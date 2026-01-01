import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { Withdrawal } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';
import { format } from 'date-fns';

const AdminWithdrawals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  useEffect(() => {
    filterWithdrawals();
  }, [withdrawals, statusFilter]);

  const fetchWithdrawals = async () => {
    try {
      const { data } = await api.get('/transactions/withdrawals');
      setWithdrawals((data || []).map((w: any) => ({
        ...w,
        id: w._id || w.id,
        user: w.user || w.user_id,
        payment_method: w.payment_method || w.payment_method_id
      })));
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWithdrawals = () => {
    if (statusFilter === 'all') {
      setFilteredWithdrawals(withdrawals);
    } else {
      setFilteredWithdrawals(withdrawals.filter(withdrawal => withdrawal.status === statusFilter));
    }
  };

  const updateWithdrawalStatus = async (withdrawalId: string, status: 'approved' | 'rejected', notes?: string) => {
    setUpdating(true);
    try {
      await api.put(`/transactions/withdrawals/${withdrawalId}`, {
        status,
        admin_notes: notes
      });

      alert(`Withdrawal ${status} successfully!`);
      setIsModalOpen(false);
      await fetchWithdrawals();
    } catch (error: any) {
      console.error('Error updating withdrawal:', error);
      alert('Failed to update withdrawal: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const viewWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setAdminNotes(withdrawal.admin_notes || '');
    setIsModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'rejected':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Withdrawals</h1>


        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="bg-blue-100 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
            <span className="text-blue-800 dark:text-blue-300 font-medium">
              {filteredWithdrawals.length}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Final Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredWithdrawals.map((withdrawal, index) => (
                <motion.tr
                  key={withdrawal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.02 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {withdrawal.user?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {withdrawal.user?.full_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {withdrawal.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {withdrawal.payment_method?.method_name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {withdrawal.payment_method?.currency_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ${withdrawal.amount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                    ${withdrawal.final_amount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                      {getStatusIcon(withdrawal.status)}
                      <span className="capitalize">{withdrawal.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(withdrawal.created_at), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => viewWithdrawal(withdrawal)}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Withdrawal Details"
        size="lg"
      >
        {selectedWithdrawal && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">User Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedWithdrawal.user?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedWithdrawal.user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Username:</span>
                    <span className="font-medium text-gray-900 dark:text-white">@{selectedWithdrawal.user?.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Current Balance:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">${selectedWithdrawal.user?.balance?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Withdrawal Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Method:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedWithdrawal.payment_method?.method_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="font-medium text-gray-900 dark:text-white">${selectedWithdrawal.amount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Fee:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">${selectedWithdrawal.fee?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                    <span className="font-semibold text-gray-900 dark:text-white">Final Amount:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">${selectedWithdrawal.final_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Data */}
            {selectedWithdrawal.transaction_data && Object.keys(selectedWithdrawal.transaction_data).length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Transaction Details</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    {Object.entries(selectedWithdrawal.transaction_data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                        <span className="font-medium text-gray-900 dark:text-white break-all">
                          {typeof value === 'string' && (value.startsWith('data:image') || value.includes('uploads')) && (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png') || value.includes('.gif')) ? (
                            <div className="mt-2">
                              <img src={value} alt={key} className="max-w-xs max-h-40 object-cover rounded border" />
                              <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-blue-600 dark:text-blue-400 hover:underline text-xs mt-1"
                              >
                                View Full Image
                              </a>
                            </div>
                          ) : (
                            String(value)
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Admin Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                placeholder="Add notes for this withdrawal..."
              />
            </div>

            {/* Action Buttons */}
            {selectedWithdrawal.status === 'pending' && (
              <div className="flex space-x-4">
                <button
                  onClick={() => updateWithdrawalStatus(selectedWithdrawal.id, 'approved', adminNotes)}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updating ? <LoadingSpinner size="sm" /> : 'Approve Withdrawal'}
                </button>
                <button
                  onClick={() => updateWithdrawalStatus(selectedWithdrawal.id, 'rejected', adminNotes)}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updating ? <LoadingSpinner size="sm" /> : 'Reject Withdrawal'}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminWithdrawals;