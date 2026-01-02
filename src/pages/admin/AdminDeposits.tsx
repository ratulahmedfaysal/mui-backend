import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { Deposit } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';
import { format } from 'date-fns';

const AdminDeposits: React.FC = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [filteredDeposits, setFilteredDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchDeposits();
  }, []);

  useEffect(() => {
    filterDeposits();
  }, [deposits, statusFilter]);

  const fetchDeposits = async () => {
    try {
      const { data } = await api.get('/transactions/deposits');
      setDeposits((data || []).map((d: any) => ({
        ...d,
        id: d._id || d.id,
        user: d.user || d.user_id,
        payment_method: d.payment_method || d.payment_method_id
      })));
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDeposits = () => {
    if (statusFilter === 'all') {
      setFilteredDeposits(deposits);
    } else {
      setFilteredDeposits(deposits.filter(deposit => deposit.status === statusFilter));
    }
  };

  const updateDepositStatus = async (depositId: string, status: 'approved' | 'rejected', notes?: string) => {
    setUpdating(true);
    try {
      await api.put(`/transactions/deposits/${depositId}`, {
        status,
        admin_notes: notes
      });

      alert(`Deposit ${status} successfully!`);
      setIsModalOpen(false);
      await fetchDeposits();
    } catch (error: any) {
      console.error('Error updating deposit:', error);
      alert('Failed to update deposit: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const viewDeposit = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setAdminNotes(deposit.admin_notes || '');
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Deposits</h1>
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
              {filteredDeposits.length}
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
              {filteredDeposits.map((deposit, index) => (
                <motion.tr
                  key={deposit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.02 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {deposit.user?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {deposit.user?.full_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {deposit.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {deposit.payment_method?.method_name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {deposit.payment_method?.currency_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ${deposit.amount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                    ${deposit.final_amount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                      {getStatusIcon(deposit.status)}
                      <span className="capitalize">{deposit.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(deposit.created_at), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => viewDeposit(deposit)}
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

      {/* Deposit Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Deposit Details"
        size="lg"
      >
        {selectedDeposit && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">User Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedDeposit.user?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedDeposit.user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Username:</span>
                    <span className="font-medium text-gray-900 dark:text-white">@{selectedDeposit.user?.username}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Payment Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Method:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedDeposit.payment_method?.method_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="font-medium text-gray-900 dark:text-white">${selectedDeposit.amount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Fee:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">${selectedDeposit.fee?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                    <span className="font-semibold text-gray-900 dark:text-white">Final Amount:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">${selectedDeposit.final_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Data */}
            {selectedDeposit.transaction_data && Object.keys(selectedDeposit.transaction_data).length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Transaction Details</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    {Object.entries(selectedDeposit.transaction_data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                        <span className="font-medium text-gray-900 dark:text-white break-all">
                          {typeof value === 'string' && (value.startsWith('data:image') || value.includes('supabase') || value.includes('uploads')) && (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png') || value.includes('.gif')) ? (
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
                placeholder="Add notes for this deposit..."
              />
            </div>

            {/* Action Buttons */}
            {selectedDeposit.status === 'pending' && (
              <div className="flex space-x-4">
                <button
                  onClick={() => updateDepositStatus(selectedDeposit.id, 'approved', adminNotes)}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updating ? <LoadingSpinner size="sm" /> : 'Approve Deposit'}
                </button>
                <button
                  onClick={() => updateDepositStatus(selectedDeposit.id, 'rejected', adminNotes)}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updating ? <LoadingSpinner size="sm" /> : 'Reject Deposit'}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDeposits;