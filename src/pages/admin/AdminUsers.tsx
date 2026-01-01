import React, { useState, useEffect } from 'react';
import { Search, Filter, Ban, Eye, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { User } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';
import { format } from 'date-fns';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletAction, setWalletAction] = useState<'add' | 'deduct'>('add');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletNote, setWalletNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        switch (statusFilter) {
          case 'active':
            return user.is_active && !user.is_banned;
          case 'inactive':
            return !user.is_active;
          case 'banned':
            return user.is_banned;
          case 'admin':
            return user.role === 'admin'; // Changed from is_admin
          default:
            return true;
        }
      });
    }

    setFilteredUsers(filtered);
  };

  const updateUserStatus = async (userId: string, updates: Partial<User>) => {
    setUpdating(true);
    try {
      const { data } = await api.put(`/users/${userId}`, updates);

      setUsers(users.map(user =>
        user.id === userId ? { ...user, ...data } : user
      ));

      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, ...data });
      }

      alert('User updated successfully!');
    } catch (error: any) {
      console.error('Error updating user:', error);
      alert('Failed to update user: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleWalletUpdate = async () => {
    if (!selectedUser || !walletAmount) return;

    setUpdating(true);
    try {
      const amount = parseFloat(walletAmount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      //   const currentBalance = selectedUser.wallet_balance; // Not needed strictly for API call but good for UI

      const { data } = await api.post('/transactions/admin/adjust-balance', {
        user_id: selectedUser.id,
        amount,
        type: walletAction, // 'add' or 'deduct'
        description: walletNote
      });

      // Update local state
      // data.user has updated balance
      const updatedUser = { ...selectedUser, ...data.user, wallet_balance: data.user.balance };

      setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
      setSelectedUser(updatedUser);

      setIsWalletModalOpen(false);
      setWalletAmount('');
      setWalletNote('');
      alert(`Successfully ${walletAction === 'add' ? 'added' : 'deducted'} $${amount.toFixed(2)} ${walletAction === 'add' ? 'to' : 'from'} user's wallet`);
    } catch (error: any) {
      console.error('Error updating wallet:', error);
      alert('Failed to update wallet balance: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const openWalletModal = (action: 'add' | 'deduct') => {
    setWalletAction(action);
    setWalletAmount('');
    setWalletNote('');
    setIsWalletModalOpen(true);
  };
  const viewUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Users</h1>
        <div className="bg-blue-100 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
          <span className="text-blue-800 dark:text-blue-300 font-medium">
            Total Users: {users.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Users</option>
              <option value="active">Active Users</option>
              <option value="inactive">Inactive Users</option>
              <option value="banned">Banned Users</option>
              <option value="admin">Admin Users</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Invested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.02 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.full_name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.full_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${user.balance?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                    ${user.total_invested?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {user.is_banned && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          Banned
                        </span>
                      )}
                      {user.role === 'admin' && ( // is_admin is not on model, role is.
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                          Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(user.created_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewUser(user)}
                        className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/*
                      <button
                        onClick={() => updateUserStatus(user.id, { is_active: !user.is_active })}
                        disabled={updating}
                        className={`p-2 rounded-lg transition-colors ${
                          user.is_active
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40'
                            : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40'
                        }`}
                      >
                        {user.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      */}

                      <button
                        onClick={() => updateUserStatus(user.id, { is_banned: !user.is_banned })}
                        disabled={updating}
                        className={`p-2 rounded-lg transition-colors ${user.is_banned
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40'
                          }`}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Personal Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Full Name:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedUser.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Username:</span>
                    <span className="font-medium text-gray-900 dark:text-white">@{selectedUser.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Referral Code:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedUser.referral_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Referred By:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedUser.referred_by}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Financial Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Wallet Balance:</span>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ${selectedUser.balance?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Invested</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ${selectedUser.total_invested?.toFixed(2) || '0.00'}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">ROI Earned:</span>
                      <span className="font-medium text-purple-600 dark:text-purple-400">${selectedUser.total_roi_earned?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Referral Earned:</span>
                      <span className="font-medium text-orange-600 dark:text-orange-400">${selectedUser.total_referral_earned?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => openWalletModal('add')}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Balance</span>
                </button>
                <button
                  onClick={() => openWalletModal('deduct')}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                  <span>Deduct Balance</span>
                </button>
                <button
                  // onClick={() => updateUserStatus(selectedUser.id, { is_admin: !selectedUser.is_admin })}
                  onClick={() => alert("Role update not fully implemented in UI, requires backend logic to toggle role")}
                  disabled={updating}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${selectedUser.role === 'admin'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                    }`}
                >
                  {updating ? <LoadingSpinner size="sm" /> : selectedUser.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                </button>
                <button
                  onClick={() => updateUserStatus(selectedUser.id, { is_banned: !selectedUser.is_banned })}
                  disabled={updating}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${selectedUser.is_banned
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                >
                  {selectedUser.is_banned ? 'Unban User' : 'Ban User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Wallet Update Modal */}
      <Modal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        title={`${walletAction === 'add' ? 'Add' : 'Deduct'} Balance`}
      >
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">User: {selectedUser?.full_name}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current Balance: <span className="font-medium text-green-600 dark:text-green-400">${(selectedUser?.balance || 0).toFixed(2)}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              value={walletAmount}
              onChange={(e) => setWalletAmount(e.target.value)}
              min="0.01"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note (Optional)
            </label>
            <textarea
              value={walletNote}
              onChange={(e) => setWalletNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              placeholder="Reason for balance adjustment..."
            />
          </div>

          {walletAmount && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-400">Current Balance:</span>
                  <span className="font-medium text-blue-800 dark:text-blue-300">${(selectedUser?.balance || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-400">
                    {walletAction === 'add' ? 'Adding:' : 'Deducting:'}
                  </span>
                  <span className={`font-medium ${walletAction === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                    {walletAction === 'add' ? '+' : '-'}${parseFloat(walletAmount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-blue-200 dark:border-blue-700 pt-1">
                  <span className="font-semibold text-blue-800 dark:text-blue-300">New Balance:</span>
                  <span className="font-semibold text-blue-800 dark:text-blue-300">
                    ${walletAction === 'add'
                      ? ((selectedUser?.balance || 0) + parseFloat(walletAmount)).toFixed(2)
                      : ((selectedUser?.balance || 0) - parseFloat(walletAmount)).toFixed(2)
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={() => setIsWalletModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleWalletUpdate}
              disabled={!walletAmount || updating}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${walletAction === 'add'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {updating ? <LoadingSpinner size="sm" /> : `${walletAction === 'add' ? 'Add' : 'Deduct'} Balance`}
            </button>
          </div>
        </div>
      </Modal >
    </div>
  );
};

export default AdminUsers;