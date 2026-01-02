import React, { useState, useEffect } from 'react';
import { ArrowDownToLine, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';
import { format } from 'date-fns';

interface Deposit {
  id: string;
  amount: number;
  fee: number;
  final_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  payment_method: {
    method_name: string;
    currency_name: string;
  };
  transaction_data?: any;
  admin_notes?: string;
}

const DepositHistory: React.FC = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const { data } = await api.get('/transactions/deposits');
      setDeposits((data || []).map((d: any) => ({
        ...d,
        id: d._id || d.id,
        payment_method: d.payment_method || d.payment_method_id
      })));
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      setLoading(false);
    }
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

  const viewDetails = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setIsModalOpen(true);
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deposit History</h1>
      </div>

      {deposits.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
          <ArrowDownToLine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Deposits Yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            You haven't made any deposits yet. Start by making your first deposit.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fee
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
                {deposits.map((deposit, index) => (
                  <motion.tr
                    key={deposit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                          <ArrowDownToLine className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {deposit.payment_method?.method_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {deposit.payment_method?.currency_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      ${deposit.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                      ${deposit.fee.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                      ${deposit.final_amount.toFixed(2)}
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
                        onClick={() => viewDetails(deposit)}
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
      )}

      {/* Details Modal */}
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
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Payment Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Method:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedDeposit.payment_method?.method_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Currency:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedDeposit.payment_method?.currency_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${selectedDeposit.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Fee:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      ${selectedDeposit.fee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                    <span className="font-semibold text-gray-900 dark:text-white">Final Amount:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      ${selectedDeposit.final_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Status Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDeposit.status)}`}>
                      {getStatusIcon(selectedDeposit.status)}
                      <span className="capitalize">{selectedDeposit.status}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Submitted:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {format(new Date(selectedDeposit.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  {selectedDeposit.updated_at !== selectedDeposit.created_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {format(new Date(selectedDeposit.updated_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  )}
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
                          {typeof value === 'string' && value.startsWith('data:image') ? (
                            <img src={value} alt={key} className="w-20 h-20 object-cover rounded" />
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
            {selectedDeposit.admin_notes && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Admin Notes</h4>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-blue-700 dark:text-blue-300 text-sm">{selectedDeposit.admin_notes}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DepositHistory;