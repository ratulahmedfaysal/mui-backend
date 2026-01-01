import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle, Users, DollarSign, Share2, Gift, GitMerge, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { ReferralSetting } from '../../types';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Refer: React.FC = () => {
  const [depositSettings, setDepositSettings] = useState<ReferralSetting[]>([]);
  const [investmentSettings, setInvestmentSettings] = useState<ReferralSetting[]>([]);
  const [matchingSettings, setMatchingSettings] = useState<ReferralSetting[]>([]);
  const [careerSettings, setCareerSettings] = useState<ReferralSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const { user } = useAuth();

  const referralLink = `${window.location.origin}/register?ref=${user?.referral_code}`;

  useEffect(() => {
    fetchReferralSettings();
  }, []);

  const fetchReferralSettings = async () => {
    try {
      const { data } = await api.get('/referrals');

      const deposit = data?.filter((setting: any) => setting.system_type === 'deposit') || [];
      const investment = data?.filter((setting: any) => setting.system_type === 'investment') || [];
      const matching = data?.filter((setting: any) => setting.system_type === 'matching') || [];
      const career = data?.filter((setting: any) => setting.system_type === 'career') || [];

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

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const renderSettingsSection = (title: string, subtitle: string, settings: ReferralSetting[], icon: React.ReactNode, colorClass: string, badgeColor: string) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300">{subtitle}</p>
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
            <div className="text-right">
              <div className={`text-xl font-bold ${badgeColor}`}>
                {setting.commission_percentage}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Commission</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invite & Earn</h1>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
        <div className="text-center mb-6">
          <Share2 className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Share Your Referral Link</h2>
          <p className="text-purple-100">
            Invite friends and earn commissions on their deposits and investments
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-100 mb-2">Your Referral Link</label>
            <div className="relative">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="w-full pr-10 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-200"
              />
              <div
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                onClick={() => handleCopy(referralLink, 'link')}
              >
                {copied === 'link' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-white" />}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-100 mb-2">Your Referral Code</label>
            <div className="relative">
              <input
                type="text"
                value={user?.referral_code || ''}
                readOnly
                className="w-full pr-10 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-200"
              />
              <div
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                onClick={() => handleCopy(user?.referral_code || '', 'code')}
              >
                {copied === 'code' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-white" />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {renderSettingsSection(
          'Deposit Bonus',
          'Earn when referrals deposit funds',
          depositSettings,
          <DollarSign className="w-6 h-6 text-white" />,
          'bg-gradient-to-r from-blue-500 to-cyan-500',
          'text-blue-600 dark:text-blue-400'
        )}

        {renderSettingsSection(
          'Referral Bonus',
          'Earn when referrals invest in plans',
          investmentSettings,
          <Users className="w-6 h-6 text-white" />,
          'bg-gradient-to-r from-green-500 to-emerald-500',
          'text-green-600 dark:text-green-400'
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

      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Gift className="w-6 h-6" />
          <h3 className="text-xl font-bold">Important Requirements</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">To Earn Commissions</h4>
            <ul className="space-y-2 text-orange-100 text-sm">
              <li>• You must have at least one active investment plan</li>
              <li>• Your referrals must successfully complete registration</li>
              <li>• Commissions are paid instantly when referrals invest</li>
              <li>• No limit on the number of referrals you can make</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Commission Details</h4>
            <ul className="space-y-2 text-orange-100 text-sm">
              <li>• Commissions are calculated on the investment amount</li>
              <li>• Multi-level system rewards deep referral networks</li>
              <li>• All commissions are paid in USD to your wallet</li>
              <li>• Instant withdrawal available for all commissions</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How to Share</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Share2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Social Media</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Share your referral link on Facebook, Twitter, Instagram, and other social platforms.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Friends & Family</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Personally invite friends and family members who are interested in crypto investments.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Gift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Communities</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Share in crypto communities, forums, and investment groups (follow community rules).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Refer;
