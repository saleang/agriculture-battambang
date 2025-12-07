// Wrapper around the global route helper that Ziggy (or our fallback) provides
export function route(name: string, params?: any): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalRoute = (globalThis as any).route;
    if (typeof globalRoute === 'function') {
        return globalRoute(name, params);
    }
    // Fallback if route hasn't been initialized yet
    return fallbackRoute(name, params);
}

function fallbackRoute(name: string, params?: any): string {
    const parts = name.split('.');
    if (parts.length < 2) return '/' + parts.join('/');

    const action = parts[parts.length - 1];
    const resource = parts.slice(0, parts.length - 1).join('/');
    const id = extractId(params);

    switch (action) {
        case 'index':
            return `/${resource}`;
        case 'create':
            return `/${resource}/create`;
        case 'store':
            return `/${resource}`;
        case 'edit':
            return id ? `/${resource}/${id}/edit` : `/${resource}`;
        case 'show':
        case 'destroy':
        case 'update':
            return id ? `/${resource}/${id}` : `/${resource}`;
        default:
            return `/${parts.join('/')}`;
    }
}

function extractId(params: any) {
    if (params === undefined || params === null) return '';
    if (typeof params === 'number' || typeof params === 'string') return String(params);
    if (typeof params === 'object') {
        if ('id' in params) return String((params as any).id);
        if ('user' in params) return String((params as any).user);
        if ('user_id' in params) return String((params as any).user_id);
        const keys = Object.keys(params);
        if (keys.length > 0) return String((params as any)[keys[0]]);
    }
    return '';
}
