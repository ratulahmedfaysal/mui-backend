import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

interface SiteSettings {
    general: {
        siteName: string;
        metaTitle: string;
        metaDescription: string;
    };
    contact: {
        email: string;
        phone: string;
        address: string;
    };
    socials: {
        facebook: string;
        twitter: string;
        instagram: string;
        telegram: string;
        linkedin: string;
    };
    footer: {
        bio: string;
        copyright: string;
    };
    hero: {
        title: string;
        subtitle: string;
        tagline: string;
        ctaPrimary: string;
        ctaSecondary: string;
    };
    section_headers: {
        how_it_works: { title: string; subtitle: string };
        why_choose_us: { title: string; subtitle: string };
        investor_reviews: { title: string; subtitle: string };
        faq: { title: string; subtitle: string };
        about: { title: string; subtitle: string };
        cta: { title: string; subtitle: string; buttonText: string };
    };
    faqs: Array<{ id: string; question: string; answer: string }>;
    howItWorks: Array<{ id: string; title: string; description: string; icon: string }>;
    whyChooseUs: Array<{ id: string; title: string; description: string; icon: string }>;
    reviews: Array<{ id: string; name: string; role: string; comment: string; rating: number; image: string }>;
    livePerformance: {
        totalProfitPaid: string;
    };
    diversificationItems: Array<{ id: string; title: string; description: string; icon: string; features: string[] }>;
}

const defaultSettings: SiteSettings = {
    general: {
        siteName: 'AuraBit',
        metaTitle: 'AuraBit - Automated Crypto & Forex Trading Platform',
        metaDescription: 'Generate passive income through expert-managed cryptocurrency and forex trading strategies.',
    },
    contact: {
        email: 'support@AuraBit.com',
        phone: '+1 (555) 123-4567',
        address: '123 Financial District, London, UK',
    },
    socials: {
        facebook: '#',
        twitter: '#',
        instagram: '#',
        telegram: '#',
        linkedin: '#',
    },
    footer: {
        bio: 'AuraBit combines advanced AI trading algorithms with expert market analysis to deliver consistent passive income from Cryptocurrency and Forex markets.',
        copyright: '© 2025 AuraBit. All rights reserved.',
    },
    hero: {
        title: 'Passive Income via Smart Trading',
        subtitle: 'Experience the power of automated Forex and Cryptocurrency trading. Our expert AI-driven strategies generate consistent daily profits for you while you sleep.',
        tagline: '🚀 Premier Forex & Crypto Trading Platform',
        ctaPrimary: 'Start Earning Now',
        ctaSecondary: 'View Strategies'
    },
    section_headers: {
        how_it_works: {
            title: 'How It Works',
            subtitle: 'Start earning passive income in just 3 simple steps. Our automated trading system handles the complex market analysis for you.'
        },
        why_choose_us: {
            title: 'Why Choose AuraBit?',
            subtitle: 'We leverage institutional-grade technology to provide retail investors with superior market access and returns.'
        },
        investor_reviews: {
            title: 'Success Stories',
            subtitle: 'Join thousands of satisfied investors who have achieved financial freedom with our trading platform.'
        },
        faq: {
            title: 'Frequently Asked Questions',
            subtitle: 'Get answers to common questions about our trading strategies, security, and withdrawals.'
        },
        about: {
            title: 'About Us',
            subtitle: "We bridge the gap between complex financial markets and passive investors using cutting-edge blockchain technology and AI trading bots."
        },
        cta: {
            title: 'Ready to Grow Your Wealth?',
            subtitle: 'Join 25,000+ investors earning daily from the global financial markets. Start with as little as $100.',
            buttonText: 'Get Started Now'
        }
    },
    faqs: [
        { id: '1', question: 'How is profit generated?', answer: 'Profits are generated through high-frequency trading in both Forex and Cryptocurrency markets using our proprietary AI algorithms.' },
        { id: '2', question: 'Is my principal safe?', answer: 'Yes, we employ strict risk management protocols and keep user funds in segregated cold storage wallets.' },
    ],
    howItWorks: [
        { id: '1', title: 'Create Account', description: 'Register for free and verify your identity to access global markets.', icon: 'UserPlus' },
        { id: '2', title: 'Select Strategy', description: 'Choose an investment plan that matches your risk tolerance and financial goals.', icon: 'PieChart' },
        { id: '3', title: 'Earn Daily', description: 'Receive automated trading profits directly to your wallet every day.', icon: 'TrendingUp' },
    ],
    whyChooseUs: [
        { id: '1', title: 'Institutional-Grade AI', description: 'Access the same high-frequency trading algorithms used by top hedge funds, now available for personal investing.', icon: 'Zap' },
        { id: '2', title: 'Secure Capital Protection', description: 'Advanced risk management systems and insurance protocols ensure your principal investment is always safeguarded.', icon: 'Lock' },
        { id: '3', title: 'Daily Automated Payouts', description: 'Profits are credited to your account every 24 hours. Withdraw your earnings instantly to your crypto wallet.', icon: 'DollarSign' },
        { id: '4', title: 'Complete Transparency', description: 'Track every trade in real-time. Detailed performance reports show you exactly how your money is working.', icon: 'Activity' },
    ],
    reviews: [
        { id: '1', name: 'Michael Chen', role: 'Crypto Tech Lead', comment: 'The passive returns from the Forex strategy have outperformed my own manual trading significantly.', rating: 5, image: '' },
        { id: '2', name: 'Sarah Jenkins', role: 'Day Trader', comment: 'Finally a platform that delivers on its promises. The daily payouts are consistent and the interface is pro-level.', rating: 5, image: '' },
    ],
    livePerformance: {
        totalProfitPaid: '$1,245,890.00'
    },
    diversificationItems: [
        {
            id: '1',
            title: 'Cryptocurrency',
            description: 'High-volatility trading on Bitcoin, Ethereum, and top altcoins.',
            icon: 'Bitcoin',
            features: ['24/7 Market Activity', 'Arbitrage Opportunities']
        },
        {
            id: '2',
            title: 'Global Forex',
            description: "The world's largest market. We trade major currency pairs (EUR/USD, GBP/JPY).",
            icon: 'DollarSign',
            features: ['$7.5 Trillion Daily Volume', 'Stable, Predictable Trends']
        },
        {
            id: '3',
            title: 'Commodities',
            description: 'Indices and raw materials like Gold (XAU) and Oil (WTI) to hedge against inflation.',
            icon: 'Layers',
            features: ['Inflation Protection', 'Market Neutral Strategies']
        }
    ],
};

