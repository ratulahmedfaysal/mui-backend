import React, { useState, useEffect } from 'react';
import { Users, Edit, Plus, GitMerge, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { ReferralSetting } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';

const AdminReferrals: React.FC = () => {
  const [depositSettings, setDepositSettings] = useState<ReferralSetting[]>([]);
  const [investmentSettings, setInvestmentSettings] = useState<ReferralSetting[]>([]);
  const [matchingSettings, setMatchingSettings] = useState<ReferralSetting[]>([]);
  const [careerSettings, setCareerSettings] = useState<ReferralSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<ReferralSetting | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<ReferralSetting>>({
    system_type: 'deposit',
    level_number: 1,
    commission_percentage: 0,
    is_active: true,
    required_referrals: 0,
    required_investment: 0,
    required_team_volume: 0,
    reward_type: 'percentage',
    reward_amount: 0,
  });

  useEffect(() => {
    fetchReferralSettings();
  }, []);

  const fetchReferralSettings = async () => {
    try {
      const { data } = await api.get('/referrals/admin');
      // data is array of settings
      if (!data) return;

      const settings = (data || []).map((s: any) => ({ ...s, id: s._id || s.id }));
      const deposit = settings.filter((s: ReferralSetting) => s.system_type === 'deposit') || [];
      const investment = settings.filter((s: ReferralSetting) => s.system_type === 'investment') || [];
      const matching = settings.filter((s: ReferralSetting) => s.system_type === 'matching') || [];
      const career = settings.filter((s: ReferralSetting) => s.system_type === 'career') || [];

      setDepositSettings(deposit);
      setInvestmentSettings(investment);
      setMatchingSettings(matching);
      setCareerSettings(career);
    } catch (error) {
      console.error('Error fetching referral settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (setting?: ReferralSetting) => {
    if (setting) {
      setEditingSetting(setting);
      setFormData({
        system_type: setting.system_type,
        level_number: setting.level_number,
        commission_percentage: setting.commission_percentage,
        is_active: setting.is_active,
        required_referrals: setting.required_referrals || 0,
        required_investment: setting.required_investment || 0,
        required_team_volume: setting.required_team_volume || 0,
        reward_type: setting.reward_type || 'percentage',
        reward_amount: setting.reward_amount || 0,
      });
    } else {
      setEditingSetting(null);
      setFormData({
        system_type: 'deposit',
        level_number: 1,
        commission_percentage: 0,
        is_active: true,
        required_referrals: 0,
        required_investment: 0,
        required_team_volume: 0,
        reward_type: 'percentage',
        reward_amount: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingSetting) {
        await api.put(`/referrals/${editingSetting.id}`, formData);
        alert('Referral setting updated successfully!');
      } else {
        await api.post('/referrals', formData);
        alert('Referral setting created successfully!');
      }

      setIsModalOpen(false);
      await fetchReferralSettings();
    } catch (error) {
      console.error('Error saving referral setting:', error);
      alert('Failed to save referral setting');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSettingStatus = async (settingId: string, isActive: boolean) => {
    try {
      await api.put(`/referrals/${settingId}`, { is_active: !isActive });
      await fetchReferralSettings();
    } catch (error) {
      console.error('Error updating referral setting status:', error);
      alert('Failed to update referral setting status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const renderSettingsSection = (title: string, subtitle: string, settings: ReferralSetting[], icon: React.ReactNode, colorClass: string, badgeColor: string) => {
    const isCareer = title === 'Career Bonus';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center`}>
              {icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {settings.length === 0 && <p className="text-center text-gray-500 py-4">No levels configured</p>}
          {settings.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${colorClass} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                  {setting.level_number}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  Level {setting.level_number}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={`text-xl font-bold ${badgeColor}`}>
                    {isCareer && setting.reward_type === 'fixed'
                      ? `$${setting.reward_amount}`
                      : `${setting.commission_percentage}%`
                    }
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {isCareer ? 'Reward' : 'Commission'}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openModal(setting)}
                    className="p-2 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleSettingStatus(setting.id, setting.is_active)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${setting.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}
                  >
                    {setting.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };



  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referral Settings</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Level</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {renderSettingsSection(
          'Referral Bonus',
          'Earn when referrals invest in plans',
          investmentSettings,
          <Users className="w-6 h-6 text-white" />,
          'bg-gradient-to-r from-green-500 to-emerald-500',
          'text-green-600 dark:text-green-400'
        )}

        {renderSettingsSection(
          'Deposit Bonus',
          'Earn when referrals deposit funds',
          depositSettings,
          <Users className="w-6 h-6 text-white" />,
          'bg-gradient-to-r from-blue-500 to-cyan-500',
          'text-blue-600 dark:text-blue-400'
        )}

        {renderSettingsSection(
          'Matching Bonus',
          'Earn from total team volume',
          matchingSettings,
          <GitMerge className="w-6 h-6 text-white" />,
          'bg-gradient-to-r from-purple-500 to-pink-500',
          'text-purple-600 dark:text-purple-400'
        )}

        {renderSettingsSection(
          'Career Bonus',
          'Rewards for achieving milestones',
          careerSettings,
          <Award className="w-6 h-6 text-white" />,
          'bg-gradient-to-r from-orange-500 to-red-500',
          'text-orange-600 dark:text-orange-400'
        )}
      </div>

      {/* Referral Setting Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSetting ? 'Edit Referral Level' : 'Add Referral Level'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              System Type
            </label>
            <select
              value={formData.system_type}
              onChange={(e) => setFormData({ ...formData, system_type: e.target.value as any })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="deposit">Deposit Bonus</option>
              <option value="investment">Referral Bonus</option>
              <option value="matching">Matching Bonus</option>
              <option value="career">Career Bonus</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Level Number
            </label>
            <input
              type="number"
              value={formData.level_number}
              onChange={(e) => setFormData({ ...formData, level_number: parseInt(e.target.value) })}
              required
              min="1"
              max="20"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {formData.system_type !== 'career' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Commission Percentage (%)
              </label>
              <input
                type="number"
                value={formData.commission_percentage}
                onChange={(e) => setFormData({ ...formData, commission_percentage: parseFloat(e.target.value) })}
                required
                min="0"
                max="100"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          {/* New Fields for Career/Matching */}
          {(formData.system_type === 'career' || formData.system_type === 'matching') && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white">Qualification Requirements</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Direct Referrals
                  </label>
                  <input
                    type="number"
                    value={formData.required_referrals || 0}
                    onChange={(e) => setFormData({ ...formData, required_referrals: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {formData.system_type === 'career' ? 'Min Personal Investment' : 'Min Team Investment'}
                  </label>
                  <input
                    type="number"
                    value={formData.required_investment || 0}
                    onChange={(e) => setFormData({ ...formData, required_investment: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {formData.system_type === 'career' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Team Volume
                  </label>
                  <input
                    type="number"
                    value={formData.required_team_volume || 0}
                    onChange={(e) => setFormData({ ...formData, required_team_volume: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              {formData.system_type === 'career' && (
                <>
                  <h4 className="font-medium text-gray-900 dark:text-white pt-2">Reward Settings</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reward Type
                    </label>
                    <select
                      value={formData.reward_type || 'percentage'}
                      onChange={(e) => setFormData({ ...formData, reward_type: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ({'$'})</option>
                    </select>
                  </div>
                  {formData.reward_type === 'fixed' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fixed Reward Amount
                      </label>
                      <input
                        type="number"
                        value={formData.reward_amount || 0}
                        onChange={(e) => setFormData({ ...formData, reward_amount: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Commission Percentage (%)
                      </label>
                      <input
                        type="number"
                        value={formData.commission_percentage}
                        onChange={(e) => setFormData({ ...formData, commission_percentage: parseFloat(e.target.value) })}
                        required
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Active Level
            </label>
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
              {submitting ? <LoadingSpinner size="sm" /> : editingSetting ? 'Update Level' : 'Create Level'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminReferrals;