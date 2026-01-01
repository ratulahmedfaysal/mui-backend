import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { InvestmentPlan } from '../../types';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';

const UserPlans: React.FC = () => {
  const [searchParams] = useSearchParams();
  const selectedPlanId = searchParams.get('plan');
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [investing, setInvesting] = useState(false);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (selectedPlanId && plans.length > 0) {
      const plan = plans.find(p => p.id === selectedPlanId);
      if (plan) {
        setSelectedPlan(plan);
        setIsModalOpen(true);
      }
    }
  }, [selectedPlanId, plans]);

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/investment-plans');
      if (Array.isArray(data)) {
        setPlans(data.map((p: any) => ({ ...p, id: p._id || p.id })));
      } else {
        console.error('Invalid plans data received:', data);
        setPlans([]);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvestment = async () => {
    if (!selectedPlan || !user) return;

    const amount = parseFloat(investmentAmount);
    if (amount < selectedPlan.min_amount || amount > selectedPlan.max_amount) {
      alert(`Investment amount must be between $${selectedPlan.min_amount} and $${selectedPlan.max_amount}`);
      return;
    }

    if (amount > (user.balance || 0)) {
      alert('Insufficient wallet balance');
      return;
    }

    setInvesting(true);

    try {
      // Backend handles everything: balance, transaction, investment record, commissions
      await api.post('/investments', {
        plan_id: selectedPlan.id,
        amount: amount
      });

      await refreshUser();
      setIsModalOpen(false);
      setInvestmentAmount('');
      alert('Investment successful!\n\nImportant Note:  You need to claim your ROI daily. If you miss any day, you will lose your ROI for that day.\n\nMake sure to check your dashboard regularly and claim your daily returns to maximize your investment benefits.');
    } catch (error: any) {
      console.error('Error creating investment:', error);
      alert(error.response?.data?.error || 'Failed to create investment. Please try again.');
    } finally {
      setInvesting(false);
    }
  };

  const getPlanColor = (index: number) => {
    const colors = [
      'from-green-500 to-emerald-500',
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-indigo-500',
      'from-orange-500 to-yellow-500',
      'from-pink-500 to-rose-500',
    ];
    return colors[index % colors.length];
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investment Plans</h1>
        <div className="bg-green-100 dark:bg-green-900/20 px-4 py-2 rounded-lg">
          <span className="text-green-800 dark:text-green-300 font-medium">
            Balance: ${(user?.balance || 0).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className={`bg-gradient-to-r ${getPlanColor(index)} p-6 text-white`}>
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-white/90 mb-4">{plan.subtitle}</p>
              <div className="text-3xl font-bold">{plan.daily_roi_percentage}%</div>
              <div className="text-white/90">Daily Returns</div>
            </div>

            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Min Amount</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${plan.min_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Max Amount</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${plan.max_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{plan.duration_days} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Return</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {(plan.daily_roi_percentage * plan.duration_days).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Capital Return</span>
                  <span className={`font-semibold ${plan.return_principal ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    {plan.return_principal ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Features</h4>
                <ul className="space-y-2">
                  {plan.features.slice(0, 3).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  setSelectedPlan(plan);
                  setIsModalOpen(true);
                }}
                className={`w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r ${getPlanColor(index)} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200`}
              >
                <DollarSign className="w-5 h-5" />
                <span>Invest Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setInvestmentAmount('');
        }}
        title={`Invest in ${selectedPlan?.name}`}
      >
        {selectedPlan && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Plan Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Daily ROI</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedPlan.daily_roi_percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedPlan.duration_days} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Min - Max</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${selectedPlan.min_amount.toLocaleString()} - ${selectedPlan.max_amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Investment Amount
              </label>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                min={selectedPlan.min_amount}
                max={selectedPlan.max_amount}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                placeholder={`Enter amount ($${selectedPlan.min_amount} - $${selectedPlan.max_amount})`}
              />
            </div>

            {investmentAmount && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Investment Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-400">Investment Amount</span>
                    <span className="font-medium text-green-800 dark:text-green-300">${parseFloat(investmentAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-400">Daily ROI</span>
                    <span className="font-medium text-green-800 dark:text-green-300">
                      ${((parseFloat(investmentAmount) * selectedPlan.daily_roi_percentage) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-400">Total Return</span>
                    <span className="font-medium text-green-800 dark:text-green-300">
                      ${((parseFloat(investmentAmount) * selectedPlan.daily_roi_percentage * selectedPlan.duration_days) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setInvestmentAmount('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvestment}
                disabled={!investmentAmount || investing}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {investing ? <LoadingSpinner size="sm" /> : 'Confirm Investment'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserPlans;