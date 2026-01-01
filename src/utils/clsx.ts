// Simple clsx implementation
export function clsx(...args: (string | undefined | null | false | Record<string, boolean>)[]): string {
    return args
        .flatMap((arg) => {
            if (!arg) return [];
            if (typeof arg === 'string') return [arg];
            if (typeof arg === 'object') {
                return Object.entries(arg)
                    .filter(([, value]) => value)
                    .map(([key]) => key);
            }
            return [];
        })
        .join(' ');
}
