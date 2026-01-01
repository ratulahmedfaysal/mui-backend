import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Send, Globe } from 'lucide-react';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';

const Footer: React.FC = () => {
  const { settings } = useSiteSettings();

  const socialIcons: any = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    linkedin: Linkedin,
    telegram: Send
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain" />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                {settings.general.siteName}
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              {settings.footer.bio}
            </p>
            <div className="flex space-x-4">
              {Object.entries(settings.socials).map(([platform, url]) => {
                const Icon = socialIcons[platform] || Globe;
                if (!url || url === '#') return null;
                return (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-orange-500 transition-colors">Home</Link></li>
              <li><Link to="/plans" className="text-gray-400 hover:text-orange-500 transition-colors">Plans</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-orange-500 transition-colors">About</Link></li>
              <li><Link to="/how-it-works" className="text-gray-400 hover:text-orange-500 transition-colors">How It Works</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-orange-500 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/faqs" className="text-gray-400 hover:text-orange-500 transition-colors">FAQs</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-orange-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/referral-program" className="text-gray-400 hover:text-orange-500 transition-colors">Referral Program</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-orange-500" />
                <span className="text-gray-400">{settings.contact.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-500" />
                <span className="text-gray-400">{settings.contact.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span className="text-gray-400">{settings.contact.address}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            {settings.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;