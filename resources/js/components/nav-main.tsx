import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { resolveUrl } from "@/lib/utils";
import { type NavItem } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { Fragment, useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface NavMainProps {
  items: NavItem[];
}

export function NavMain({ items = [] }: NavMainProps) {
  const page = usePage();
  const currentPath = page.url;

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (title: string) => {
    setOpenMenu((prev) => (prev === title ? null : title));
  };

  const isActive = (href?: string) =>
    href ? currentPath.startsWith(resolveUrl(href)) : false;

  // Automatically open dropdowns if URL matches a child
  useEffect(() => {
    items.forEach(item => {
      if (item.children?.some(c => c.href && currentPath.startsWith(resolveUrl(c.href)))) {
        setOpenMenu(item.title);
      }
    });
  }, [currentPath, items]);

  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = !!item.children?.length;
          const open = openMenu === item.title;

          return (
            <Fragment key={item.title}>
              <SidebarMenuItem>
                {hasChildren ? (
                  <SidebarMenuButton
                    onClick={() => toggleMenu(item.title)}
                    className="h-10 justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.title}</span>
                    </div>
                    {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className={isActive(item.href) ? "bg-green-500 text-white h-10" : "hover:bg-green-100 h-10"}
                  >
                    <Link href={item.href!} prefetch>
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>

              {open &&
                item.children?.map((child) => (
                  <SidebarMenuItem key={child.title} className="ml-6">
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(child.href)}
                      className={isActive(child.href) ? "bg-green-400 text-white h-9" : "hover:bg-green-100 h-9"}
                    >
                      <Link href={child.href!} prefetch>
                        {child.icon && <child.icon className="h-3.5 w-3.5" />}
                        <span>{child.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </Fragment>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
