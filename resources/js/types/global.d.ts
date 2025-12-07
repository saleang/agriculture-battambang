// resources/js/types/global.d.ts

import { AxiosInstance } from 'axios';
declare function route(name: string, params?: Record<string, any>): string;

declare global {
    interface Window {
        axios: AxiosInstance;
    }
}

export {};
