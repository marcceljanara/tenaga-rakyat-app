// User & Auth Types
export type UserRole = 'PEKERJA' | 'PEMBERI_KERJA' | 'ADMIN' | 'SUPER_ADMIN';
export type VerificationStatus = 'UNVERIFIED' | 'EMAIL_VERIFIED' | 'FULL_VERIFIED';

export interface Role {
    id: number;
    name: UserRole;
}

export interface User {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    role: string;
    profile_picture_url?: string;
    about?: string;
    cv_url?: string;
    verification_status?: VerificationStatus;
    is_suspended?: boolean;
    is_deleted?: boolean;
    email_verified: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Extended fields for admin views
    wallet?: Wallet;
    photos?: UserPhoto[];
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    full_name: string;
    phone_number: string;
    email: string;
    password: string;
    role_id: 1 | 2; // 1 = Worker, 2 = Job Provider
}

export interface UpdateProfileData {
    full_name?: string;
    phone_number?: string;
    about?: string;
    cv_url?: string;
}

// Job Types
export type JobStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'APPROVED' | 'REJECTED';

export interface Jobs {
    jobs: Job[]
    total: number;
    page: number;
    limit: number;
}

export interface Job {
    id: number;
    title: string;
    description: string;
    location: string;
    compensation_amount: number;
    status: JobStatus;
    provider: {
        id: string;
        full_name: string;
        profile_picture_url?: string;
    };
    worker?: {
        id: string;
        full_name: string;
        profile_picture_url?: string;
    };
    posted_at?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateJobData {
    title: string;
    description: string;
    location: string;
    compensation_amount: number;
}

export interface UpdateJobData {
    title?: string;
    description?: string;
    location?: string;
    compensation_amount?: number;
}

export interface JobSearchParams {
    keyword?: string;
    location?: string;
    min_compensation?: number;
    max_compensation?: number;
    status?: JobStatus;
    page?: number;
    limit?: number;
    sort_by?: 'posted_at' | 'compensation_amount' | 'title';
    sort_order?: 'asc' | 'desc';
}

export interface ProviderJobHistoryParams {
    status?: JobStatus;
    page?: number;
    limit?: number;
    sort_by?: 'posted_at' | 'status';
    sort_order?: 'asc' | 'desc';
}

// Application Types
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'UNDER_REVIEW' | 'CANCELLED';

export interface Application {
    id: number;
    cover_letter: string;
    status: ApplicationStatus;
    job: Job;
    worker: {
        id: string;
        full_name: string;
        email: string;
        phone_number: string;
        profile_picture_url?: string;
        about?: string;
        cv_url?: string;
    };
    created_at: string;
    updated_at: string;
}

export interface Applications {
    applications: Application[];
    total: number;
    page: number;
    limit: number;
}

// Worker-specific application types (API returns 'provider' instead of 'employer')
export interface WorkerApplicationJob {
    id: number;
    title: string;
    description: string;
    location: string;
    compensation_amount: number;
    status: JobStatus;
    provider: {
        id: string;
        full_name: string;
        profile_picture_url?: string | null;
        average_rating?: number | null;
    };
}

export interface WorkerApplication {
    id: number;
    job_id: number;
    worker_id: string;
    cover_letter: string;
    status: ApplicationStatus;
    job: WorkerApplicationJob;
    created_at: string;
    updated_at: string;
}

export interface WorkerApplications {
    applications: WorkerApplication[];
    total: number;
    page: number;
    limit: number;
}

// Worker application detail (includes worker info for detail view)
export interface WorkerApplicationDetail extends WorkerApplication {
    worker: {
        id: string;
        full_name: string;
        email: string;
        phone_number: string;
        profile_picture_url?: string | null;
        about?: string | null;
        cv_url?: string | null;
        average_rating?: number | null;
        verification_status: string;
    };
}

export interface CreateApplicationData {
    cover_letter: string;
}

export interface ApplicationSearchParams {
    page?: number;
    limit?: number;
    status?: ApplicationStatus;
    sort_by?: 'created_at' | 'updated_at' | 'status';
    sort_order?: 'asc' | 'desc';
}

export interface ApplicationSearchFilters extends ApplicationSearchParams {
    keyword?: string;
}

// Photo Types
export interface UserPhoto {
    id: number;
    photo_url: string;
    description: string;
    created_at: string;
    updated_at: string;
}

// Wallet Types
export type WalletStatus = 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
export type TransactionType = 'FUNDING' | 'WITHDRAWAL' | 'ESCROW_RELEASE' | 'ESCROW_HOLD' | 'REFUND';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type WithdrawMethod = 'BANK_TRANSFER' | 'EWALLET';
export type WithdrawStatus = 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED' | 'SENT';

export interface Wallet {
    id: number;
    balance: number;
    status: WalletStatus;
    suspended_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: number;
    type: TransactionType;
    amount: number;
    status: TransactionStatus;
    description: string;
    reference_id?: string;
    created_at: string;
    updated_at: string;
}

export interface Transactions {
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
}

export interface WithdrawMethodData {
    id: number;
    method: WithdrawMethod;
    provider: string;
    account_name: string;
    account_number: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface WithdrawMethods {
    withdraw_methods: WithdrawMethodData[];
}

export interface WithdrawRequests {
    requests: WithdrawRequest[];
}

export interface CreateWithdrawMethodData {
    method: WithdrawMethod;
    provider: string;
    account_name: string;
    account_number: string;
}

export interface WithdrawRequest {
    id: number;
    amount: number;
    fee: number;
    net_amount: number;
    status: WithdrawStatus;
    admin_note?: string;
    transfer_receipt?: string;
    withdraw_method: WithdrawMethodData;
    user: {
        id: string;
        full_name: string;
        email: string;
    };
    locked_by?: {
        id: string;
        full_name: string;
    };
    processed_by_admin_id?: string;
    created_at: string;
    updated_at: string;
}

// Admin-specific withdraw request type (matches admin API response)
export interface AdminWithdrawRequest {
    id: number;
    user_id: string;
    amount: string;
    status: WithdrawStatus;
    method: WithdrawMethod;
    provider: string;
    account_name: string;
    account_number: string;
    created_at: string;
    admin_locked_by?: string | null;
    admin_note?: string | null;
}

export interface AdminWithdrawRequestsResponse {
    requests: AdminWithdrawRequest[];
}

// Detailed withdraw request for admin (from GET /api/wallets/withdraw-requests/{id})
export interface WithdrawRequestDetail {
    id: number;
    amount: string;
    fee_charged: string;
    status: WithdrawStatus;
    created_at: string;
    admin_note: string | null;
    transfer_receipt: string | null;
    admin_locked_by: string | null;
    admin_approved_by: string | null;
    admin_rejected_by: string | null;
    method: {
        id: number;
        method: WithdrawMethod;
        provider: string;
        account_name: string;
        account_number: string;
        is_active: boolean;
    };
}

export interface CreateWithdrawRequestData {
    amount: number;
    method_id: number;
}

// Worker-specific withdraw request types (matches API response structure)
export interface WorkerWithdrawRequest {
    id: number;
    user_id: string;
    amount: string;
    status: WithdrawStatus;
    method: WithdrawMethod;
    provider: string;
    account_name: string;
    account_number: string;
    created_at: string;
    admin_locked_by?: string | null;
    admin_note?: string | null;
}

export interface WorkerWithdrawRequests {
    requests: WorkerWithdrawRequest[];
}

export interface WorkerWithdrawRequestDetail {
    id: number;
    amount: string;
    fee_charged: string;
    status: WithdrawStatus;
    created_at: string;
    admin_note?: string | null;
    transfer_receipt?: string | null;
    admin_locked_by?: string | null;
    admin_approved_by?: string | null;
    admin_rejected_by?: string | null;
    method: {
        id: number;
        method: WithdrawMethod;
        provider: string;
        account_name: string;
        account_number: string;
        is_active: boolean;
    };
}

export interface WithdrawPreview {
    amount_requested: string;
    fee_charged: string;
    net_amount: string;
    can_withdraw: boolean;
    reason: string;
}

export interface TopUpResponse {
    token: string;
    redirectUrl: string;
}

// Admin Types
export interface Admin {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    role: {
        id: number;
        name: 'ADMIN' | 'SUPER_ADMIN';
    };
    is_suspended?: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateAdminData {
    full_name: string;
    phone_number: string;
    email: string;
    password: string;
}

export interface UpdateAdminData {
    full_name?: string;
    phone_number?: string;
    email?: string;
}

export interface AdminsResponse {
    admins: Admin[];
    total?: number;
    page?: number;
    limit?: number;
}

export interface UserStats {
    total_users: number;
    email_verified_users: number;
    unverified_users: number;
    full_verified_users: number;
    workers: number;
    job_providers: number;
}

export interface DashboardSummary {
    total_inflow: number;
    total_outflow: number;
    platform_fees: number;
    platform_balance: number;
    escrow_held: number;
    pending_withdrawals: number;
    pending_withdrawals_count: number;
    // Legacy fields for backward compatibility
    total_users?: number;
    total_jobs?: number;
    total_applications?: number;
    total_transactions?: number;
}

export interface ApplicationStatistics {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    under_review: number;
    cancelled: number;
}

// User Management Types
export interface UserManagementParams {
    page?: number;
    limit?: number;
    role?: string;
    verification_status?: VerificationStatus;
    search?: string;
}

export interface AdminUsersResponse {
    users: User[];
    total: number;
    page: number;
    limit: number;
}

export interface AdminWithdrawParams {
    status?: WithdrawStatus;
    user_id?: string;
}

// API Response Types
export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface PaginatedData<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export interface PaginatedResponse<T> {
    data: PaginatedData<T>;
    message?: string;
}

// Error Response Type
export interface ApiError {
    errors: string;
    statusCode: number;
}

// Email Verification Types
export type EmailVerificationPurpose = 'REGISTRATION' | 'CHANGE_EMAIL';

export interface EmailVerificationResponse {
    success: boolean;
    message: string;
    userId?: string;
}

// Password Reset Types
export interface ResetPasswordData {
    token: string;
    newPassword: string;
    confirmNewPassword: string;
}

// Provider Banks and E-Wallets
export const BANK_PROVIDERS = [
    'BCA', 'BNI', 'BRI', 'MANDIRI', 'CIMB', 'DANAMON',
    'PERMATA', 'BTN', 'MEGA', 'OCBC', 'PANIN', 'BSI'
] as const;

export const EWALLET_PROVIDERS = [
    'OVO', 'GOPAY', 'DANA', 'SHOPEEPAY', 'LINKAJA', 'JENIUS'
] as const;

export type BankProvider = typeof BANK_PROVIDERS[number];
export type EWalletProvider = typeof EWALLET_PROVIDERS[number];
