import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { usePage } from '@inertiajs/react';
import {
    Bell,
    Box,
    ChartColumnIncreasing,
    CreditCard,
    Folder,
    House,
    LayoutGrid,
    Lock,
    Package,
    ShoppingBasket,
    Star,
    Store,
    Tags,
    Truck,
    User,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'ផ្ទាំងទំព័រដើម',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'ការគ្រប់គ្រងអ្នកប្រើប្រាស់',
        href: '/admin/users',
        icon: User,
    },
    {
        title: 'គ្រប់គ្រងអាជីវករ',
        href: '/admin/sellers',
        icon: Store,
    },
    {
        title: 'គ្រប់គ្រងផលិតផល',
        href: '/admin/products',
        icon: Package,
    },
    {
        title: 'គ្រប់គ្រងប្រភេទផលិតផល',
        href: '/admin/categories',
        icon: Tags,
    },
    {
        title: 'ការ​វាយតម្លៃ',
        href: '/admin/ratings',
        icon: Star,
    },
    {
        title: 'របាយការណ៍',
        href: '/admin/reports',
        icon: ChartColumnIncreasing,
    },
];

const sellerNavItems: NavItem[] = [
    {
        title: 'ផ្ទាំងទំព័រដើម',
        href: '/seller/dashboard',
        icon: House,
    },
    {
        title: 'គណនីរបស់ខ្ញុំ',
        icon: User,
        children: [
            {
                title: 'ប្រវត្តិរូបរបស់ខ្ញុំ',
                href: '/seller/profile',
                icon: User,
            },
            { title: 'ព័ត៌មានហាង', href: '/seller/farm_info', icon: Store },
            {
                title: 'ការកំណត់ការបង់ប្រាក់',
                href: '/seller/payment_info',
                icon: CreditCard,
            },
            { title: 'ពាក្យសម្ងាត់', href: '/seller/password', icon: Lock },
            {
                title: 'ការកំណត់ការជូនដំណឹង',
                href: '/seller/telegram_settings',
                icon: Bell,
            },
        ],
    },
    {
        title: 'ផលិតផលរបស់ខ្ញុំ',
        icon: Box,
        children: [
            { title: 'ផលិតផល', href: '/seller/product', icon: ShoppingBasket },
            { title: 'ក្រុមផលិតផល', href: '/seller/category', icon: Tags },
        ],
    },
    {
        title: 'ចំនួននៃការបញ្ជាទិញ',
        href: '/seller/orders',
        icon: Truck,
    },
    {
        title: 'គ្រប់គ្រងការបង់ក្រាក់',
        href: '/seller/payments',
        icon: CreditCard,
    },
    {
        title: 'ការវាយតម្លៃរបស់ខ្ញុំ',
        href: '/seller/reviews',
        icon: Star,
    },
    {
        title: 'របាយការណ៍របស់ខ្ញុំ',
        href: '/seller/reports',
        icon: ChartColumnIncreasing,
    },
];

export function AppSidebar() {
    const { props } = usePage();
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
                <NavMain items={roleBasedNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
