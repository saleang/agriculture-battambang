import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Box, ChartColumnIncreasing, DollarSign, Folder, House, LayoutGrid,Package, Package2, Star, Truck, User } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
];

const adminNavItems: NavItem[] = [
    // ...mainNavItems,
     {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Manage Users',
        href: '/admin/users',
        icon: LayoutGrid,
    },
    {
        title: 'Manage Sellers',
        href: '/admin/sellers',
        icon: Folder,
    },
    {
        title: 'Manage Products',
        href: '/admin/products',
        icon: Package,
    }
];

const sellerNavItems: NavItem[] = [
    //...mainNavItems,
    {
        title: 'Dashboard',
        href: '/seller/dashboard',
        icon: House,
    },
    {
        title: 'Profile Management',
        href: '/seller/profile',
        icon: User,
    },
    {
        title: 'Product Management',
        icon: Box,
        children: [
            { title: 'Products', href: '/seller/product', icon: Box },
            { title: 'Categories', href: '/seller/category', icon: Box },
        ],
    },

    {
        title: 'Order Processing',
        href: '/seller/orders',
        icon: Truck,
    },
    {
        title: 'Payment Management',
        href: '/seller/payments',
        icon: DollarSign,
    },
    {
        title: ' Reviews & Ratings',
        href: '/seller/reviews',
        icon: Star,
    },
    {
        title: ' Reports',
        href: '/seller/reports',
        icon: ChartColumnIncreasing
    },

];

export function AppSidebar() {
    const { props } = usePage();
    // Inertia shares auth on the page props under `auth` — guard access with optional chaining
    const userRole: string | undefined = (props as any)?.auth?.user?.role;

    let roleBasedNavItems = mainNavItems;
    if (userRole === 'admin') {
        roleBasedNavItems = adminNavItems;
    } else if (userRole === 'seller') {
        roleBasedNavItems = sellerNavItems;
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                                <AppLogo />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={roleBasedNavItems}  />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
