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
// import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Box, ChartColumnIncreasing, DollarSign, Folder, House, LayoutGrid,Package, Package2, Star, Truck, User } from 'lucide-react';
import AppLogo from './app-logo';

// const {auth} = usePage().props;
// const userRole = auth?.user?.

//I want to do adminNavItems and sellerNavItems
//adminNavItems

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
        href: '/seller/products',
        icon: Box,
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

// const adminNavItems: NavItem[] = [
//     {
//         title: 'Dashboard',
//         href: '/dashboard',
//         icon: LayoutGrid,
//     },
//     {
//         title: 'Manage Users',
//         href: '/admin/users',
//         icon: LayoutGrid,
//     },
// ];

// const sellerNavItems: NavItem[] = [
//     {
//         title: 'Dashboard',
//         href: '/dashboard',
//         icon: LayoutGrid,
//     },
// ];

// let roleBasedNavItems= [...mainNavItems];
// if (userRole === 'admin') {
//     roleBasedNavItems = [...roleBasedNavItems, ...adminNavItems];
// } else if (userRole === 'seller') {
//     roleBasedNavItems = [...roleBasedNavItems, ...sellerNavItems];
// }

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
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
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={'/dashboard'} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={roleBasedNavItems}  />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
