import React, { useState, useEffect } from 'react';
import { Shield, Copy, CheckCircle, Eye, EyeOff, Download } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';

interface TwoFactorSetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onComplete, onCancel }) => {
  const [setup, setSetup] = useState<{ secret: string; qrCodeUrl: string; backupCodes?: string[] } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    generateSetup();
  }, []);

  const generateSetup = async () => {
    try {
      const { data } = await api.get('/auth/2fa/setup');
      setSetup(data);
    } catch (error: any) {
      console.error('Error generating 2FA setup:', error);
      setError(error.response?.data?.error || 'Failed to generate 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'secret' | 'backup') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'secret') {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      } else {
        setCopiedBackup(true);
        setTimeout(() => setCopiedBackup(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadBackupCodes = () => {
    if (!setup?.backupCodes) return;

    const content = `AuraBit 2FA Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\nUser: ${user?.email}\n\n${setup.backupCodes.join('\n')}\n\nKeep these codes safe! Each code can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AuraBit-backup-codes-${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const verifyAndEnable = async () => {
    if (!setup || !verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const { data } = await api.post('/auth/2fa/enable', {
        secret: setup.secret,
        token: verificationCode
      });

      // Update local state with returned backup codes
      setSetup(prev => prev ? { ...prev, backupCodes: data.backupCodes } : null);

      setStep('backup');
    } catch (error: any) {
      console.error('Error enabling 2FA:', error);
      setError(error.response?.data?.error || 'Failed to enable 2FA. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const completeSetup = () => {
    onComplete();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!setup) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 dark:text-red-400">{error || 'Failed to load 2FA setup'}</p>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {step === 'setup' && (
        <>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Set Up Two-Factor Authentication
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Scan the QR code with Google Authenticator or enter the secret key manually
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div className="text-center mb-4">
              <div className="flex justify-center mb-4">
                <img
                  src={setup.qrCodeUrl}
                  alt="2FA QR Code"
                  className="border rounded-lg shadow-sm w-48 h-48"
                  onError={(e) => {
                    console.error('QR code failed to load:', setup.qrCodeUrl);
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Scan this QR code with Google Authenticator, Authy, or any TOTP app
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secret Key (Manual Entry)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={setup.secret}
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(setup.secret, 'secret')}
                    className="flex items-center space-x-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {copiedSecret ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}

                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Instructions:</h4>
            <ol className="text-blue-700 dark:text-blue-300 text-sm space-y-1 list-decimal list-inside">
              <li>Download Google Authenticator, Authy, or any TOTP app from your app store</li>
              <li>Open the app and tap "Add account" or "+"</li>
              <li>Choose "Scan QR code" and scan the code above</li>
              <li>OR choose "Enter setup key" and paste the secret key manually</li>
              <li>Enter the 6-digit code from the app below to verify</li>
            </ol>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep('verify')}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors"
            >
              Continue
            </button>
          </div>
        </>
      )}

      {step === 'verify' && (
        <>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Verify Your Setup
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Enter the 6-digit code from Google Authenticator to complete setup
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-center text-2xl font-mono tracking-widest"
              maxLength={6}
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setStep('setup')}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
            <button
              onClick={verifyAndEnable}
              disabled={verificationCode.length !== 6 || verifying}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {verifying ? <LoadingSpinner size="sm" /> : 'Verify & Enable'}
            </button>
          </div>
        </>
      )}

      {step === 'backup' && setup?.backupCodes && (
        <>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Save Your Backup Codes
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Store these backup codes in a safe place. You can use them to access your account if you lose your phone.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Backup Codes</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                  className="flex items-center space-x-1 px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded text-sm hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors"
                >
                  {showBackupCodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showBackupCodes ? 'Hide' : 'Show'}</span>
                </button>
                <button
                  onClick={downloadBackupCodes}
                  className="flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {showBackupCodes && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {setup.backupCodes.map((code, index) => (
                    <div key={index} className="bg-white dark:bg-gray-700 p-2 rounded border font-mono text-sm text-center">
                      {code}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => copyToClipboard(setup.backupCodes!.join('\n'), 'backup')}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {copiedBackup ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy All Codes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Important:</h4>
            <ul className="text-red-700 dark:text-red-300 text-sm space-y-1 list-disc list-inside">
              <li>Each backup code can only be used once</li>
              <li>Store these codes in a secure location</li>
              <li>Don't share these codes with anyone</li>
              <li>You can generate new backup codes anytime from settings</li>
            </ul>
          </div>

          <button
            onClick={completeSetup}
            className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors"
          >
            Complete Setup
          </button>
        </>
      )}
    </div>
  );
};

export default TwoFactorSetup;