export const getEnv = (key: string): string => {
    // Check for Runtime Injection (Server-Side Injection)
    // @ts-ignore
    if (window.__ENV__ && window.__ENV__[key]) {
        // @ts-ignore
        return window.__ENV__[key];
    }

    // Fallback to Build Time (Vite)
    // @ts-ignore
    return import.meta.env[key] || '';
};
