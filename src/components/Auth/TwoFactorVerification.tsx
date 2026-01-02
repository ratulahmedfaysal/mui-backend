import React, { useState } from 'react';
import { Shield, AlertCircle, X } from 'lucide-react';
import LoadingSpinner from '../Common/LoadingSpinner';
import api from '../../lib/api';

interface TwoFactorVerificationProps {
  secret: string;
  backupCodes: string[];
  onSuccess: () => void;
  onCancel: () => void;
  userEmail: string;
}

const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerification = async () => {
    if (!code.trim()) {
      setError('Please enter a verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/2fa/verify', {
        code: useBackupCode ? code.toUpperCase() : code
      });

      if (data.success) {
        onSuccess();
      } else {
        setError('Invalid verification code');
      }
    } catch (error: any) {
      console.error('2FA verification error:', error);
      setError(error.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerification();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fade-in">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Two-Factor Authentication
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {useBackupCode
              ? 'Enter one of your backup codes'
              : 'Enter the 6-digit code from your authenticator app'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {useBackupCode ? 'Backup Code' : 'Verification Code'}
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = useBackupCode
                  ? e.target.value.toUpperCase().slice(0, 6)
                  : e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
              }}
              onKeyPress={handleKeyPress}
              placeholder={useBackupCode ? 'ABC123' : '000000'}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-center text-2xl font-mono tracking-widest"
              maxLength={6}
              autoComplete="off"
            />
          </div>

          <button
            onClick={handleVerification}
            disabled={code.length !== 6 || loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? <LoadingSpinner size="sm" color="white" /> : 'Verify'}
          </button>

          <div className="text-center">
            <button
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setCode('');
                setError('');
              }}
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              {useBackupCode
                ? 'Use authenticator code instead'
                : 'Use backup code instead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerification;
