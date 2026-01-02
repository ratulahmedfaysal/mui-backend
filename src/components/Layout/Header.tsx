import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { settings } = useSiteSettings();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Plans', href: '/plans' },
    { name: 'Referral', href: '/referral-program' },
    { name: 'About', href: '/about' },
    /* { name: 'How It Works', href: '/how-it-works' },*/
    { name: 'Contact', href: '/contact' },
    { name: 'FAQs', href: '/faqs' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 mr-4">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain" />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                {settings.general.siteName.toUpperCase()}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.href)
                  ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Theme Toggle & User Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="relative group hidden md:block">
                <button className="flex items-center space-x-2 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:block">{user.full_name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    to="/user/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {/*
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors"
                >
                  Login
                </Link>
                */}
                <Link
                  to="/user/dashboard"
                  className="hidden md:flex px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-orange-500 to-yellow-500 rounded-md hover:from-orange-600 hover:to-yellow-600 transition-colors"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.href)
                    ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-2 pb-4 px-3">
                <Link
                  to="/user/dashboard"
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-yellow-500 rounded-md hover:from-orange-600 hover:to-yellow-600 transition-colors shadow-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {user ? 'Go to Dashboard' : 'Join Now'}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;