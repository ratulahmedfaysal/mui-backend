import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const AdminDatabase: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [progress, setProgress] = useState<string>('');
    const [cleanBeforeRestore, setCleanBeforeRestore] = useState(false);



    const handleBackup = async () => {
        try {
            setLoading(true);
            setMessage(null);
            setProgress('Starting backup...');

            const { data } = await api.get('/database/backup');

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `aurabit_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            setMessage({ type: 'success', text: 'Database backup downloaded successfully!' });
        } catch (error: any) {
            console.error('Backup error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to create backup' });
        } finally {
            setLoading(false);
            setProgress('');
        }
    };

    const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!window.confirm('WARNING: restoring will overwrite existing data. Are you sure?')) {
            event.target.value = '';
            return;
        }

        try {
            setLoading(true);
            setMessage(null);
            setProgress('Reading file...');

            const text = await file.text();
            const backupData = JSON.parse(text);

            // Validate structure roughly
            if (!backupData || typeof backupData !== 'object') {
                throw new Error('Invalid backup file format');
            }

            setProgress('Restoring data...');
            await api.post(`/database/restore?clean=${cleanBeforeRestore}`, backupData);

            setMessage({ type: 'success', text: 'Database restored successfully!' });
            event.target.value = ''; // Reset input
        } catch (error: any) {
            console.error('Restore error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to restore database' });
        } finally {
            setLoading(false);
            setProgress('');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Database Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">Backup and restore system data</p>
                </div>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg flex items-center space-x-3 ${message.type === 'success'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                >
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <span>{message.text}</span>
                </motion.div>
            )}

            {loading && progress && (
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-4 rounded-lg flex items-center space-x-3">
                    <LoadingSpinner size="sm" />
                    <span>{progress}</span>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {/* Backup Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
                >
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                            <Download className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Backup Database</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Create a full backup of all system data including users, investments, settings, and transactions.
                            The backup will be downloaded as a JSON file.
                        </p>
                        <button
                            onClick={handleBackup}
                            disabled={loading}
                            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-5 h-5" />
                            <span>Download Backup</span>
                        </button>
                    </div>
                </motion.div>

                {/* Restore Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
                >
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center">
                            <Upload className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Restore Database</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Restore system data from a backup file.
                            <span className="block text-red-500 font-medium mt-1">
                                Warning: This will overwrite existing data matching the IDs in the file.
                            </span>
                        </p>
                        <div className="mt-4 relative">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleRestore}
                                disabled={loading}
                                className="hidden"
                                id="restore-file-input"
                            />
                            <label
                                htmlFor="restore-file-input"
                                className={`cursor-pointer px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center space-x-2 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Upload className="w-5 h-5" />
                                <span>Select Backup File</span>
                            </label>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Important Notes</h3>
                    <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-400 list-disc list-inside space-y-1">
                        <li>Backups contain sensitive user data. Store them securely.</li>
                        <li>Restoring data will merge/overwrite existing records with the same ID.</li>
                        <li>If you have new data that conflicts with the backup, it may be overwritten.</li>
                        <li>Always perform a backup before attempting a restore.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDatabase;
