import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, HelpCircle, Layers, Shield, Star, LayoutTemplate } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';

const AdminContent: React.FC = () => {
    const { settings, updateSettings, loading } = useSiteSettings();
    const [activeTab, setActiveTab] = useState<'hero' | 'headers' | 'faqs' | 'howItWorks' | 'whyChooseUs' | 'reviews' | 'homepage'>('hero');



    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [submitting, setSubmitting] = useState(false);

    // Local state for object-based forms (Hero, Headers, Homepage) to allow editing before saving
    const [heroForm, setHeroForm] = useState(settings.hero);
    const [headersForm, setHeadersForm] = useState(settings.section_headers);
    const [homeForm, setHomeForm] = useState<{ livePerformance: any, diversificationItems: any[] }>({
        livePerformance: settings.livePerformance || { totalProfitPaid: '' },
        diversificationItems: settings.diversificationItems || []
    });

    // Update local forms when settings change (initial load)
    React.useEffect(() => {
        if (settings.hero) setHeroForm(settings.hero);
        if (settings.section_headers) setHeadersForm(settings.section_headers);
        setHomeForm({
            livePerformance: settings.livePerformance || { totalProfitPaid: '' },
            diversificationItems: settings.diversificationItems || []
        });
    }, [settings]);

    const icons = ['UserPlus', 'PieChart', 'TrendingUp', 'Shield', 'Zap', 'Headphones', 'Percent', 'DollarSign', 'Users', 'Activity', 'Lock', 'Globe'];

    const openModal = (item?: any) => {
        setEditingItem(item);
        if (activeTab === 'faqs') {
            setFormData(item || { id: Date.now().toString(), question: '', answer: '' });
        } else if (activeTab === 'howItWorks' || activeTab === 'whyChooseUs') {
            setFormData(item || { id: Date.now().toString(), title: '', description: '', icon: 'UserPlus' });
        } else if (activeTab === 'reviews') {
            setFormData(item || { id: Date.now().toString(), name: '', role: '', comment: '', rating: 5, image: '' });
        }
        setIsModalOpen(true);
    };

    const handleObjectSave = async (section: 'hero' | 'section_headers', data: any) => {
        setSubmitting(true);
        try {
            await updateSettings(section, data);
            alert('Settings updated successfully!');
        } catch (error) {
            console.error('Failed to update settings:', error);
            alert('Failed to update settings');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let newList;
            // @ts-ignore
            const currentList = settings[activeTab] as any[];
            if (editingItem) {
                newList = currentList.map((item: any) => item.id === editingItem.id ? formData : item);
            } else {
                newList = [...currentList, formData];
            }
            // @ts-ignore
            await updateSettings(activeTab, newList);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to update content:', error);
            alert('Failed to update content');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            // @ts-ignore
            const newList = settings[activeTab].filter((item: any) => item.id !== id);
            // @ts-ignore
            await updateSettings(activeTab, newList);
        } catch (error) {
            console.error('Failed to delete item:', error);
            alert('Failed to delete item');
        }
    };

    if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

    const tabs = [
        { id: 'hero', label: 'Hero Section', icon: Layers },
        { id: 'homepage', label: 'Home Content', icon: LayoutTemplate },
        { id: 'headers', label: 'Page Headers', icon: Edit2 },
        { id: 'faqs', label: 'FAQs', icon: HelpCircle },
        { id: 'howItWorks', label: 'How It Works', icon: Layers },
        { id: 'whyChooseUs', label: 'Why Choose Us', icon: Shield },
        { id: 'reviews', label: 'Reviews', icon: Star },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Management</h1>
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {tabs.find(t => t.id === activeTab)?.label}
                    </h2>
                    {!['hero', 'headers', 'homepage'].includes(activeTab) && (
                        <button
                            onClick={() => openModal()}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add New</span>
                        </button>
                    )}
                </div>

                {/* Hero Section Form */}
                {activeTab === 'hero' && heroForm && (
                    <form onSubmit={(e) => { e.preventDefault(); handleObjectSave('hero', heroForm); }} className="space-y-6">
                        <div className="grid gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Hero Title</label>
                                <input
                                    type="text"
                                    value={heroForm.title}
                                    onChange={e => setHeroForm({ ...heroForm, title: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <p className="text-xs text-gray-500 mt-1">Main heading of the landing page.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tagline</label>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        value={heroForm.tagline}
                                        onChange={e => setHeroForm({ ...heroForm, tagline: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Small badge text above the title (e.g., 🚀 Up to 20% Returns)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Subtitle</label>
                                <textarea
                                    rows={3}
                                    value={heroForm.subtitle}
                                    onChange={e => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Primary Button Text</label>
                                    <input
                                        type="text"
                                        value={heroForm.ctaPrimary}
                                        onChange={e => setHeroForm({ ...heroForm, ctaPrimary: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Secondary Button Text</label>
                                    <input
                                        type="text"
                                        value={heroForm.ctaSecondary}
                                        onChange={e => setHeroForm({ ...heroForm, ctaSecondary: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? <LoadingSpinner size="sm" /> : <><Save className="w-4 h-4" /><span>Save Changes</span></>}
                            </button>
                        </div>
                    </form>
                )}

                {/* Page Headers Form */}
                {activeTab === 'headers' && headersForm && (
                    <form onSubmit={(e) => { e.preventDefault(); handleObjectSave('section_headers', headersForm); }} className="space-y-8">
                        {/* Loop through each section header */}
                        {Object.entries(headersForm).map(([key, value]: [string, any]) => (
                            <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                                    {key.replace(/_/g, ' ')} Section
                                </h3>
                                <div className="grid gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
                                        <input
                                            type="text"
                                            value={value.title}
                                            onChange={e => setHeadersForm({
                                                ...headersForm,
                                                [key]: { ...value, title: e.target.value }
                                            })}
                                            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Subtitle</label>
                                        <textarea
                                            rows={2}
                                            value={value.subtitle}
                                            onChange={e => setHeadersForm({
                                                ...headersForm,
                                                [key]: { ...value, subtitle: e.target.value }
                                            })}
                                            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    {key === 'cta' && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Button Text</label>
                                            <input
                                                type="text"
                                                value={value.buttonText}
                                                onChange={e => setHeadersForm({
                                                    ...headersForm,
                                                    [key]: { ...value, buttonText: e.target.value }
                                                })}
                                                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? <LoadingSpinner size="sm" /> : <><Save className="w-4 h-4" /><span>Save Changes</span></>}
                            </button>
                        </div>
                    </form>
                )}

                {/* Homepage Content Form */}
                {activeTab === 'homepage' && homeForm && (
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        setSubmitting(true);
                        try {
                            await updateSettings('livePerformance', homeForm.livePerformance);
                            await updateSettings('diversificationItems', homeForm.diversificationItems);
                            alert('Homepage content updated successfully!');
                        } catch (error) {
                            console.error('Failed to update homepage content:', error);
                        } finally {
                            setSubmitting(false);
                        }
                    }} className="space-y-8">

                        {/* Live Performance */}
                        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Live Market Performance</h3>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Total Profit Paid (Text Display)</label>
                                <input
                                    type="text"
                                    value={homeForm.livePerformance?.totalProfitPaid || ''}
                                    onChange={e => setHomeForm({
                                        ...homeForm,
                                        livePerformance: { ...homeForm.livePerformance, totalProfitPaid: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="$1,245,890.00"
                                />
                            </div>
                        </div>

                        {/* Strategic Asset Diversification */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Strategic Asset Diversification</h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newItem = {
                                            id: Date.now().toString(),
                                            title: 'New Asset',
                                            description: 'Description...',
                                            icon: 'Layers',
                                            features: ['Feature 1']
                                        };
                                        setHomeForm({
                                            ...homeForm,
                                            diversificationItems: [...(homeForm.diversificationItems || []), newItem]
                                        });
                                    }}
                                    className="px-3 py-1 bg-green-500 text-white rounded-md text-sm flex items-center space-x-1 hover:bg-green-600"
                                >
                                    <Plus className="w-4 h-4" /> <span>Add Asset</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {(homeForm.diversificationItems || []).map((item, index) => (
                                    <div key={item.id} className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-medium mb-1 dark:text-gray-400">Title</label>
                                                <input
                                                    type="text"
                                                    value={item.title}
                                                    onChange={e => {
                                                        const newItems = [...(homeForm.diversificationItems || [])];
                                                        newItems[index].title = e.target.value;
                                                        setHomeForm({ ...homeForm, diversificationItems: newItems });
                                                    }}
                                                    className="w-full px-3 py-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1 dark:text-gray-400">Icon (Lucide Name)</label>
                                                <input
                                                    type="text"
                                                    value={item.icon}
                                                    onChange={e => {
                                                        const newItems = [...(homeForm.diversificationItems || [])];
                                                        newItems[index].icon = e.target.value;
                                                        setHomeForm({ ...homeForm, diversificationItems: newItems });
                                                    }}
                                                    className="w-full px-3 py-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                                    placeholder="Bitcoin, DollarSign, Layers"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium mb-1 dark:text-gray-400">Description</label>
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={e => {
                                                        const newItems = [...(homeForm.diversificationItems || [])];
                                                        newItems[index].description = e.target.value;
                                                        setHomeForm({ ...homeForm, diversificationItems: newItems });
                                                    }}
                                                    className="w-full px-3 py-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium mb-1 dark:text-gray-400">Features (Comma Separated)</label>
                                                <input
                                                    type="text"
                                                    value={item.features.join(', ')}
                                                    onChange={e => {
                                                        const newItems = [...(homeForm.diversificationItems || [])];
                                                        newItems[index].features = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                                        setHomeForm({ ...homeForm, diversificationItems: newItems });
                                                    }}
                                                    className="w-full px-3 py-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm('Delete this item?')) {
                                                        const newItems = homeForm.diversificationItems?.filter((_, i) => i !== index);
                                                        setHomeForm({ ...homeForm, diversificationItems: newItems });
                                                    }
                                                }}
                                                className="text-red-500 hover:text-red-700 text-sm flex items-center space-x-1"
                                            >
                                                <Trash2 className="w-4 h-4" /> <span>Remove</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? <LoadingSpinner size="sm" /> : <><Save className="w-4 h-4" /><span>Save Changes</span></>}
                            </button>
                        </div>
                    </form>
                )}

                {/* List Views (Existing) */}
                {!['hero', 'headers', 'homepage'].includes(activeTab) && (
                    <div className="space-y-4">
                        {/* @ts-ignore */}
                        {settings[activeTab] && settings[activeTab].length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No items found.</p>
                        ) : (
                            // @ts-ignore
                            settings[activeTab] && settings[activeTab].map((item: any) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-start"
                                >
                                    <div className="space-y-1">
                                        {activeTab === 'faqs' && (
                                            <>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{item.question}</h3>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">{item.answer}</p>
                                            </>
                                        )}
                                        {(activeTab === 'howItWorks' || activeTab === 'whyChooseUs') && (
                                            <>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{item.icon}</span>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
                                            </>
                                        )}
                                        {activeTab === 'reviews' && (
                                            <>
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                                                    <span className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">{item.role}</span>
                                                    <div className="flex text-yellow-500 text-xs">
                                                        {Array(Math.round(Math.max(0, item.rating || 0))).fill(0).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm italic">"{item.comment}"</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            onClick={() => openModal(item)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`${editingItem ? 'Edit' : 'Add'} ${tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}`}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {activeTab === 'faqs' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Question</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.question}
                                    onChange={e => setFormData({ ...formData, question: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Answer</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.answer}
                                    onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    {(activeTab === 'howItWorks' || activeTab === 'whyChooseUs') && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Icon</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.icon}
                                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                >
                                    {icons.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    {activeTab === 'reviews' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Role</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Comment</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.comment}
                                    onChange={e => setFormData({ ...formData, comment: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Rating (1-5)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.rating}
                                    onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                                />
                            </div>
                        </>
                    )}

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminContent;
