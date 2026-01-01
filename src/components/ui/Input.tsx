import React, { forwardRef } from 'react';
import { clsx } from '../../utils/clsx';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: LucideIcon;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, leftIcon: LeftIcon, className, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-secondary-700 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {LeftIcon && (
                        <LeftIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400 pointer-events-none" />
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={clsx(
                            'w-full py-3 rounded-xl border bg-white text-secondary-900 placeholder:text-secondary-400',
                            'focus:outline-none focus:ring-2 transition-all duration-200',
                            LeftIcon ? 'pl-12 pr-4' : 'px-4',
                            error
                                ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500'
                                : 'border-secondary-300 focus:ring-primary-500/20 focus:border-primary-500',
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
                {helperText && !error && <p className="mt-1.5 text-sm text-secondary-500">{helperText}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

