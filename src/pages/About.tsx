import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Users, Activity } from 'lucide-react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

const About: React.FC = () => {
  const { settings } = useSiteSettings();
  const features = [
    {
      icon: Activity,
      title: 'Advanced AI Algorithms',
      description: 'Our proprietary trading bots analyze market patterns in milliseconds, executing high-frequency trades across Forex and Crypto pairs.',
    },
    {
      icon: TrendingUp,
      title: 'Institutional Strategies',
      description: 'We bring hedge-fund grade trading strategies to retail investors, providing access to opportunities previously reserved for the elite.',
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your capital is secured with segregated cold storage and multi-signature wallets, ensuring maximum protection for your assets.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: `Join a thriving community of 25,000+ traders who trust ${settings.general.siteName} for their passive income generation.`,
    },
  ];

  const stats = [
    { label: 'Active Traders', value: '25,000+' },
    { label: 'Total Volume', value: '$150M+' },
    { label: 'Win Rate', value: '87%' },
    { label: 'Markets', value: '100+' },
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
              About {settings.general.siteName}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We are a next-generation financial technology company utilizing artificial intelligence
              to automate profit generation in the global Forex and Cryptocurrency markets.
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-orange-500 mb-2">{stat.value}</div>
              <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-green-500 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Mission */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white text-center shadow-xl">
          <h2 className="text-3xl font-bold mb-4 text-orange-500">Our Mission</h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            To democratize access to institutional-grade automated trading, empowering individuals worldwide
            to create sustainable passive income streams regardless of their market knowledge.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;