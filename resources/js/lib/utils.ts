import { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isSameUrl(
    url1: any,
    url2: any,
) {
    return resolveUrl(url1) === resolveUrl(url2);
}

export function resolveUrl(url: any): string {
    if (typeof url === 'string') return url;
    if (url && typeof url === 'object' && 'url' in url) return url.url;
    return String(url);
}