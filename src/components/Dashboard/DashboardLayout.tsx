import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Home,
  CreditCard,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  Activity,
  Settings,
  HeadphonesIcon,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Star,
  DollarSign,
  TrendingUp,
  History
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const { user, logout } = useAuth();
  const { settings } = useSiteSettings();
  const location = useLocation();

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev =>
      prev.includes(menu)
        ? prev.filter(m => m !== menu)
        : [...prev, menu]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (paths: string[]) => paths.some(path => location.pathname.startsWith(path));

  const navigation = [
    { name: 'Dashboard', href: '/user/dashboard', icon: Home },
    { name: 'Claim ROI', href: '/user/claim', icon: Star },
    {
      name: 'Plans',
      icon: CreditCard,
      children: [
        { name: 'All Plans', href: '/user/plans' },
        { name: 'Plans History', href: '/user/plans/history' },
        { name: 'Active Plans', href: '/user/active-plans' },
      ]
    },
    {
      name: 'Refer & Earn',
      icon: Users,
      children: [
        { name: 'Invite Now', href: '/user/refer' },
        { name: 'Referred Users', href: '/user/refer/users' },
      ]
    },
    {
      name: 'Withdraw',
      icon: ArrowUpFromLine,
      children: [
        { name: 'Withdraw Now', href: '/user/withdraw' },
        { name: 'Withdraw History', href: '/user/withdraw/history' },
      ]
    },
    {
      name: 'Deposit',
      icon: ArrowDownToLine,
      children: [
        { name: 'Deposit Now', href: '/user/deposit' },
        { name: 'Deposit History', href: '/user/deposit/history' },
      ]
    },
    { name: 'Transactions', href: '/user/transactions', icon: Activity },
    { name: 'Settings', href: '/user/settings', icon: Settings },
    { name: 'Support', href: '/contact', icon: HeadphonesIcon },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-y-auto scroll-smooth">

      {/* Logo */}
      <div className="flex items-center space-x-2 p-6 border-b border-gray-200 dark:border-gray-700">
        <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
        <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
          {settings.general.siteName.toUpperCase()}
        </span>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">{user?.full_name?.charAt(0) || 'U'}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.full_name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isParentActive(item.children.map(child => child.href))
                    ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                  {openMenus.includes(item.name) ?
                    <ChevronDown className="w-4 h-4" /> :
                    <ChevronRight className="w-4 h-4" />
                  }
                </button>
                {openMenus.includes(item.name) && (
                  <div className="mt-2 ml-8 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.href}
                        className={`block px-4 py-2 text-sm rounded-lg transition-colors ${isActive(child.href)
                          ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
                          : 'text-gray-600 dark:text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                          }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive(item.href)
                  ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
                  : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Balance: <span className="font-semibold text-green-600 dark:text-green-400">${(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;