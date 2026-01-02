import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Clock } from 'lucide-react';
import api from '../../lib/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { format } from 'date-fns';

interface Investment {
    _id: string;
    user_id: {
        _id: string;
        username: string;
        email: string;
        full_name: string;
    };
    plan_id: {
        name: string;
        daily_roi_percentage: number;
        duration_days: number;
    };
    amount: number;
    daily_roi: number;
    total_roi_earned: number;
    start_date: string;
    end_date: string;
    next_claim_date: string;
    last_claim_date?: string;
    is_active: boolean;
}

const AdminInvestments: React.FC = () => {
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInvestments();
    }, []);

    const fetchInvestments = async () => {
        try {
            const { data } = await api.get('/investments/all');
            setInvestments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching investments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredInvestments = investments.filter(inv =>
        inv.user_id?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.user_id?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.plan_id?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const calculateRemaining = (investment: Investment) => {
        const totalExpected = (investment.amount * investment.plan_id.daily_roi_percentage * investment.plan_id.duration_days) / 100;
        return totalExpected - investment.total_roi_earned;
    };

    if (loading) return <LoadingSpinner size="lg" />;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Investments</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search user or plan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ROI Earned / Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredInvestments.map((inv) => (
                                <tr key={inv._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{inv.user_id?.full_name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">@{inv.user_id?.username}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">{inv.plan_id?.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{inv.plan_id.daily_roi_percentage}% Daily</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-green-600 dark:text-green-400">${inv.amount.toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            ${inv.total_roi_earned.toFixed(2)} / <span className="text-gray-500">${((inv.amount * inv.plan_id.daily_roi_percentage * inv.plan_id.duration_days) / 100).toFixed(2)}</span>
                                        </div>
                                        <div className="text-xs text-orange-500">Remaining: ${calculateRemaining(inv).toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <div>Start: {format(new Date(inv.start_date), 'MMM dd, yyyy')}</div>
                                        <div>End: {format(new Date(inv.end_date), 'MMM dd, yyyy')}</div>
                                        {inv.is_active && (
                                            <div className="text-xs text-blue-500 mt-1">Next Claim: {format(new Date(inv.next_claim_date), 'MMM dd HH:mm')}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {inv.is_active ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                                <CheckCircle className="w-3 h-3 mr-1" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                <Clock className="w-3 h-3 mr-1" /> Completed
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminInvestments;
