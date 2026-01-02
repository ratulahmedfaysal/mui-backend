import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, CreditCard, TrendingUp, Wallet, Users, Gift } from 'lucide-react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

const HowItWorks: React.FC = () => {
  const { settings } = useSiteSettings();
  const steps = [
    {
      step: 1,
      icon: UserPlus,
      title: 'Create Account',
      description: 'Sign up with your email and complete the simple registration process. Verify your account to get started.',
    },
    {
      step: 2,
      icon: CreditCard,
      title: 'Choose Your Plan',
      description: 'Select from our 5 investment tiers starting from $100. Each plan offers different returns and benefits.',
    },
    {
      step: 3,
      icon: Wallet,
      title: 'Make Deposit',
      description: 'Fund your account using any major cryptocurrency or bank transfer. Your deposit is secured instantly.',
    },
    {
      step: 4,
      icon: TrendingUp,
      title: 'Start Investing',
      description: 'Invest in your chosen plan and watch your investment start generating daily returns immediately.',
    },
    {
      step: 5,
      icon: Gift,
      title: 'Claim Daily ROI',
      description: 'Claim your daily returns every 24 hours. Withdraw your profits or reinvest for compound growth.',
    },
    {
      step: 6,
      icon: Users,
      title: 'Refer & Earn',
      description: 'Invite friends using your referral link and earn additional commissions on their investments.',
    },
  ];

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
              How It Works
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Start earning crypto rewards in just 6 simple steps. Our automated system handles everything for you.
            </p>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg relative"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto">
                {item.step}
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of investors who are already earning daily crypto rewards with {settings.general.siteName}.
            </p>
            <a
              href="/register"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200"
            >
              Start Investing Today
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;