import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, Gift, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { ReferralSetting } from '../types';
import api from '../lib/api';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const ReferralProgram: React.FC = () => {
  const { settings } = useSiteSettings();
  const [depositSettings, setDepositSettings] = useState<ReferralSetting[]>([]);
  const [investmentSettings, setInvestmentSettings] = useState<ReferralSetting[]>([]);
  const [matchingSettings, setMatchingSettings] = useState<ReferralSetting[]>([]);
  const [careerSettings, setCareerSettings] = useState<ReferralSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralSettings();
  }, []);

  const fetchReferralSettings = async () => {
    try {
      const { data } = await api.get('/referrals');

      if (Array.isArray(data)) {
        const deposit = data.filter((setting: ReferralSetting) => setting.system_type === 'deposit');
        const investment = data.filter((setting: ReferralSetting) => setting.system_type === 'investment');
        const matching = data.filter((setting: ReferralSetting) => setting.system_type === 'matching');
        const career = data.filter((setting: ReferralSetting) => setting.system_type === 'career');

        setDepositSettings(deposit);
        setInvestmentSettings(investment);
        setMatchingSettings(matching);
        setCareerSettings(career);
      } else {
        console.error('Invalid referral settings data:', data);
      }
    } catch (error) {
      console.error('Error fetching referral settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Referral Program
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Earn unlimited passive income by referring friends to {settings.general.siteName}.
              Get commissions on every deposit and investment made by your referrals.
            </p>
          </motion.div>
        </div>

        {/* How It Works */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">1. Invite Friends</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Share your unique referral link with friends and family to invite them to join AuraBit.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">2. They Invest</h3>
              <p className="text-gray-600 dark:text-gray-300">
                When your referrals make deposits or investments, you earn commissions based on their activity.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">3. Earn Commissions</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get instant commissions credited to your wallet. The more they invest, the more you earn!
              </p>
            </div>
          </div>
        </div>

        {/* Commission Tables */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Refer Bonus (formerly Investment Commissions) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Refer Bonus</h3>
                <p className="text-gray-600 dark:text-gray-300">Earn when your referrals invest in plans</p>
              </div>
            </div>

            <div className="space-y-4">
              {investmentSettings.length === 0 ? <p className="text-gray-500 dark:text-gray-400">No active levels</p> : investmentSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {setting.level_number}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Level {setting.level_number}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {setting.commission_percentage}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Commission</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Deposit Commissions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Deposit Bonus</h3>
                <p className="text-gray-600 dark:text-gray-300">Earn when your referrals deposit funds</p>
              </div>
            </div>

            <div className="space-y-4">
              {depositSettings.length === 0 ? <p className="text-gray-500 dark:text-gray-400">No active levels</p> : depositSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {setting.level_number}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Level {setting.level_number}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {setting.commission_percentage}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Commission</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Matching Bonus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Matching Bonus</h3>
                <p className="text-gray-600 dark:text-gray-300">Earn from total team volume</p>
              </div>
            </div>

            <div className="space-y-4">
              {matchingSettings.length === 0 ? <p className="text-gray-500 dark:text-gray-400">No active levels</p> : matchingSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {setting.level_number}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Level {setting.level_number}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {setting.commission_percentage}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Commission</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Career Bonus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Career Bonus</h3>
                <p className="text-gray-600 dark:text-gray-300">Rewards for achieving milestones</p>
              </div>
            </div>

            <div className="space-y-4">
              {careerSettings.length === 0 ? <p className="text-gray-500 dark:text-gray-400">No active levels</p> : careerSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {setting.level_number}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white block">
                        Level {setting.level_number}
                      </span>
                      {setting.reward_type && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {setting.reward_type === 'fixed' ? 'Fixed Reward' : 'Percentage Bonus'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {setting.reward_type === 'fixed'
                        ? `$${setting.reward_amount}`
                        : `${setting.commission_percentage}%`
                      }
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Reward</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Requirements */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl p-8 text-white mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Gift className="w-8 h-8" />
            <h3 className="text-2xl font-bold">Important Requirements</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-3">To Earn Commissions</h4>
              <ul className="space-y-2 text-orange-100">
                <li>• You must have at least one active investment plan</li>
                <li>• Your referrals must successfully complete registration</li>
                <li>• Commissions are paid instantly when referrals invest</li>
                <li>• No limit on the number of referrals you can make</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3">Commission Details</h4>
              <ul className="space-y-2 text-orange-100">
                <li>• Commissions are calculated on the investment amount</li>
                <li>• Multi-level system rewards deep referral networks</li>
                <li>• All commissions are paid in USD to your wallet</li>
                <li>• Instant withdrawal available for all commissions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Start Earning?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Join our referral program and start building your passive income stream today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200"
            >
              Get Started Now
            </a>
            <a
              href="/login"
              className="inline-flex items-center px-8 py-4 border-2 border-orange-500 text-orange-500 font-semibold rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
            >
              Login to Dashboard
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReferralProgram;