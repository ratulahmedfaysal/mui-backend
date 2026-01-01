import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Shield, AlertTriangle } from 'lucide-react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

const Terms: React.FC = () => {
  const { settings } = useSiteSettings();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Last updated: January 2024
            </p>
          </motion.div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg space-y-8"
        >
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              By accessing and using {settings.general.siteName} platform, you accept and agree to be bound by the terms and provision of this agreement.
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Investment Risks</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="font-semibold text-yellow-800 dark:text-yellow-300">Important Notice</span>
              </div>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                All investments carry risk. Past performance does not guarantee future results. Only invest what you can afford to lose.
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Cryptocurrency investments are subject to market risks, including extreme volatility and potential total loss.
              {settings.general.siteName} does not guarantee profits or returns on any investment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. User Responsibilities</h2>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>Provide accurate and truthful information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not engage in fraudulent or illegal activities</li>
              <li>Report any suspicious activities to our support team</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Investment Plans</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {settings.general.siteName} offers various investment plans with different terms, minimum amounts, and expected returns.
              By participating in any investment plan, you acknowledge that:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>Returns are not guaranteed and may vary based on market conditions</li>
              <li>Principal amounts are locked for the duration of the chosen plan</li>
              <li>Early withdrawal may result in penalties or loss of returns</li>
              <li>Plan terms may be modified with prior notice</li>
            </ul>

            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-800 dark:text-blue-300">Important Note</span>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Users are required to manually claim their daily ROI. If a user fails to Claim ROI on any given day,
                the ROI for that day will be permanently lost and cannot be recovered.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Referral Program</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Our referral program allows users to earn commissions by referring new investors.
              Referral commissions are subject to terms and conditions, including the requirement to maintain
              an active investment plan. Abuse of the referral system may result in account suspension.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Withdrawals and Deposits</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              All deposits and withdrawals are processed according to our payment policies.
              We reserve the right to request additional verification for large transactions.
              Processing times may vary depending on the payment method and network conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Account Termination</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms,
              engage in fraudulent activities, or pose a risk to the platform's security and integrity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {settings.general.siteName} shall not be liable for any direct, indirect, incidental, special, or consequential damages
              resulting from the use or inability to use our services, even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Changes to Terms</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We reserve the right to modify these terms at any time. Users will be notified of significant changes,
              and continued use of the platform constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at {settings.contact.email}
              or through our contact page.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;