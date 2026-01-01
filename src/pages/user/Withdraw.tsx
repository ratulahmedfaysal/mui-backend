import React, { useState, useEffect } from 'react';
import { ArrowUpFromLine, CreditCard, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { PaymentMethod } from '../../types';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';

const Withdraw: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const { data } = await api.get('/payment-methods');
      const methods = (data || [])
        .map((m: any) => ({ ...m, id: m._id || m.id }))
        .filter((m: any) =>
          (m.method_type === 'withdrawal' || m.method_type === 'both') && m.is_active
        );

      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setAmount('');
    setFormData({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod || !user) return;

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount < selectedMethod.min_amount || withdrawAmount > selectedMethod.max_amount) {
      alert(`Amount must be between $${selectedMethod.min_amount} and $${selectedMethod.max_amount}`);
      return;
    }

    // Checking balance from context (should be reasonably fresh, or check backend)
    // We already check in backend, but good for UI feedback
    if (withdrawAmount > (user.balance || user.wallet_balance || 0)) {
      alert('Insufficient wallet balance');
      return;
    }

    setSubmitting(true);

    try {
      // Handle file uploads
      const uploadedFileUrls: Record<string, string> = {};

      for (const [fieldName, file] of Object.entries(uploadedFiles)) {
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          const { data } = await api.post('/upload', formData); // Correct endpoint usage? Yes, from Deposit.tsx
          uploadedFileUrls[fieldName] = data.url;
        }
      }

      const transactionData = { ...formData, ...uploadedFileUrls };
      const fee = (withdrawAmount * selectedMethod.fee_percentage) / 100;
      const finalAmount = withdrawAmount - fee;

      await api.post('/transactions/withdrawals', {
        payment_method_id: selectedMethod.id,
        amount: withdrawAmount,
        fee: fee,
        final_amount: finalAmount,
        transaction_data: transactionData
      });

      alert('Withdrawal request submitted successfully! Please wait for admin approval.');
      setIsModalOpen(false);
      setAmount('');
      setFormData({});
      setUploadedFiles({});

      await refreshUser();

    } catch (error: any) {
      console.error('Error submitting withdrawal:', error);
      alert(error.response?.data?.error || error.message || 'Failed to submit withdrawal request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [field]: file }));
    } else {
      setUploadedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[field];
        return newFiles;
      });
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Withdraw Funds</h1>
      </div>

      {(user?.balance || 0) === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-yellow-700 dark:text-yellow-300">
              You don't have any funds to withdraw. Make a deposit or earn ROI first.
            </p>
          </div>
        </div>
      )}

      {paymentMethods.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Payment Methods Available</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please contact support for available withdrawal methods.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentMethods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => handleMethodSelect(method)}
            >
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{method.method_name}</h3>
                    <p className="text-red-100">{method.currency_name}</p>
                  </div>
                  <CreditCard className="w-8 h-8" />
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Min Amount</span>
                    <span className="font-semibold text-gray-900 dark:text-white">${method.min_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Max Amount</span>
                    <span className="font-semibold text-gray-900 dark:text-white">${method.max_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Fee</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{method.fee_percentage}%</span>
                  </div>
                </div>

                <button
                  disabled={(user?.balance || 0) === 0}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowUpFromLine className="w-5 h-5" />
                  <span>Withdraw Now</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Withdrawal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Withdraw via ${selectedMethod?.method_name}`}
        size="lg"
      >
        {selectedMethod && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {selectedMethod.instruction && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Instructions</h4>
                <p className="text-blue-700 dark:text-blue-300 text-sm">{selectedMethod.instruction}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Withdrawal Amount ({selectedMethod.currency_name})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={selectedMethod.min_amount}
                max={Math.min(selectedMethod.max_amount, user?.balance || 0)}
                step="0.01"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                placeholder={`Enter amount (${selectedMethod.min_amount} - ${Math.min(selectedMethod.max_amount, user?.balance || 0)})`}
              />
            </div>

            {amount && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Withdrawal Amount:</span>
                    <span className="font-medium text-gray-900 dark:text-white">${parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Fee ({selectedMethod.fee_percentage}%):</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      -${((parseFloat(amount) * selectedMethod.fee_percentage) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                    <span className="font-semibold text-gray-900 dark:text-white">You'll Receive:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      ${(parseFloat(amount) - (parseFloat(amount) * selectedMethod.fee_percentage) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod.required_fields.map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {field} *
                </label>
                {field.toLowerCase().includes('upload_screenshot') || field.toLowerCase().includes('screenshot') ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      handleFileChange(field, file || null);
                    }}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <input
                    type={field.toLowerCase().includes('amount') ? 'number' : 'text'}
                    value={formData[field] || ''}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                    placeholder={`Enter ${field.toLowerCase()}`}
                  />
                )}
                {uploadedFiles[field] && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    File selected: {uploadedFiles[field].name}
                  </p>
                )}
              </div>
            ))}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!amount || submitting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? <LoadingSpinner size="sm" /> : 'Submit Withdrawal'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Withdraw;