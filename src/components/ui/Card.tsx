import React from 'react';
import { clsx } from '../../utils/clsx';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    interactive?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, interactive = false, onClick }) => {
    return (
        <div
            className={clsx(
                'bg-white rounded-2xl shadow-soft border border-secondary-100 transition-all duration-300',
                interactive && 'hover:shadow-soft-lg hover:border-primary-200 hover:-translate-y-1 cursor-pointer',
                className
            )}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className,
}) => {
    return <div className={clsx('px-6 py-4 border-b border-secondary-100', className)}>{children}</div>;
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className,
}) => {
    return <div className={clsx('px-6 py-4', className)}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className,
}) => {
    return <div className={clsx('px-6 py-4 border-t border-secondary-100', className)}>{children}</div>;
};
