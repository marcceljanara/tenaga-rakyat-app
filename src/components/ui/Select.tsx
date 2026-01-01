import React, { forwardRef } from 'react';
import { clsx } from '../../utils/clsx';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    label?: string;
    error?: string;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, helperText, options, placeholder, className, id, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={selectId} className="block text-sm font-medium text-secondary-700 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={clsx(
                            'w-full px-4 py-3 rounded-xl border bg-white text-secondary-900 appearance-none cursor-pointer',
                            'focus:outline-none focus:ring-2 transition-all duration-200 pr-10',
                            error
                                ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500'
                                : 'border-secondary-300 focus:ring-primary-500/20 focus:border-primary-500',
                            className
                        )}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400 pointer-events-none" />
                </div>
                {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
                {helperText && !error && <p className="mt-1.5 text-sm text-secondary-500">{helperText}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';
