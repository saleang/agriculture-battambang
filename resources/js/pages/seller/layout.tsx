// Use literal route paths to avoid runtime route helper issues
import { NavItem } from "@/types";
import { Link } from "@inertiajs/react";
import { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";
import  Heading  from "@/components/heading";
import { cn } from "@/lib/utils";
import { isSameUrl, resolveUrl } from "@/lib/utils";
const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: '/seller/profile',
        icon: null,
    },
    {
        title: 'Account',
        href: '#',
        icon: null,
    },
    {
        title: 'Two-Factor Auth',
        href: '#',
        icon: null,
    },
    {
        title: 'Appearance',
        href: '#',
        icon: null,
    },
];
export default function SellerLayout({ children }: PropsWithChildren) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="px-4 py-6">
            <Heading
                title="Seller Settings"
                description="Manage your seller profile and account settings"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${resolveUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isSameUrl(
                                        currentPath,
                                        item.href,
                                    ),
                                })}
                            >
                                <Link href={item.href}>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>
                <div className="mt-6 lg:mt-0 lg:flex-1">{children}</div>
            </div>
        </div>
    );
}

