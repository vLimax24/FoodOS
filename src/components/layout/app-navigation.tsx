"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  CalendarDays,
  ChefHat,
  Home,
  Leaf,
  ShoppingBasket,
  Users,
} from "lucide-react";

const navigation = [
  { href: "/", label: "Übersicht", mobile: "Home", icon: Home },
  {
    href: "/shopping",
    label: "Einkauf",
    mobile: "Einkauf",
    icon: ShoppingBasket,
  },
  { href: "/recipes", label: "Rezepte", mobile: "Rezepte", icon: ChefHat },
  { href: "/pantry", label: "Vorräte", mobile: "Vorräte", icon: Archive },
  { href: "/planner", label: "Planung", mobile: "Planung", icon: CalendarDays },
];

type AppNavigationProps = {
  householdName: string;
  userName: string;
};

export function AppNavigation({ householdName, userName }: AppNavigationProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[#e8ece5] bg-white md:flex">
        <div className="flex h-16 items-center gap-3 border-b border-[#e8ece5] px-6">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#edf4ed] text-[#39734a]">
            <Leaf size={21} />
          </div>
          <span className="text-xl font-semibold tracking-tight">FoodOS</span>
        </div>

        <Link
          href="/household"
          className="mx-4 mt-5 flex items-center gap-3 rounded-xl border border-[#e8ece5] p-3 transition-colors hover:bg-[#f8faf7]"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#edf4ed] text-[#56815c]">
            <Users size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[#899188]">Haushalt</p>
            <p className="truncate text-sm font-medium">{householdName}</p>
          </div>
        </Link>

        <p className="mb-3 mt-8 px-7 text-[11px] font-semibold tracking-widest text-[#9aa198]">
          MENÜ
        </p>

        <nav className="flex flex-col gap-1 px-3">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                  active
                    ? "bg-[#edf4ed] font-semibold text-[#39734a]"
                    : "text-[#687066] hover:bg-[#f7f8f6] hover:text-[#20251f]"
                }`}
              >
                <Icon size={19} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex items-center gap-3 border-t border-[#edf0eb] px-5 py-5">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#e8eee4] font-semibold text-[#55745b]">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{userName}</p>
            <p className="text-xs text-[#92998f]">FoodOS-Mitglied</p>
          </div>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#e8ece5]/80 bg-white/90 px-4 backdrop-blur-xl md:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#edf4ed] text-[#39734a]">
            <Leaf size={18} />
          </div>
          <span className="font-semibold tracking-tight">FoodOS</span>
        </Link>

        <Link
          href="/household"
          aria-label="Haushalt verwalten"
          className="flex size-9 items-center justify-center rounded-full bg-[#edf4ed] text-[#39734a] transition-colors hover:bg-[#e1ede1]"
        >
          <Users size={18} />
        </Link>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#e8ece5]/80 bg-white/95 px-1 pt-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        {navigation.map(({ href, mobile, icon: Icon }) => {
          const active = isActive(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-2 transition-colors ${
                active ? "font-semibold text-[#39734a]" : "text-[#92998f]"
              }`}
            >
              <Icon size={21} strokeWidth={active ? 2.3 : 1.8} />
              <span className="max-w-full truncate text-[10px] leading-tight">
                {mobile}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
