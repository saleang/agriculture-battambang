import { InertiaLinkProps } from '@inertiajs/react';
import { ForwardRefExoticComponent, RefAttributes } from 'react'
import { LucideProps } from 'lucide-react';
import type { RouteDefinition } from '../wayfinder';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string | RouteDefinition<any>;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string
    href?: string | RouteDefinition<any>
    icon?: ForwardRefExoticComponent<
        Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
    > | null
    children?: NavItem[]
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    user_id: number;
    username: string;
    email: string;
    photo_url?: string | null;
    avatar?: string;
    email_verified_at: string | null;
    role:'admin'| 'seller' | 'customer';
    phone: string;
    status: 'active' | 'inactive' | 'banned';
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Product {
    product_id: number;
    productname: string;
    description: string;
    price: number;
    unit: string;
    stock_quantity: number;
    is_active: boolean;
    images?: { image_url: string; is_primary: boolean }[];
    seller?: {
        seller_id: number;
        farm_name: string;
    };
    category?: {
        category_id: number;
        categoryname: string;
    };
    created_at: string;
    updated_at: string;
}

export type PageProps<T = {}> = T & {
    auth: {
        user: User | null;
    };

}

export interface Product {
  [x: string]: any;
  product_id: number;
  productname: string;
  price: number;
  unit: string;
  image?: string;

}