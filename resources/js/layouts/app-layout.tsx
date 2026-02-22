import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { CartProvider } from '@/pages/customer/orders/cart-context';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
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
        <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontSize: '14px',
          },
          classNames: {
            toast: 'shadow-xl',
            title: 'font-semibold',
            description: 'text-slate-600',
            success: 'bg-emerald-600 text-white border-emerald-700',
            error: 'bg-rose-600 text-white border-rose-700',
            info: 'bg-blue-600 text-white',
          },
        }}
      />
    </AppLayoutTemplate>
);
