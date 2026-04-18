import { PropsWithChildren } from "react";
import { Link, usePage } from "@inertiajs/react";
import { User, Sprout, CreditCard, Lock, Bell, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const sidebarNavItems: NavItem[] = [
  { title: "ប្រវត្តិរូបរបស់ខ្ញុំ",       href: "/seller/profile",           icon: User       },
  { title: "ព័ត៌មានហាង",           href: "/seller/farm_info",         icon: Sprout     },
  { title: "ការកំណត់ការបង់ប្រាក់",      href: "/seller/payment_info",      icon: CreditCard },
  { title: "ពាក្យសម្ងាត់",              href: "/seller/password",          icon: Lock       },
  { title: "ការកំណត់ការជូនដំណឹង",       href: "/seller/telegram_settings", icon: Bell       },
];

export default function SellerLayout({ children }: PropsWithChildren) {
  // usePage().url returns the current path (e.g. "/seller/profile")
  // It does NOT trigger a page reload — pure client-side read
  const { url } = usePage();

  const isActive = (href: string) => {
    // Exact match first, then startsWith for nested routes
    return url === href || url.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-5">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">
          ការកំណត់គណនី
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          គ្រប់គ្រងប្រវត្តិរូប និងការកំណត់គណនីរបស់អ្នក
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">

          {/* ───── Sidebar ───── */}
          <aside className="w-full shrink-0 lg:w-56">
            <nav className="flex flex-col gap-0.5">
              {sidebarNavItems.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    // preserve = keep scroll position (optional)
                    preserveScroll
                    className={cn(
                      // Base styles — always applied
                      "group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      // Active state
                      active
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    {/* Icon */}
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active
                          ? "text-emerald-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      )}
                    />

                    {/* Label */}
                    <span className="flex-1">{item.title}</span>

                    {/* Active dot indicator */}
                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* ───── Main Content ───── */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}