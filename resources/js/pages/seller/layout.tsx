// SellerLayout.tsx
import { NavItem } from "@/types";
import { Link, usePage, useRemember } from "@inertiajs/react";
import { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";
import Heading from "@/components/heading";
import { cn } from "@/lib/utils";
import { resolveUrl, isSameUrl } from "@/lib/utils";
import { User, Sprout, CreditCard, Lock, Box } from "lucide-react";

// Sidebar items
const sidebarNavItems: NavItem[] = [
  {
    title: "My Profile",
    href: "/seller/profile",
    icon: User,
  },
  {
    title: "Farm Information",
    href: "/seller/farm_info",
    icon: Sprout,
  },
  {
    title: "Payment Settings",
    href: "/seller/payment_info",
    icon: CreditCard,
  },
  {
    title: "Password",
    href: "/seller/password",
    icon: Lock,
  },
  {
    title: "Product Management",
    icon: Box,
    children: [
      { title: "Products", href: "/seller/product", icon: Box },
      { title: "Categories", href: "/seller/category", icon: Box },
    ],
  },
];

export default function SellerLayout({ children }: PropsWithChildren) {
  const page = usePage();
  const currentPath = page.url; // Inertia's current URL

  // Keep open menu state persistent across navigation
  const [openMenu, setOpenMenu] = useRemember<string | null>(null, "sidebar-open-menu");

  const toggleMenu = (title: string) => {
    setOpenMenu((prev) => (prev === title ? null : title));
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return currentPath.startsWith(resolveUrl(href));
  };

  return (
    <div className="px-4 py-6 bg-green-300 min-h-screen">
      <Heading
        title="Seller Settings"
        description="Manage your seller profile and account settings"
      />

      <div className="flex flex-col lg:flex-row lg:space-x-12 mt-6">
        {/* Sidebar */}
        <aside className="w-full max-w-xl lg:w-64">
          <nav className="flex flex-col space-y-1">
            {sidebarNavItems.map((item) => {
              const hasChildren = !!item.children?.length;
              const open = openMenu === item.title;

              return (
                <div key={item.title}>
                  {/* Parent item */}
                  {hasChildren ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "w-full justify-between text-left",
                        isActive(item.href) && "bg-green-100 text-green-700"
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
                        isActive(item.href) && "bg-green-100 text-green-700"
                      )}
                    >
                      <Link href={item.href!}>
                        {item.icon && <item.icon className="h-4 w-4 mr-2" />}
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
                          "w-full justify-start text-left ml-4",
                          isActive(child.href) && "bg-green-200 text-green-800"
                        )}
                      >
                        <Link href={child.href!}>
                          {child.icon && <child.icon className="h-3.5 w-3.5 mr-2" />}
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
        <div className="mt-6 lg:mt-0 lg:flex-1">{children}</div>
      </div>
    </div>
  );
}
