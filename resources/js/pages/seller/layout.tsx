import { NavItem } from "@/types";
import { Link } from "@inertiajs/react";
import { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";
import Heading from "@/components/heading";
import { cn } from "@/lib/utils";
import { isSameUrl, resolveUrl } from "@/lib/utils";
import { User, Sprout, CreditCard, Lock } from "lucide-react";

const sidebarNavItems: NavItem[] = [
    {
        title: 'ប្រវត្តិរូបរបស់ខ្ញុំ',
        href: '/seller/profile',
        icon: User,
    },
    {
        title: 'ព័ត៌មានកសិដ្ឋាន',
        href: '/seller/farm_info',
        icon: Sprout,
    },
    {
        title: 'ការកំណត់ការបង់ប្រាក់',
        href: '/seller/payment_info',
        icon: CreditCard,
    },
    {
        title: 'ពាក្យសម្ងាត់',
        href: '/seller/password',
        icon: Lock,
    },
];

export default function SellerLayout({ children }: PropsWithChildren) {
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="px-4 py-6 bg-green-300">
            <Heading
                title="ការកំណត់អ្នកលក់"
                description="គ្រប់គ្រងប្រវត្តិរូប និងការកំណត់គណនីរបស់អ្នក"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-64">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${resolveUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn(
                                    'w-full justify-start text-left',
                                    {
                                        'bg-green-100 text-green-700 hover:bg-green-100': isSameUrl(
                                            currentPath,
                                            item.href,
                                        ),
                                    }
                                )}
                            >
                                <Link href={item.href}>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4 mr-2" />
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
