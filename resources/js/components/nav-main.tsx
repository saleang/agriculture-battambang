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

  const isActive = (href?: any) => {
    if (!href) return false;

    const resolved = resolveUrl(href).replace(/\/$/, "");
    const path = currentPath.split("?")[0].replace(/\/$/, "");

    return path === resolved || path.startsWith(resolved + "/");
  };
  useEffect(() => {
    items.forEach((item) => {
      if (
        item.children?.some(
          (c) => c.href && isActive(c.href)
        )
      ) {
        setOpenMenu(item.title);
      }
    });
  }, [currentPath, items]);

  return (
  <SidebarGroup className="px-2 py-0">
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
                className="h-10 justify-between text-emerald-100 hover:bg-[#46953D]/30 active:bg-[#46953D]/50 transition-colors"
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
                className="h-10 transition-colors text-emerald-100 hover:bg-[#46953D]/30 data-[active=true]:relative data-[active=true]:bg-white data-[active=true]:text-emerald-700 data-[active=true]:hover:bg-white data-[active=true]:hover:text-emerald-800 active-link"
              >
                <Link href={resolveUrl(item.href!)} prefetch>
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
                    className="h-9 transition-colors text-emerald-100 hover:bg-[#46953D]/25 data-[active=true]:relative data-[active=true]:bg-white data-[active=true]:text-emerald-700 data-[active=true]:hover:bg-white data-[active=true]:hover:text-emerald-800 active-link"
                  >
                    <Link href={resolveUrl(child.href!)} prefetch>
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