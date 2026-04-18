import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';

interface NavMainProps {
    items: NavItem[];
}

export function NavMain({ items = [] }: NavMainProps) {
    const { url } = usePage();
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const toggleMenu = (title: string) => {
        setOpenMenu((prev) => (prev === title ? null : title));
    };

    const isActive = (href?: string) => {
        if (!href) return false;
        const path = url.split('?')[0].replace(/\/$/, '');
        const target = href.replace(/\/$/, '');
        return path === target || path.startsWith(target + '/');
    };

    // បើក dropdown ដោយស្វ័យប្រវត្តិ នៅពេល child active
    useEffect(() => {
        items.forEach((item) => {
            if (item.children?.some((c) => c.href && isActive(c.href))) {
                setOpenMenu(item.title);
            }
        });
    }, [url]);

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarMenu>
                {items.map((item) => {
                    const hasChildren = !!item.children?.length;
                    const open = openMenu === item.title;
                    const parentActive = item.children?.some((c) => isActive(c.href));

                    return (
                        <Fragment key={item.title}>
                            <SidebarMenuItem>
                                {hasChildren ? (
                                    <SidebarMenuButton
                                        onClick={() => toggleMenu(item.title)}
                                        isActive={parentActive}
                                        className="h-10 justify-between text-emerald-100 hover:bg-[#46953D]/30 transition-colors data-[active=true]:bg-white data-[active=true]:text-emerald-700 data-[active=true]:hover:bg-white data-[active=true]:hover:text-emerald-800"
                                    >
                                        <div className="flex items-center gap-2">
                                            {item.icon && <item.icon className="h-4 w-4" />}
                                            <span>{item.title}</span>
                                        </div>
                                        {open ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                    </SidebarMenuButton>
                                ) : (
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.href)}
                                        className="h-10 transition-colors text-emerald-100 hover:bg-[#46953D]/30 data-[active=true]:bg-white data-[active=true]:text-emerald-700 data-[active=true]:hover:bg-white data-[active=true]:hover:text-emerald-800"
                                    >
                                        <Link href={item.href!} prefetch>
                                            {item.icon && <item.icon className="h-4 w-4" />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                )}
                            </SidebarMenuItem>

                            {open && (
                                <div className="ml-6 flex flex-col border-l border-emerald-500 py-2 pl-2">
                                    {item.children?.map((child) => (
                                        <SidebarMenuItem key={child.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive(child.href)}
                                                className="h-9 transition-colors text-emerald-100 hover:bg-[#46953D]/25 data-[active=true]:bg-white data-[active=true]:text-emerald-700 data-[active=true]:hover:bg-white data-[active=true]:hover:text-emerald-800"
                                            >
                                                <Link href={child.href!} prefetch>
                                                    {child.icon && <child.icon className="h-3.5 w-3.5" />}
                                                    <span>{child.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </div>
                            )}
                        </Fragment>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}