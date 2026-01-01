import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { InvestmentPlan } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';

const AdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    min_amount: 0,
    max_amount: 0,
    daily_roi_percentage: 0,
    duration_days: 0,
    features: [''],
    is_active: true,
    return_principal: false,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/plans/admin');
      setPlans((data || []).map((p: any) => ({ ...p, id: p._id || p.id })));
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (plan?: InvestmentPlan) => {
    // ... same logic
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        subtitle: plan.subtitle || '',
        min_amount: plan.min_amount,
        max_amount: plan.max_amount,
        daily_roi_percentage: plan.daily_roi_percentage,
        duration_days: plan.duration_days,
        features: plan.features,
        is_active: plan.is_active,
        return_principal: plan.return_principal || false,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        subtitle: '',
        min_amount: 0,
        max_amount: 0,
        daily_roi_percentage: 0,
        duration_days: 0,
        features: [''],
        is_active: true,
        return_principal: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const planData = {
        ...formData,
        features: formData.features.filter((f: string) => f.trim() !== ''),
        updated_at: new Date().toISOString(),
      };

      if (editingPlan) {
        await api.put(`/plans/${editingPlan.id}`, planData);
        alert('Plan updated successfully!');
      } else {
        await api.post('/plans', planData);
        alert('Plan created successfully!');
      }

      setIsModalOpen(false);
      await fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save plan');
    } finally {
      setSubmitting(false);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      await api.delete(`/plans/${planId}`);
      alert('Plan deleted successfully!');
      await fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan');
    }
  };

  const togglePlanStatus = async (planId: string, isActive: boolean) => {
    try {
      await api.put(`/plans/${planId}`, {
        is_active: !isActive,
        updated_at: new Date().toISOString()
      });
      await fetchPlans();
    } catch (error) {
      console.error('Error updating plan status:', error);
      alert('Failed to update plan status');
    }
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({
      ...formData,
      features: newFeatures
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investment Plans</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Plan</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan: InvestmentPlan, index: number) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-purple-100">{plan.subtitle}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${plan.is_active
                  ? 'bg-green-500/20 text-green-100'
                  : 'bg-red-500/20 text-red-100'
                  }`}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Daily ROI:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {plan.daily_roi_percentage}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {plan.duration_days} Days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Min Amount:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${plan.min_amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Max Amount:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${plan.max_amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => openModal(plan)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => togglePlanStatus(plan.id, plan.is_active)}
                  className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition-colors ${plan.is_active
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40'
                    : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40'
                    }`}
                >
                  <span>{plan.is_active ? 'Disable' : 'Enable'}</span>
                </button>
                <button
                  onClick={() => deletePlan(plan.id)}
                  className="px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Plan Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? 'Edit Plan' : 'Create New Plan'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plan Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Starter Plan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, subtitle: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Perfect for beginners"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Amount ($)
              </label>
              <input
                type="number"
                value={formData.min_amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, min_amount: parseFloat(e.target.value) })}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Amount ($)
              </label>
              <input
                type="number"
                value={formData.max_amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, max_amount: parseFloat(e.target.value) })}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Daily ROI (%)
              </label>
              <input
                type="number"
                value={formData.daily_roi_percentage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, daily_roi_percentage: parseFloat(e.target.value) })}
                required
                min="0"
                max="100"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (Days)
              </label>
              <input
                type="number"
                value={formData.duration_days}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                required
                min="1"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Features
            </label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFeature(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter feature"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
            >
              Add Feature
            </button>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="return_principal"
                checked={formData.return_principal}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, return_principal: e.target.checked })}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="return_principal" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Return Principal on Expiry
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Active Plan
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
              {submitting ? <LoadingSpinner size="sm" /> : editingPlan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPlans;