// resources/js/pages/seller/layout.tsx

import { PropsWithChildren } from "react";
import { Link, usePage, useRemember } from "@inertiajs/react";
import { User, Sprout, CreditCard, Lock, Box } from "lucide-react";

import { NavItem } from "@/types";
import { Button } from "@/components/ui/button";
import Heading from "@/components/heading";
import { cn, resolveUrl } from "@/lib/utils";

// Sidebar items
const sidebarNavItems: NavItem[] = [
  {
    title: "ប្រវត្តិរូបរបស់ខ្ញុំ",
    href: "/seller/profile",
    icon: User,
  },
  {
    title: "ព័ត៌មានកសិដ្ឋាន",
    href: "/seller/farm_info",
    icon: Sprout,
  },
  {
    title: "ការកំណត់ការបង់ប្រាក់",
    href: "/seller/payment_info",
    icon: CreditCard,
  },
  {
    title: "ពាក្យសម្ងាត់",
    href: "/seller/password",
    icon: Lock,
  },
  {
    title: "គ្រប់គ្រងផលិតផល",
    icon: Box,
    children: [
      {
        title: "Products",
        href: "/seller/product",
        icon: Box,
      },
      {
        title: "Categories",
        href: "/seller/category",
        icon: Box,
      },
    ],
  },
];

export default function SellerLayout({ children }: PropsWithChildren) {
  const page = usePage();
  const currentPath = page.url;

  // Persist open menu
  const [openMenu, setOpenMenu] = useRemember<string | null>(
    null,
    "sidebar-open-menu"
  );

  const toggleMenu = (title: string) => {
    setOpenMenu((prev) => (prev === title ? null : title));
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return currentPath.startsWith(resolveUrl(href));
  };

  return (
    <div className="min-h-screen bg-green-300 px-4 py-6">
      <Heading
        title="ការកំណត់អ្នកលក់"
        description="គ្រប់គ្រងប្រវត្តិរូប និងការកំណត់គណនីរបស់អ្នក"
      />

      <div className="mt-6 flex flex-col lg:flex-row lg:space-x-12">
        {/* Sidebar */}
        <aside className="w-full max-w-xl lg:w-64">
          <nav className="flex flex-col space-y-1">
            {sidebarNavItems.map((item) => {
              const hasChildren = !!item.children?.length;
              const open = openMenu === item.title;

              return (
                <div key={item.title}>
                  {/* Parent */}
                  {hasChildren ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "w-full justify-between text-left",
                        open && "bg-green-100 text-green-700"
                      )}
                      onClick={() => toggleMenu(item.title)}
                    >
                      <div className="flex items-center gap-2">
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                      </div>
                      <span>{open ? "▼" : "▶"}</span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                      className={cn(
                        "w-full justify-start text-left",
                        isActive(item.href) &&
                          "bg-green-100 text-green-700"
                      )}
                    >
                      <Link href={item.href!}>
                        {item.icon && (
                          <item.icon className="mr-2 h-4 w-4" />
                        )}
                        {item.title}
                      </Link>
                    </Button>
                  )}

                  {/* Children */}
                  {open &&
                    item.children?.map((child) => (
                      <Button
                        key={child.title}
                        size="sm"
                        variant="ghost"
                        asChild
                        className={cn(
                          "ml-4 w-full justify-start text-left",
                          isActive(child.href) &&
                            "bg-green-200 text-green-800"
                        )}
                      >
                        <Link href={child.href!}>
                          {child.icon && (
                            <child.icon className="mr-2 h-3.5 w-3.5" />
                          )}
                          {child.title}
                        </Link>
                      </Button>
                    ))}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="mt-6 flex-1 lg:mt-0">{children}</main>
      </div>
    </div>
  );
}
