import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database } from 'lucide-react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

const Privacy: React.FC = () => {
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
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy Policy
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Database className="w-5 h-5 text-orange-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Personal Information</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We collect information you provide directly, including name, email address, username,
                    and any other information you choose to provide during registration or account updates.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Eye className="w-5 h-5 text-orange-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Usage Information</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We automatically collect information about your use of our platform, including IP address,
                    browser type, device information, and activity logs.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>To provide and maintain our investment platform services</li>
              <li>To process transactions and manage your investments</li>
              <li>To communicate with you about your account and our services</li>
              <li>To detect and prevent fraud and unauthorized activities</li>
              <li>To comply with legal obligations and regulatory requirements</li>
              <li>To improve our platform and develop new features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Information Sharing</h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-800 dark:text-blue-300">Privacy Commitment</span>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                We do not sell, trade, or rent your personal information to third parties for marketing purposes.
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mt-4">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations or court orders</li>
              <li>To protect our rights, property, or safety</li>
              <li>With trusted service providers who assist in platform operations</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Data Security</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>End-to-end encryption for all data transmission</li>
              <li>Secure database storage with regular backups</li>
              <li>Multi-factor authentication for account access</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Employee training on data protection best practices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Your Rights</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>Access: Request a copy of your personal data</li>
              <li>Correction: Update or correct inaccurate information</li>
              <li>Deletion: Request deletion of your personal data (subject to legal requirements)</li>
              <li>Portability: Request transfer of your data to another service</li>
              <li>Objection: Object to certain processing of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Cookies and Tracking</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We use cookies and similar technologies to enhance your experience, analyze usage patterns,
              and provide personalized content. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Data Retention</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We retain your personal information for as long as necessary to provide our services,
              comply with legal obligations, resolve disputes, and enforce our agreements.
              Account information may be retained for up to 7 years after account closure for regulatory compliance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. International Transfers</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own.
              We ensure appropriate safeguards are in place to protect your data during international transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Children's Privacy</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Our platform is not intended for individuals under 18 years of age.
              We do not knowingly collect personal information from children under 18.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              If you have questions about this Privacy Policy or our data practices,
              please contact us at {settings.contact.email} or through our contact page.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;