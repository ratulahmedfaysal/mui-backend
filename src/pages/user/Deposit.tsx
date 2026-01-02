import React, { useState, useEffect } from 'react';
import { ArrowDownToLine, CreditCard, AlertCircle, CheckCircle, Zap, Clock, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { PaymentMethod, CoinPaymentsSettings } from '../../types';
import api from '../../lib/api';
import { coinPaymentsUtils } from '../../lib/coinpayments';


import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';

const Deposit: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [coinpaymentsSettings, setCoinpaymentsSettings] = useState<CoinPaymentsSettings | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coinPaymentsData, setCoinPaymentsData] = useState<any>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    fetchPaymentMethods();
    fetchCoinPaymentsSettings();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const { data } = await api.get('/payment-methods');
      // Filter active and deposit/both types (backend might perform some filtering, but good to be safe if generic endpoint)
      // The backend endpoint I saw returns ALL methods if admin, but here we are USER.
      // Wait, I didn't update GET /payment-methods to be public yet! It still requires admin.
      // I need to update server/routes/payment_methods.js to allow public access or create a new public endpoint.
      // Assuming I WILL fix the backend to allow public access.
      const methods = (data || [])
        .map((m: any) => ({ ...m, id: m._id || m.id }))
        .filter((m: any) =>
          (m.method_type === 'deposit' || m.method_type === 'both') && m.is_active
        );

      methods.sort((a: any, b: any) => {
        if (a.is_automatic === b.is_automatic) return 0;
        return a.is_automatic ? -1 : 1;
      });

      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoinPaymentsSettings = async () => {
    try {
      const { data } = await api.get('/payment-methods/settings/coinpayments');
      setCoinpaymentsSettings(data);
    } catch (error) {
      console.error('Error fetching CoinPayments settings:', error);
    }
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setAmount('');
    setFormData({});
    setCoinPaymentsData(null);
    setShowPaymentDetails(false);
    setIsModalOpen(true);
  };

  const createCoinPaymentsTransaction = async () => {
    if (!selectedMethod || !coinpaymentsSettings || !user) return;

    const depositAmount = parseFloat(amount);
    setSubmitting(true);

    try {
      const transactionParams = {
        amount: depositAmount,
        currency1: 'USD',
        currency2: selectedMethod.currency_name,
        buyer_email: user.email,
        item_name: `Deposit ${depositAmount} USD`,
        custom: user.id || '',
      };

      console.log('Creating CoinPayments transaction with params:', transactionParams);

      const result = await coinPaymentsUtils.createTransaction(transactionParams);
      console.log('CoinPayments API response:', result);

      if (result.error === 'ok' && result.result) {
        setCoinPaymentsData(result.result);
        setShowPaymentDetails(true);

        const fee = (depositAmount * selectedMethod.fee_percentage) / 100;
        const finalAmount = depositAmount - fee;

        await api.post('/transactions/deposits', {
          payment_method_id: selectedMethod.id,
          amount: depositAmount,
          fee: fee,
          final_amount: finalAmount,
          transaction_data: {
            coinpayments_txn_id: result.result.txn_id,
            address: result.result.address,
            dest_tag: result.result.dest_tag,
            amount_crypto: result.result.amount,
            confirms_needed: result.result.confirms_needed,
            timeout: result.result.timeout,
            status_url: result.result.status_url,
            qrcode_url: result.result.qrcode_url,
          },
          gateway_transaction_id: result.result.txn_id,
          status: 'pending'
        });

      } else {
        throw new Error(result.error || 'Failed to create CoinPayments transaction');
      }
    } catch (error: any) {
      console.error('Error creating CoinPayments transaction:', error);
      alert(`Failed to create payment: ${error.message || 'Unknown error'}. Please try again or contact support.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod || !user) return;

    const depositAmount = parseFloat(amount);
    if (depositAmount < selectedMethod.min_amount || depositAmount > selectedMethod.max_amount) {
      alert(`Amount must be between $${selectedMethod.min_amount} and $${selectedMethod.max_amount}`);
      return;
    }

    if (selectedMethod.gateway_type === 'coinpayments' && selectedMethod.is_automatic) {
      await createCoinPaymentsTransaction();
      return;
    }

    setSubmitting(true);

    try {
      const uploadedFileUrls: Record<string, string> = {};

      for (const [fieldName, file] of Object.entries(uploadedFiles)) {
        if (file) {
          const formDataUpload = new FormData();
          formDataUpload.append('file', file);

          const { data } = await api.post('/upload', formDataUpload, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          uploadedFileUrls[fieldName] = data.url;
        }
      }

      const transactionData = { ...formData, ...uploadedFileUrls };
      const fee = (depositAmount * selectedMethod.fee_percentage) / 100;
      const finalAmount = depositAmount - fee;

      await api.post('/transactions/deposits', {
        payment_method_id: selectedMethod.id,
        amount: depositAmount,
        fee: fee,
        final_amount: finalAmount,
        transaction_data: transactionData,
        status: 'pending'
      });

      alert('Deposit request submitted successfully! Please wait for admin approval.');
      setIsModalOpen(false);
      setAmount('');
      setFormData({});
      setUploadedFiles({});
    } catch (error: any) {
      console.error('Error submitting deposit:', error);
      alert(error.message || 'Failed to submit deposit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const checkTransactionStatus = async () => {
    if (!coinPaymentsData) return;

    setCheckingStatus(true);
    try {
      const result = await coinPaymentsUtils.getTransactionInfo(coinPaymentsData.txn_id);

      if (result.error === 'ok' && result.result) {
        const status = parseInt(result.result.status);
        const statusText = result.result.status_text;

        if (status >= 100) {
          alert('Payment confirmed! Your deposit has been processed.');
          setIsModalOpen(false);
          refreshUser();
        } else if (status < 0) {
          alert(`Payment failed: ${statusText}`);
        } else {
          alert(`Payment status: ${statusText} (${status}). Waiting for confirmations...`);
        }
      } else {
        alert('Failed to check transaction status. Please try again.');
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
      alert('Failed to check transaction status. Please try again.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Copied to clipboard!');
    });
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

  const automaticMethods = paymentMethods.filter(method => method.is_automatic);
  const manualMethods = paymentMethods.filter(method => !method.is_automatic);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deposit Funds</h1>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Payment Methods Available</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please Contact Support Team.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {automaticMethods.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fast Deposit</h2>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                  Automatic Processing
                </span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {automaticMethods.map((method, index) => (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border-2 border-green-200 dark:border-green-800"
                    onClick={() => handleMethodSelect(method)}
                  >
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{method.method_name}</h3>
                          <p className="text-green-100">{method.currency_name}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <Zap className="w-8 h-8 mb-1" />
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">AUTO</span>
                        </div>
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
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Processing</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">Instant</span>
                        </div>
                      </div>

                      <button className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors">
                        <Zap className="w-5 h-5" />
                        <span>Deposit Now</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {manualMethods.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Manual Deposit</h2>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full">
                  Manual Processing
                </span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {manualMethods.map((method, index) => (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: (automaticMethods.length + index) * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => handleMethodSelect(method)}
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{method.method_name}</h3>
                          <p className="text-blue-100">{method.currency_name}</p>
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
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Processing</span>
                          <span className="font-semibold text-orange-600 dark:text-orange-400">24H</span>
                        </div>
                      </div>

                      <button className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors">
                        <ArrowDownToLine className="w-5 h-5" />
                        <span>Deposit Now</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Deposit via ${selectedMethod?.method_name}`}
        size="lg"
      >
        {selectedMethod && (
          <div className="space-y-6">
            {showPaymentDetails && coinPaymentsData ? (
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-800 dark:text-green-300">Invoice Created</h4>
                  </div>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    Send exactly <strong>{coinPaymentsData.amount} {selectedMethod.currency_name}</strong> to the address below.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Payment Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={coinPaymentsData.address}
                        readOnly
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white font-mono text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(coinPaymentsData.address)}
                        className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {coinPaymentsData.dest_tag && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Destination Tag
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={coinPaymentsData.dest_tag}
                          readOnly
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white font-mono text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(coinPaymentsData.dest_tag)}
                          className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Amount to Send ({selectedMethod.currency_name})
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={coinPaymentsData.amount}
                          readOnly
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white font-mono text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(coinPaymentsData.amount)}
                          className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                  </div>

                  {coinPaymentsData.qrcode_url && (
                    <div className="text-center">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        QR Code
                      </label>
                      <img
                        src={coinPaymentsData.qrcode_url}
                        alt="Payment QR Code"
                        className="mx-auto border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Important Instructions</h4>
                  <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
                    <li>• Send exactly the amount shown above</li>
                    <li>• Do not send from an exchange (use a personal wallet)</li>
                    <li>• This address is valid for this transaction only</li>
                    {coinPaymentsData.timeout && (
                      <li>• This address is valid for only {Math.floor(coinPaymentsData.timeout / 3600)} hours</li>
                    )}
                  </ul>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={checkTransactionStatus}
                    disabled={checkingStatus}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {checkingStatus ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Check Status
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {selectedMethod.instruction && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Instructions</h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">{selectedMethod.instruction}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deposit Amount ({selectedMethod.currency_name})
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={selectedMethod.min_amount}
                    max={selectedMethod.max_amount}
                    step="0.01"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder={`Enter amount (${selectedMethod.min_amount} - ${selectedMethod.max_amount})`}
                  />
                </div>

                {amount && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Deposit Amount:</span>
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

                {selectedMethod.gateway_type === 'manual' && selectedMethod.required_fields.map((field: string) => (
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
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <input
                        type={field.toLowerCase().includes('amount') ? 'number' : 'text'}
                        value={formData[field] || ''}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
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
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {submitting ? (
                      <LoadingSpinner size="sm" />
                    ) : selectedMethod.is_automatic ? (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Pay
                      </>
                    ) : (
                      'Submit Deposit'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Deposit;