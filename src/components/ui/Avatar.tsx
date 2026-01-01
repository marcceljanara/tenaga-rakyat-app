import React from 'react';
import { clsx } from '../../utils/clsx';
import { User } from 'lucide-react';

interface AvatarProps {
    src?: string | null;
    alt?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt = 'Avatar', size = 'md', className }) => {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-14 h-14',
        xl: 'w-20 h-20',
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-7 h-7',
        xl: 'w-10 h-10',
    };

    if (!src) {
        return (
            <div
                className={clsx(
                    'rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center',
                    sizes[size],
                    className
                )}
            >
                <User className={clsx('text-white', iconSizes[size])} />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={clsx('rounded-full object-cover', sizes[size], className)}
            onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
        />
    );
};
