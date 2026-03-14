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
        title: 'ផ្ទាំងទំព័រដើម',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'ការគ្រប់គ្រងអ្នកប្រើប្រាស់',
        href: '/admin/users',
        icon: LayoutGrid,
    },
    {
        title: 'គ្រប់គ្រងអាជីវករ',
        href: '/admin/sellers',
        icon: Folder,
    },
    {
        title: 'គ្រប់គ្រងផលិតផល',
        href: '/admin/products',
        icon: Package,
    },
    {
        title: 'គ្រប់គ្រងប្រភេទផលិតផល',
        href: '/admin/categories',
        icon: Package2,
    },
    {
        title: ' Reviews & Ratings',
        href: '/seller/reviews',
        icon: Star,
    },
    {   title: 'របាយការណ៍',
        href: '/admin/reports',
        icon: ChartColumnIncreasing,
    },
];

const sellerNavItems: NavItem[] = [
    //...mainNavItems,
    {
        title: 'ផ្ទាំងទំព័រដើម',
        href: '/seller/dashboard',
        icon: House,
    },
    {
        title: 'ប្រូហ្វាលយ៍',
        href: '/seller/profile',
        icon: User,
    },
    {
        title: 'ការគ្រប់គ្រងផលិតផល',
        icon: Box,
        children: [
            { title: 'ផលិតផល', href: '/seller/product', icon: Box },
            { title: 'ប្រភេទផលិតផល', href: '/seller/category', icon: Box },
        ],
    },

    {
        title: 'គ្រប់គ្រងការបញ្ជាទិញ',
        href: '/seller/orders',
        icon: Truck,
    },
    {
        title: 'គ្រប់គ្រងការបង់ក្រាក់',
        href: '/seller/payments',
        icon: DollarSign,
    },
    {
        title: ' Reviews & Ratings',
        href: '/seller/reviews',
        icon: Star,
    },
    {
        title: ' របាយការណ៍',
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
