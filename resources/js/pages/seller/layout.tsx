import { PropsWithChildren } from "react";
import { Link, usePage, useRemember } from "@inertiajs/react";
import { User, Sprout, CreditCard, Lock, Bell } from "lucide-react";
import { NavItem } from "@/types";
import { cn } from "@/lib/utils";  // លុប resolveUrl ចេញ

const sidebarNavItems: NavItem[] = [
  { title: "ប្រវត្តិរូបរបស់ខ្ញុំ",      href: "/seller/profile",           icon: User       },
  { title: "ព័ត៌មានហាង",          href: "/seller/farm_info",         icon: Sprout     },
  { title: "ការកំណត់ការបង់ប្រាក់",     href: "/seller/payment_info",      icon: CreditCard },
  { title: "ពាក្យសម្ងាត់",             href: "/seller/password",          icon: Lock       },
  { title: "ការកំណត់ការជូនដំណឹង",      href: "/seller/telegram_settings", icon: Bell       },
];

export default function SellerLayout({ children }: PropsWithChildren) {
  const { url } = usePage(); // ← url គឺ "/seller/profile" ជាដើម

  const [openMenu, setOpenMenu] = useRemember<string | null>(null, "sidebar-open-menu");

  const toggleMenu = (title: string) => {
    setOpenMenu((prev) => (prev === title ? null : title));
  };

  // ✅ fix: ប្រៀបធៀប url ដោយផ្ទាល់ មិនប្រើ resolveUrl
  const isActive = (href?: string) => {
    if (!href) return false;
    return url === href || url.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      {/* Page Header */}
      {/* <div className="border-b border-gray-200 bg-white px-6 py-5">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">ការកំណត់គណនី</h1>
        <p className="mt-0.5 text-sm text-gray-500">គ្រប់គ្រងប្រវត្តិរូប និងការកំណត់គណនីរបស់អ្នក</p>
      </div> */}

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">

          {/* Sidebar */}
          {/* <aside className="w-full shrink-0 lg:w-56">
            <nav className="flex flex-col gap-0.5">
              {sidebarNavItems.map((item) => {
                const active = isActive(item.href);
                const hasChildren = !!item.children?.length;
                const open = openMenu === item.title;

                return (
                  <div key={item.title}>
                    {hasChildren ? (
                      <button
                        onClick={() => toggleMenu(item.title)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          open
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                          <span>{item.title}</span>
                        </div>
                        <span className="text-xs opacity-60">{open ? "▾" : "▸"}</span>
                      </button>
                    ) : (
                      // ✅ fix: href ដោយផ្ទាល់ មិនប្រើ resolveUrl(item.href!)
                      <Link
                        href={item.href!}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        {item.icon && (
                          <item.icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              active ? "text-emerald-600" : "text-gray-400"
                            )}
                          />
                        )}
                        {item.title}
                        {active && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        )}
                      </Link>
                    )}

                    {open &&
                      item.children?.map((child) => (
                        // ✅ fix: href ដោយផ្ទាល់ មិនប្រើ resolveUrl(child.href!)
                        <Link
                          key={child.title}
                          href={child.href!}
                          className={cn(
                            "ml-6 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                            isActive(child.href)
                              ? "bg-emerald-50 text-emerald-700 font-medium"
                              : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                          )}
                        >
                          {child.icon && <child.icon className="h-3.5 w-3.5 shrink-0" />}
                          {child.title}
                        </Link>
                      ))}
                  </div>
                );
              })}
            </nav>
          </aside> */}

          {/* Main Content */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}