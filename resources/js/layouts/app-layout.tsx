import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { CartProvider } from '@/pages/customer/orders/cart-context';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
// import { CartProvider } from '@/contexts/cart-context';
interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        <CartProvider>
            {children}
        </CartProvider>
        {/* {children} */}
    </AppLayoutTemplate>
);
