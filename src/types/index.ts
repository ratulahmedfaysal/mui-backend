export interface User {
    id: string; // Database ID (string or ObjectId string)
    email: string;
    username: string;
    full_name: string;
    balance: number;
    wallet_balance?: number; // Deprecated
    total_invested: number;
    total_roi_earned: number;
    total_referral_earned: number;
    referral_code: string;
    referred_by: string | null;
    is_active: boolean;
    is_banned: boolean;
    has_active_plan: boolean;
    is_admin: boolean;
    role?: string;
    two_factor_enabled: boolean;
    two_factor_secret?: string | null; // Optional on frontend
    two_factor_backup_codes?: string[] | null;
    created_at: string;
    updated_at: string;
}

export interface InvestmentPlan {
    id: string;
    name: string;
    subtitle?: string;
    min_amount: number;
    max_amount: number;
    daily_roi_percentage: number;
    duration_days: number;
    features: string[];
    is_active: boolean;
    return_principal: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserInvestment {
    id: string;
    user_id: string; // ID or User object if populated
    plan_id: string | InvestmentPlan; // ID or Plan object if populated
    amount: number;
    daily_roi: number;
    total_roi_earned: number;
    start_date: string;
    end_date: string;
    last_claim_date: string | null;
    next_claim_date: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    plan?: InvestmentPlan; // Helper for some frontend components
}

export interface ReferralSetting {
    id: string;
    system_type: 'deposit' | 'investment' | 'matching' | 'career';
    level_number: number;
    commission_percentage: number;
    reward_type?: 'percentage' | 'fixed';
    reward_amount?: number;
    required_referrals?: number;
    required_investment?: number;
    required_team_volume?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PaymentMethod {
    id: string;
    method_name: string;
    currency_name: string;
    method_image_url: string | null;
    currency_rate: number;
    min_amount: number;
    max_amount: number;
    fee_percentage: number;
    instruction: string | null;
    required_fields: string[];
    method_type: 'deposit' | 'withdrawal' | 'both';
    is_active: boolean;
    is_automatic: boolean;
    gateway_type: 'manual' | 'coinpayments';
    created_at: string;
    updated_at: string;
}

export interface Deposit {
    id: string;
    user_id: string | User;
    payment_method_id: string | PaymentMethod;
    amount: number;
    fee: number;
    final_amount: number;
    transaction_data: any;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    gateway_transaction_id: string | null;
    created_at: string;
    updated_at: string;
    payment_method?: PaymentMethod;
    user?: User;
}

export interface Withdrawal {
    id: string;
    user_id: string | User;
    payment_method_id: string | PaymentMethod;
    amount: number;
    fee: number;
    final_amount: number;
    transaction_data: any;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
    payment_method?: PaymentMethod;
    user?: User;
}

export interface Transaction {
    id: string;
    user_id: string | User;
    type: 'deposit' | 'withdrawal' | 'investment' | 'roi_claim' | 'referral_commission' | 'referral_bonus';
    amount: number;
    balance_before: number;
    balance_after: number;
    reference_id?: string | null;
    description: string | null;
    status?: string;
    created_at: string;
}

export interface UserReferral {
    id: string;
    referrer_id: string;
    referred_id: string; // or referred_user_id
    referred_user_id: string; // Aligning with backend
    level_number: number;
    commission_earned: number;
    created_at: string;
    referred_user?: User;
}

export interface CryptoData {
    symbol: string;
    price: string;
    priceChange: string;
    priceChangePercent: string;
    volume: string;
    marketCap: string;
}

export interface CoinPaymentsSettings {
    id: string;
    merchant_id: string;
    public_key: string;
    private_key: string;
    ipn_secret: string;
    is_active: boolean;
    accepted_coins: string[];
    created_at: string;
    updated_at: string;
}

export interface SiteSetting {
    key: string;
    value: any;
    created_at?: string;
    updated_at?: string;
}
