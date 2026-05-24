import toast from 'react-hot-toast';
import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';

export function handleApiError<TFieldValues extends FieldValues = FieldValues>(
    error: any,
    defaultMessage: string,
    setError?: UseFormSetError<TFieldValues>
): void {
    console.error('❌ API Error:', error);

    const responseErrors = error.response?.data?.errors;

    if (responseErrors) {
        if (typeof responseErrors === 'object' && responseErrors !== null) {
            // Zod Schema Validation Error
            if (setError) {
                Object.entries(responseErrors).forEach(([field, messages]) => {
                    const message = Array.isArray(messages)
                        ? messages[0]
                        : (typeof messages === 'string' ? messages : 'Validasi gagal');
                    setError(field as Path<TFieldValues>, {
                        type: 'server',
                        message: message,
                    });
                });
            } else {
                // If setError is not provided but it's a validation error object,
                // concatenate messages or show the first one.
                const firstErrorMsg = Object.values(responseErrors)
                    .map((m: any) => Array.isArray(m) ? m[0] : m)
                    .filter(Boolean)
                    .join(', ');
                toast.error(firstErrorMsg || defaultMessage);
            }
            return;
        } else if (typeof responseErrors === 'string') {
            // General / Business Logic Error
            toast.error(responseErrors);
            return;
        }
    }

    // Fallbacks
    const fallbackMessage = error.response?.data?.message || error.message || defaultMessage;
    toast.error(fallbackMessage);
}
