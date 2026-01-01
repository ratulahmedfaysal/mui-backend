import React, { useState, useEffect } from 'react';
import { Lock, Save, Eye, EyeOff, Coins, Plus, Edit2, Trash2, X, Globe, Phone, Share2, Layout, Database } from 'lucide-react';
import AdminDatabase from './AdminDatabase';
import { motion } from 'framer-motion';
// import { useAuth } from '../../contexts/AuthContext';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import api from '../../lib/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

interface Pair {
  id: number;
  symbol: string;
}

const AdminSettings: React.FC = () => {
  // const { user } = useAuth();
  const { settings, updateSettings, loading: settingsLoading } = useSiteSettings();

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [pairsLoading, setPairsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Existing states
  const [pairsError, setPairsError] = useState('');
  const [pairsSuccess, setPairsSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAddPairModal, setShowAddPairModal] = useState(false);
  const [showEditPairModal, setShowEditPairModal] = useState(false);
  const [editingPair, setEditingPair] = useState<Pair | null>(null);
  const [newPairSymbol, setNewPairSymbol] = useState('');
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Settings form state
  const [formSettings, setFormSettings] = useState(settings);

  useEffect(() => {
    setFormSettings(settings);
  }, [settings]);

  const validatePairInput = (symbol: string): string | null => {
    const trimmedSymbol = symbol.trim().toLowerCase();
    if (!trimmedSymbol) return 'Please enter a symbol';
    return null;
  };

  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      await updateSettings('general', formSettings.general);
      await updateSettings('contact', formSettings.contact);
      await updateSettings('socials', formSettings.socials);
      await updateSettings('footer', formSettings.footer);

      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to update settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPairs();
  }, []);

  const fetchPairs = async () => {
    setPairsLoading(true);
    try {
      const { data } = await api.get('/pairs');
      setPairs((data || []).map((p: any) => ({ ...p, id: p._id || p.id })));
    } catch (error: any) {
      setPairsError('Failed to fetch pairs: ' + error.message);
    } finally {
      setPairsLoading(false);
    }
  };

  // ...

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.newPassword || !passwordData.currentPassword) {
      alert('Please enter current and new password');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      alert('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error updating password:', error);
      alert(error.response?.data?.error || 'Failed to update password');
    }
  };

  // ...

  const handleAddPair = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... validation ...
    const validationError = validatePairInput(newPairSymbol);
    if (validationError) { setPairsError(validationError); return; }

    const formattedSymbol = newPairSymbol.trim().toLowerCase() + 'usdt';

    // ... (check existing local)
    const existingPair = pairs.find(pair => pair.symbol === formattedSymbol);
    if (existingPair) { setPairsError('This pair already exists'); return; }

    setPairsLoading(true);
    try {
      const { data } = await api.post('/pairs', { symbol: formattedSymbol });
      setPairs([...pairs, { ...data, id: data._id || data.id }]);
      // ... success ...
      setNewPairSymbol('');
      setShowAddPairModal(false);
      setPairsSuccess('Pair added successfully!');
    } catch (error: any) {
      setPairsError('Failed to add pair: ' + error.message);
    } finally {
      setPairsLoading(false);
    }
  };

  const handleEditPair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPair) return;
    setPairsError('');
    setPairsSuccess('');
    const validationError = validatePairInput(newPairSymbol);
    if (validationError) { setPairsError(validationError); return; }

    const formattedSymbol = newPairSymbol.trim().toLowerCase() + 'usdt';
    const existingPair = pairs.find(pair => pair.symbol === formattedSymbol && pair.id !== editingPair.id);
    if (existingPair) { setPairsError('This pair already exists'); return; }

    setPairsLoading(true);
    try {
      await api.put(`/pairs/${editingPair.id}`, { symbol: formattedSymbol });
      setPairs(pairs.map(pair => pair.id === editingPair.id ? { ...pair, symbol: formattedSymbol } : pair));
      setNewPairSymbol('');
      setEditingPair(null);
      setShowEditPairModal(false);
      setPairsSuccess('Pair updated successfully!');
      setTimeout(() => setPairsSuccess(''), 3000);
    } catch (error: any) {
      setPairsError('Failed to update pair: ' + error.message);
    } finally {
      setPairsLoading(false);
    }
  };

  const handleDeletePair = async (pairId: number) => {
    if (!confirm('Are you sure you want to delete this pair?')) return;
    setPairsLoading(true);
    setPairsError('');
    try {
      await api.delete(`/pairs/${pairId}`);
      setPairs(pairs.filter(pair => pair.id !== pairId));
      setPairsSuccess('Pair deleted successfully!');
      setTimeout(() => setPairsSuccess(''), 3000);
    } catch (error: any) {
      setPairsError('Failed to delete pair: ' + error.message);
    } finally {
      setPairsLoading(false);
    }
  };

  const openEditModal = (pair: Pair) => {
    setEditingPair(pair);
    setNewPairSymbol(pair.symbol.replace('usdt', ''));
    setShowEditPairModal(true);
    setPairsError('');
  };

  const closeModals = () => {
    setShowAddPairModal(false);
    setShowEditPairModal(false);
    setEditingPair(null);
    setNewPairSymbol('');
    setPairsError('');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'socials', label: 'Socials', icon: Share2 },
    { id: 'footer', label: 'Footer', icon: Layout },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'pairs', label: 'Trading Pairs', icon: Coins },
  ];

  if (settingsLoading) return <div className="flex justify-center p-8"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {(success || error) && (
        <div className={`p-4 rounded-lg border ${success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {success || error}
        </div>
      )}

      {/* Dynamic Settings Forms */}
      {['general', 'contact', 'socials', 'footer'].includes(activeTab) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <form onSubmit={handleSettingsUpdate} className="space-y-6">
            {activeTab === 'general' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Website Name</label>
                  <input
                    type="text"
                    value={formSettings.general.siteName}
                    onChange={e => setFormSettings({ ...formSettings, general: { ...formSettings.general, siteName: e.target.value } })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Meta Title</label>
                  <input
                    type="text"
                    value={formSettings.general.metaTitle}
                    onChange={e => setFormSettings({ ...formSettings, general: { ...formSettings.general, metaTitle: e.target.value } })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Meta Description</label>
                  <textarea
                    rows={3}
                    value={formSettings.general.metaDescription}
                    onChange={e => setFormSettings({ ...formSettings, general: { ...formSettings.general, metaDescription: e.target.value } })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </>
            )}

            {activeTab === 'contact' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email Address</label>
                  <input
                    type="email"
                    value={formSettings.contact.email}
                    onChange={e => setFormSettings({ ...formSettings, contact: { ...formSettings.contact, email: e.target.value } })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Phone Number</label>
                  <input
                    type="text"
                    value={formSettings.contact.phone}
                    onChange={e => setFormSettings({ ...formSettings, contact: { ...formSettings.contact, phone: e.target.value } })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Address</label>
                  <input
                    type="text"
                    value={formSettings.contact.address}
                    onChange={e => setFormSettings({ ...formSettings, contact: { ...formSettings.contact, address: e.target.value } })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </>
            )}

            {activeTab === 'socials' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(formSettings.socials).map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300 capitalize">{key}</label>
                    <input
                      type="text"
                      value={(formSettings.socials as any)[key]}
                      onChange={e => setFormSettings({
                        ...formSettings,
                        socials: { ...formSettings.socials, [key]: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'footer' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Footer Bio</label>
                  <textarea
                    rows={4}
                    value={formSettings.footer.bio}
                    onChange={e => setFormSettings({ ...formSettings, footer: { ...formSettings.footer, bio: e.target.value } })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Copyright Text</label>
                  <input
                    type="text"
                    value={formSettings.footer.copyright}
                    onChange={e => setFormSettings({ ...formSettings, footer: { ...formSettings.footer, copyright: e.target.value } })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
              >
                {loading ? <LoadingSpinner size="sm" /> : <><Save className="w-4 h-4" /><span>Save Changes</span></>}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg max-w-2xl">
          <h2 className="text-xl font-bold mb-6 dark:text-white">Change Password</h2>
          <form onSubmit={handlePasswordUpdate} className="space-y-6">
            {/* ... Password fields ... */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="w-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">
              {loading ? <LoadingSpinner size="sm" /> : 'Update Password'}
            </button>
          </form>
        </motion.div>
      )}

      {/* Pairs Tab */}
      {activeTab === 'pairs' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold dark:text-white">Trading Pairs</h2>
            <button onClick={() => setShowAddPairModal(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center space-x-2">
              <Plus className="w-4 h-4" /> <span>Add Pair</span>
            </button>
          </div>
          {/* Pairs Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4 dark:text-white">ID</th>
                  <th className="text-left py-3 px-4 dark:text-white">Symbol</th>
                  <th className="text-right py-3 px-4 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pairs.map((pair, index) => (
                  <tr key={pair.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 dark:text-white">{index + 1}</td>
                    <td className="py-3 px-4"><span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full uppercase text-sm">{pair.symbol}</span></td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button onClick={() => openEditModal(pair)} className="text-blue-600 hover:bg-blue-100 p-2 rounded"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeletePair(pair.id)} className="text-red-600 hover:bg-red-100 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <AdminDatabase />
        </div>
      )}

      {/* Add/Edit Pair Modals */}
      {(showAddPairModal || showEditPairModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-bold dark:text-white">{showEditPairModal ? 'Edit Pair' : 'Add Pair'}</h3>
              <button onClick={closeModals}><X className="w-5 h-5" /></button>
            </div>
            {(pairsError || pairsSuccess) && (
              <div className={`p-3 mb-4 rounded-lg text-sm ${pairsError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                {pairsError || pairsSuccess}
              </div>
            )}
            <form onSubmit={showEditPairModal ? handleEditPair : handleAddPair}>
              <input
                type="text"
                value={newPairSymbol}
                onChange={e => setNewPairSymbol(e.target.value)}
                placeholder="e.g. BTC"
                className="w-full px-4 py-2 border rounded-lg mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="text-sm text-gray-500 mb-4">USDT is automatically added as quote currency.</p>
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg">{pairsLoading ? <LoadingSpinner size="sm" /> : 'Submit'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;