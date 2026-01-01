import React from 'react';
import { clsx } from '../../utils/clsx';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'accent';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'secondary', className }) => {
    const variants: Record<BadgeVariant, string> = {
        primary: 'bg-primary-100 text-primary-700',
        secondary: 'bg-secondary-100 text-secondary-700',
        success: 'bg-success-100 text-success-700',
        warning: 'bg-warning-100 text-warning-700',
        danger: 'bg-danger-100 text-danger-700',
        accent: 'bg-accent-100 text-accent-700',
    };

    return (
        <span
            className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
};

// Helper function to get badge variant based on status
export function getStatusBadgeVariant(status: string): BadgeVariant {
    const statusMap: Record<string, BadgeVariant> = {
        // Job statuses
        OPEN: 'success',
        IN_PROGRESS: 'primary',
        COMPLETED: 'secondary',
        CANCELLED: 'danger',
        // Application statuses
        PENDING: 'warning',
        ACCEPTED: 'success',
        REJECTED: 'danger',
        // Withdraw statuses
        LOCKED: 'warning',
        APPROVED: 'success',
        SENT: 'primary',
        // Account statuses
        ACTIVE: 'success',
        SUSPENDED: 'danger',
        VERIFIED: 'success',
        UNVERIFIED: 'warning',
    };

    return statusMap[status] || 'secondary';
}
