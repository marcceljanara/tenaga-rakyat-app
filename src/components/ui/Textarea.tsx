import React, { forwardRef } from 'react';
import { clsx } from '../../utils/clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, helperText, className, id, ...props }, ref) => {
        const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={textareaId} className="block text-sm font-medium text-secondary-700 mb-1.5">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={clsx(
                        'w-full px-4 py-3 rounded-xl border bg-white text-secondary-900 placeholder:text-secondary-400',
                        'focus:outline-none focus:ring-2 transition-all duration-200 resize-none',
                        error
                            ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500'
                            : 'border-secondary-300 focus:ring-primary-500/20 focus:border-primary-500',
                        className
                    )}
                    rows={4}
                    {...props}
                />
                {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
                {helperText && !error && <p className="mt-1.5 text-sm text-secondary-500">{helperText}</p>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