interface SiteSettingsContextType {
    settings: SiteSettings;
    loading: boolean;
    updateSettings: (section: keyof SiteSettings, data: any) => Promise<void>;
    refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/settings');

            if (data) {
                // Merge with defaults to ensure structure
                setSettings({
                    ...defaultSettings,
                    ...data,
                    // If backend returns 'key' or '_id', we might want to strip it or just ignore.
                    // The backend returns the whole settings object now.
                    // Ensure mixed fields are handled if needed.
                });
            }
        } catch (err) {
            console.error('Unexpected error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (section: keyof SiteSettings, data: any) => {
        try {
            // Optimistic update
            setSettings(prev => {
                const updatedSection = Array.isArray(data) ? data : { ...prev[section], ...data };
                return {
                    ...prev,
                    [section]: updatedSection
                };
            });

            await api.put(`/settings/${section}`, data);

        } catch (err) {
            console.error(`Error updating ${section} settings:`, err);
            // Revert on error would be ideal, but for now just log
            await fetchSettings(); // Re-fetch to sync
            throw err;
        }
    };

    return (
        <SiteSettingsContext.Provider value={{ settings, loading, updateSettings, refreshSettings: fetchSettings }}>
            {children}
        </SiteSettingsContext.Provider>
    );
};

export const useSiteSettings = () => {
    const context = useContext(SiteSettingsContext);
    if (context === undefined) {
        throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
    }
    return context;
};
