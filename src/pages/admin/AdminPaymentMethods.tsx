import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit, Trash2, Settings, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { PaymentMethod, CoinPaymentsSettings } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';

const AdminPaymentMethods: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [coinpaymentsSettings, setCoinpaymentsSettings] = useState<CoinPaymentsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCoinPaymentsModalOpen, setIsCoinPaymentsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    method_name: '',
    currency_name: '',
    method_image_url: '',
    currency_rate: 1,
    min_amount: 0,
    max_amount: 0,
    fee_percentage: 0,
    instruction: '',
    required_fields: [''],
    method_type: 'both' as 'deposit' | 'withdrawal' | 'both',
    is_active: true,
    is_automatic: false,
    gateway_type: 'manual' as 'manual' | 'coinpayments',
  });

  const [coinpaymentsForm, setCoinpaymentsForm] = useState({
    merchant_id: '',
    public_key: '',
    private_key: '',
    ipn_secret: '',
    is_active: false,
    accepted_coins: ['BTC', 'ETH', 'LTC', 'USDT', 'LTCT'],
  });

  const availableCoins = [
    'BTC', 'ETH', 'LTC', 'USDT', 'LTCT'
  ];

  useEffect(() => {
    fetchPaymentMethods();
    fetchCoinPaymentsSettings();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const { data } = await api.get('/payment-methods');
      setPaymentMethods((data || []).map((m: any) => ({
        ...m,
        id: m._id || m.id
      })));
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

      if (data) {
        setCoinpaymentsForm({
          merchant_id: data.merchant_id || '',
          public_key: data.public_key || '',
          private_key: data.private_key || '',
          ipn_secret: data.ipn_secret || '',
          is_active: data.is_active || false,
          accepted_coins: data.accepted_coins || ['BTC', 'ETH', 'LTC', 'USDT', 'LTCT'],
        });
      }
    } catch (error) {
      console.error('Error fetching CoinPayments settings:', error);
    }
  };

  const openModal = (method?: PaymentMethod) => {
    if (method) {
      setEditingMethod(method);
      setFormData({
        method_name: method.method_name,
        currency_name: method.currency_name,
        method_image_url: method.method_image_url || '',
        currency_rate: method.currency_rate,
        min_amount: method.min_amount,
        max_amount: method.max_amount,
        fee_percentage: method.fee_percentage,
        instruction: method.instruction || '',
        required_fields: method.required_fields,
        method_type: method.method_type,
        is_active: method.is_active,
        is_automatic: method.is_automatic || false,
        gateway_type: method.gateway_type || 'manual',
      });
    } else {
      setEditingMethod(null);
      setFormData({
        method_name: '',
        currency_name: '',
        method_image_url: '',
        currency_rate: 1,
        min_amount: 0,
        max_amount: 0,
        fee_percentage: 0,
        instruction: '',
        required_fields: [''],
        method_type: 'both',
        is_active: true,
        is_automatic: false,
        gateway_type: 'manual',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const methodData = {
        ...formData,
        required_fields: formData.required_fields.filter(f => f.trim() !== ''),
      };

      if (editingMethod) {
        // Update
        await api.put(`/payment-methods/${editingMethod.id}`, methodData);
        alert('Payment method updated successfully!');
      } else {
        // Create
        await api.post('/payment-methods', methodData);
        alert('Payment method created successfully!');
      }

      setIsModalOpen(false);
      await fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error saving payment method:', error);
      alert('Failed to save payment method: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCoinPaymentsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create or Update Settings
      await api.post('/payment-methods/settings/coinpayments', coinpaymentsForm); // Helper route handles update/create
      alert('CoinPayments settings saved successfully!');

      setIsCoinPaymentsModalOpen(false);
      await fetchCoinPaymentsSettings();
    } catch (error: any) {
      console.error('Error saving CoinPayments settings:', error);
      alert('Failed to save CoinPayments settings: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const createAutomaticCoinMethod = async (coin: string) => {
    try {
      const methodData = {
        method_name: `${coin} (Auto)`,
        currency_name: coin,
        method_image_url: '',
        currency_rate: 1,
        min_amount: coin === 'BTC' ? 0.001 : coin === 'ETH' ? 0.01 : 10,
        max_amount: coin === 'BTC' ? 1 : coin === 'ETH' ? 10 : 10000,
        fee_percentage: 2,
        instruction: `Automatic ${coin} deposits via CoinPayments. Your deposit will be processed automatically after blockchain confirmation.`,
        required_fields: [],
        method_type: 'deposit' as const,
        is_active: true,
        is_automatic: true,
        gateway_type: 'coinpayments' as const,
      };

      await api.post('/payment-methods', methodData);
      await fetchPaymentMethods();
      alert(`${coin} automatic payment method created successfully!`);
    } catch (error: any) {
      console.error(`Error creating ${coin} method:`, error);
      alert(`Failed to create ${coin} method: ` + error.message);
    }
  };

  const deleteMethod = async (methodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    try {
      await api.delete(`/payment-methods/${methodId}`);
      alert('Payment method deleted successfully!');
      await fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      alert('Failed to delete payment method: ' + error.message);
    }
  };

  const toggleMethodStatus = async (methodId: string, isActive: boolean) => {
    try {
      await api.put(`/payment-methods/${methodId}`, {
        is_active: !isActive
      });
      await fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error updating payment method status:', error);
      alert('Failed to update payment method status: ' + error.message);
    }
  };

  const addRequiredField = () => {
    setFormData({
      ...formData,
      required_fields: [...formData.required_fields, '']
    });
  };

  const removeRequiredField = (index: number) => {
    setFormData({
      ...formData,
      required_fields: formData.required_fields.filter((_, i) => i !== index)
    });
  };

  const updateRequiredField = (index: number, value: string) => {
    const newFields = [...formData.required_fields];
    newFields[index] = value;
    setFormData({
      ...formData,
      required_fields: newFields
    });
  };

  const toggleCoin = (coin: string) => {
    const newCoins = coinpaymentsForm.accepted_coins.includes(coin)
      ? coinpaymentsForm.accepted_coins.filter(c => c !== coin)
      : [...coinpaymentsForm.accepted_coins, coin];

    setCoinpaymentsForm({
      ...coinpaymentsForm,
      accepted_coins: newCoins
    });
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Methods</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsCoinPaymentsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>CoinPayments</span>
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Method</span>
          </button>
        </div>
      </div>

      {/* CoinPayments Status */}
      {coinpaymentsSettings && (
        <div className={`p-4 rounded-lg border ${coinpaymentsSettings.is_active
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span className="font-medium">
                CoinPayments Gateway: {coinpaymentsSettings.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {coinpaymentsSettings.is_active && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {coinpaymentsSettings.accepted_coins.length} coins supported
              </span>
            )}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paymentMethods.map((method, index) => (
          <motion.div
            key={method.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            <div className={`p-6 text-white ${method.is_automatic
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold mb-2">{method.method_name}</h3>
                  <p className="text-blue-100">{method.currency_name}</p>
                  {method.is_automatic && (
                    <span className="inline-block mt-2 px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                      Automatic
                    </span>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${method.is_active
                  ? 'bg-green-500/20 text-green-100'
                  : 'bg-red-500/20 text-red-100'
                  }`}>
                  {method.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">
                    {method.method_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Gateway:</span>
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">
                    {method.gateway_type || 'manual'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Min Amount:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${method.min_amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Max Amount:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${method.max_amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Fee:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {method.fee_percentage}%
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => openModal(method)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => toggleMethodStatus(method.id, method.is_active)}
                  className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition-colors ${method.is_active
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40'
                    : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40'
                    }`}
                >
                  <span>{method.is_active ? 'Disable' : 'Enable'}</span>
                </button>
                <button
                  onClick={() => deleteMethod(method.id)}
                  className="px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CoinPayments Settings Modal */}
      <Modal
        isOpen={isCoinPaymentsModalOpen}
        onClose={() => setIsCoinPaymentsModalOpen(false)}
        title="CoinPayments Gateway Settings"
        size="lg"
      >
        <form onSubmit={handleCoinPaymentsSubmit} className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Setup Instructions</h4>
            <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
              <li>1. Create account at coinpayments.net</li>
              <li>2. Get your API credentials from Account Settings</li>
              <li>3. Set IPN URL to: https://yourdomain.com/api/coinpayments/ipn</li>
              <li>4. Enable IPN and set the IPN Secret</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Merchant ID
              </label>
              <input
                type="text"
                value={coinpaymentsForm.merchant_id}
                onChange={(e) => setCoinpaymentsForm({ ...coinpaymentsForm, merchant_id: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Your CoinPayments Merchant ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Public Key
              </label>
              <input
                type="text"
                value={coinpaymentsForm.public_key}
                onChange={(e) => setCoinpaymentsForm({ ...coinpaymentsForm, public_key: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Your CoinPayments Public Key"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Private Key
              </label>
              <input
                type="password"
                value={coinpaymentsForm.private_key}
                onChange={(e) => setCoinpaymentsForm({ ...coinpaymentsForm, private_key: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Your CoinPayments Private Key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                IPN Secret
              </label>
              <input
                type="password"
                value={coinpaymentsForm.ipn_secret}
                onChange={(e) => setCoinpaymentsForm({ ...coinpaymentsForm, ipn_secret: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Your IPN Secret"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Accepted Cryptocurrencies
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {availableCoins.map((coin) => (
                <label key={coin} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={coinpaymentsForm.accepted_coins.includes(coin)}
                    onChange={() => toggleCoin(coin)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{coin}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="cp_is_active"
              checked={coinpaymentsForm.is_active}
              onChange={(e) => setCoinpaymentsForm({ ...coinpaymentsForm, is_active: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <label htmlFor="cp_is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Enable CoinPayments Gateway
            </label>
          </div>

          {coinpaymentsForm.is_active && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Quick Setup</h4>
              <p className="text-green-700 dark:text-green-300 text-sm mb-3">
                Create automatic payment methods for selected coins:
              </p>
              <div className="flex flex-wrap gap-2">
                {coinpaymentsForm.accepted_coins.map((coin) => (
                  <button
                    key={coin}
                    type="button"
                    onClick={() => createAutomaticCoinMethod(coin)}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors"
                  >
                    Create {coin} Method
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setIsCoinPaymentsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? <LoadingSpinner size="sm" /> : 'Save Settings'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Payment Method Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMethod ? 'Edit Payment Method' : 'Create Payment Method'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Method Name
              </label>
              <input
                type="text"
                value={formData.method_name}
                onChange={(e) => setFormData({ ...formData, method_name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Bitcoin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency Name
              </label>
              <input
                type="text"
                value={formData.currency_name}
                onChange={(e) => setFormData({ ...formData, currency_name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., BTC"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min Amount ($)
              </label>
              <input
                type="number"
                value={formData.min_amount}
                onChange={(e) => setFormData({ ...formData, min_amount: parseFloat(e.target.value) })}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Amount ($)
              </label>
              <input
                type="number"
                value={formData.max_amount}
                onChange={(e) => setFormData({ ...formData, max_amount: parseFloat(e.target.value) })}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fee (%)
              </label>
              <input
                type="number"
                value={formData.fee_percentage}
                onChange={(e) => setFormData({ ...formData, fee_percentage: parseFloat(e.target.value) })}
                required
                min="0"
                max="100"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Method Type
              </label>
              <select
                value={formData.method_type}
                onChange={(e) => setFormData({ ...formData, method_type: e.target.value as 'deposit' | 'withdrawal' | 'both' })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="deposit">Deposit Only</option>
                <option value="withdrawal">Withdrawal Only</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gateway Type
              </label>
              <select
                value={formData.gateway_type}
                onChange={(e) => setFormData({ ...formData, gateway_type: e.target.value as 'manual' | 'coinpayments' })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="manual">Manual</option>
                <option value="coinpayments">CoinPayments</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Instructions
            </label>
            <textarea
              value={formData.instruction}
              onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              placeholder="Instructions for users"
            />
          </div>

          {formData.gateway_type === 'manual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Required Fields
              </label>
              {formData.required_fields.map((field, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={field}
                    onChange={(e) => updateRequiredField(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Field name"
                  />
                  <button
                    type="button"
                    onClick={() => removeRequiredField(index)}
                    className="px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addRequiredField}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
              >
                Add Field
              </button>
            </div>
          )}

          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Active Method
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_automatic"
                checked={formData.is_automatic}
                onChange={(e) => setFormData({ ...formData, is_automatic: e.target.checked })}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="is_automatic" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Automatic Processing
              </label>
            </div>
          </div>

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
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? <LoadingSpinner size="sm" /> : editingMethod ? 'Update Method' : 'Create Method'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPaymentMethods;