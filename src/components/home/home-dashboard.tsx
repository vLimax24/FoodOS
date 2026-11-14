"use client";

import { useState } from "react";
import {
  Archive,
  CalendarDays,
  ChefHat,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Home,
  Leaf,
  Nfc,
  Plus,
  ShoppingBasket,
  Users,
} from "lucide-react";
import Link from "next/link";
import { AddShoppingItemDialog } from "@/components/shopping/add-shopping-item-dialog";
import { ShoppingItemRow } from "@/components/shopping/shopping-item-row";

const navigation = [
  { id: "home", label: "Übersicht", mobile: "Home", icon: Home },
  { id: "shopping", label: "Einkauf", mobile: "Einkauf", icon: ShoppingBasket },
  { id: "recipes", label: "Rezepte", mobile: "Rezepte", icon: ChefHat },
  { id: "pantry", label: "Vorräte", mobile: "Vorräte", icon: Archive },
  {
    id: "planner",
    label: "Essensplanung",
    mobile: "Planung",
    icon: CalendarDays,
  },
] as const;

type ShoppingItem = {
  id: string;
  name: string;
  quantity: number | string | null;
  unit: string | null;
  is_completed: boolean;
};

type HomeDashboardProps = {
  householdName: string;
  userName: string;
  shoppingItemCount: number;
  shoppingItems: ShoppingItem[];
};

type Screen = (typeof navigation)[number]["id"] | "nfc" | "tags";

export default function HomeDashboard({
  householdName,
  userName,
  shoppingItemCount,
  shoppingItems,
}: HomeDashboardProps) {
  const [screen, setScreen] = useState<Screen>("home");

  const activeScreen = screen === "tags" || screen === "nfc" ? "home" : screen;
  const currentPage = navigation.find((item) => item.id === activeScreen);

  return (
    <div className="min-h-screen bg-[#f7f8f6] text-[#20251f]">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[#e9ece7] bg-white px-5 py-6 md:flex">
        <div className="mb-9 flex items-center gap-2.5 px-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#e8f2e8] text-[#39734a]">
            <Leaf size={21} />
          </div>
          <span className="text-xl font-semibold tracking-tight">FoodOS</span>
        </div>

        <Link
          href="/household"
          className="mb-8 flex items-center gap-3 rounded-xl border border-[#e9ece7] p-3 text-left transition hover:bg-[#f8faf7]"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#edf2ed] text-[#55745b]">
            <Users size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[#899188]">Haushalt</p>
            <p className="font-medium">{householdName}</p>
          </div>
          <ChevronDown size={16} className="text-[#899188]" />
        </Link>

        <p className="mb-3 px-3 text-[11px] font-semibold tracking-[0.12em] text-[#9aa198]">
          MENÜ
        </p>

        <nav className="flex flex-col gap-1">
          {navigation.map(({ id, label, icon: Icon }) =>
            id === "shopping" ? (
              <Link
                key={id}
                href="/shopping"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#687066] transition hover:bg-[#f7f8f6] hover:text-[#20251f]"
              >
                <Icon size={19} />
                <span className="flex-1 text-left">{label}</span>
                <span className="rounded-full bg-[#dcebdc] px-2 py-0.5 text-xs font-medium text-[#39734a]">
                  {shoppingItemCount}
                </span>
              </Link>
            ) : id === "pantry" ? (
              <Link
                key={id}
                href="/pantry"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#687066] transition hover:bg-[#f7f8f6] hover:text-[#20251f]"
              >
                <Icon size={19} />
                <span className="flex-1 text-left">{label}</span>
                <span className="rounded-full bg-[#dcebdc] px-2 py-0.5 text-xs font-medium text-[#39734a]">
                  {shoppingItemCount}
                </span>
              </Link>
            ) : (
              <button
                key={id}
                onClick={() => setScreen(id)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                  activeScreen === id
                    ? "bg-[#edf4ed] font-semibold text-[#39734a]"
                    : "text-[#687066] hover:bg-[#f7f8f6] hover:text-[#20251f]"
                }`}
              >
                <Icon size={19} />
                <span className="flex-1 text-left">{label}</span>
              </button>
            ),
          )}
        </nav>

        <p className="mb-3 mt-9 px-3 text-[11px] font-semibold tracking-[0.12em] text-[#9aa198]">
          FUNKTIONEN
        </p>

        <nav className="flex flex-col gap-1">
          <button
            onClick={() => setScreen("nfc")}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
              screen === "nfc"
                ? "bg-[#edf4ed] font-semibold text-[#39734a]"
                : "text-[#687066] hover:bg-[#f7f8f6]"
            }`}
          >
            <Nfc size={19} />
            NFC Schnellzugriff
          </button>
          <button
            onClick={() => setScreen("tags")}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
              screen === "tags"
                ? "bg-[#edf4ed] font-semibold text-[#39734a]"
                : "text-[#687066] hover:bg-[#f7f8f6]"
            }`}
          >
            <CircleAlert size={19} />
            NFC-Tags
          </button>
        </nav>

        <div className="mt-auto flex items-center gap-3 border-t border-[#edf0eb] pt-5">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#e8eee4] font-semibold text-[#55745b]">
            L
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{userName}</p>
            <p className="truncate text-xs text-[#92998f]">FoodOS-Mitglied</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-h-screen pb-24 md:ml-64 md:pb-8">
        <header className="flex h-16 items-center justify-between border-b border-[#e9ece7] bg-white px-5 md:px-10">
          <Link
            href="/household"
            className="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-[#f7f8f6]"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#edf4ed] text-[#39734a]">
              <Users size={17} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#30382f]">
                Haushalt verwalten
              </p>
              <p className="font-medium">{householdName}</p>
            </div>

            <ChevronRight
              size={15}
              className="ml-1 text-[#899188] transition group-hover:translate-x-0.5"
            />
          </Link>

          <button className="flex items-center gap-2 rounded-full border border-[#e9ece7] py-1.5 pl-1.5 pr-3 transition hover:bg-[#f7f8f6]">
            <div className="flex size-7 items-center justify-center rounded-full bg-[#e8eee4] text-xs font-semibold text-[#55745b]">
              L
            </div>
            <span className="hidden text-sm font-medium sm:block">
              {userName.split(" ")[0]}
            </span>
            <ChevronDown size={14} className="text-[#899188]" />
          </button>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-8 md:px-10 md:py-10">
          {screen === "home" ? (
            <>
              <div className="mb-8">
                <p className="mb-2 text-sm font-medium text-[#7d8979]">
                  SAMSTAG, 14. NOVEMBER
                </p>
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Guten Morgen!
                </h1>
                <p className="mt-2 text-[#81897f]">
                  Was steht heute bei euch an?
                </p>
              </div>

              {/* Today's meal */}
              <section className="mb-8 overflow-hidden rounded-2xl border border-[#e8ece5] bg-white md:flex">
                <div className="min-h-52 flex-1 bg-[url('https://images.unsplash.com/photo-1792354441702-572e1ffaca2b?auto=format&fit=crop&w=1200&q=85')] bg-cover bg-center md:min-h-72" />
                <div className="flex flex-1 flex-col justify-center p-6 md:p-9">
                  <p className="text-xs font-semibold tracking-[0.13em] text-[#739276]">
                    HEUTE MITTAG
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Lasagne</h2>
                  <p className="mt-2 text-sm text-[#858d82]">
                    45 Min. · Mittel · 4 Portionen
                  </p>

                  <div className="mt-7">
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="text-[#7c8579]">Zutaten vorhanden</span>
                      <span className="font-semibold text-[#39734a]">
                        3 von 5
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#edf0eb]">
                      <div className="h-full w-3/5 rounded-full bg-[#79a47d]" />
                    </div>
                  </div>

                  <button
                    onClick={() => setScreen("recipes")}
                    className="mt-6 flex w-fit items-center gap-2 rounded-xl bg-[#edf4ed] px-4 py-2.5 text-sm font-semibold text-[#39734a] transition hover:bg-[#e1ede1]"
                  >
                    Rezept ansehen
                    <ChevronRight size={16} />
                  </button>
                </div>
              </section>

              {/* Overview cards */}
              <div className="grid gap-5 lg:grid-cols-2">
                <section className="rounded-2xl border border-[#e8ece5] bg-white p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-[#edf4ed] text-[#56815c]">
                        <ShoppingBasket size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold">Einkaufsliste</h3>
                        <p className="text-xs text-[#92998f]">
                          Euer gemeinsamer Einkauf
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <AddShoppingItemDialog />

                      <Link
                        href="/shopping"
                        className="text-sm font-medium text-[#56815c] hover:underline"
                      >
                        Öffnen
                      </Link>
                    </div>
                  </div>

                  <p className="mb-4 text-2xl font-semibold">
                    {shoppingItemCount} Lebensmittel
                  </p>

                  <div className="space-y-3 text-sm text-[#697166]">
                    {shoppingItems.length > 0 ? (
                      shoppingItems.map((item) => (
                        <ShoppingItemRow
                          key={`${item.id}-${item.is_completed}`}
                          id={item.id}
                          name={item.name}
                          quantity={item.quantity}
                          unit={item.unit}
                          isCompleted={item.is_completed}
                        />
                      ))
                    ) : (
                      <div className="rounded-xl bg-[#f7f9f6] px-4 py-5 text-center">
                        <ShoppingBasket
                          size={24}
                          className="mx-auto mb-2 text-[#a5b3a1]"
                        />
                        <p className="text-sm font-medium text-[#697166]">
                          Eure Einkaufsliste ist noch leer
                        </p>
                        <p className="mt-1 text-xs text-[#92998f]">
                          Fügt euren ersten Artikel hinzu!
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border border-[#e8ece5] bg-white p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#fbf1df] text-[#b68a3c]">
                      <Archive size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">Vorräte</h3>
                      <p className="text-xs text-[#92998f]">Bald nachkaufen</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Milch</p>
                        <p className="text-xs text-[#92998f]">Kühlschrank</p>
                      </div>
                      <span className="rounded-full bg-[#fceceb] px-3 py-1 text-xs font-medium text-[#b75b50]">
                        Leer
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Reis</p>
                        <p className="text-xs text-[#92998f]">Vorratsschrank</p>
                      </div>
                      <span className="rounded-full bg-[#fbf1df] px-3 py-1 text-xs font-medium text-[#a47b36]">
                        Wenig
                      </span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Quick actions */}
              <section className="mt-8">
                <h3 className="mb-4 text-lg font-semibold">Schnellzugriff</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <button
                    onClick={() => setScreen("shopping")}
                    className="flex items-center gap-3 rounded-xl border border-[#e8ece5] bg-white p-4 text-left transition hover:border-[#c8d9c8] hover:bg-[#fbfdfb]"
                  >
                    <Plus className="text-[#56815c]" />
                    <span>
                      <span className="block text-sm font-semibold">
                        Lebensmittel hinzufügen
                      </span>
                      <span className="text-xs text-[#92998f]">
                        Zur Einkaufsliste
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => setScreen("recipes")}
                    className="flex items-center gap-3 rounded-xl border border-[#e8ece5] bg-white p-4 text-left transition hover:border-[#c8d9c8] hover:bg-[#fbfdfb]"
                  >
                    <ChefHat className="text-[#56815c]" />
                    <span>
                      <span className="block text-sm font-semibold">
                        Rezept entdecken
                      </span>
                      <span className="text-xs text-[#92998f]">
                        Familienkochbuch
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => setScreen("nfc")}
                    className="flex items-center gap-3 rounded-xl border border-[#e8ece5] bg-white p-4 text-left transition hover:border-[#c8d9c8] hover:bg-[#fbfdfb]"
                  >
                    <Nfc className="text-[#56815c]" />
                    <span>
                      <span className="block text-sm font-semibold">
                        NFC Schnellzugriff
                      </span>
                      <span className="text-xs text-[#92998f]">
                        Direkt Lebensmittel ergänzen
                      </span>
                    </span>
                  </button>
                </div>
              </section>
            </>
          ) : (
            <div className="rounded-2xl border border-[#e8ece5] bg-white p-8">
              <p className="mb-2 text-sm font-medium text-[#739276]">FOODOS</p>
              <h1 className="text-3xl font-semibold">
                {currentPage?.label ??
                  (screen === "nfc" ? "NFC Schnellzugriff" : "NFC-Tags")}
              </h1>
              <p className="mt-3 max-w-lg text-[#81897f]">
                Dieser Bereich bekommt im nächsten Schritt seine eigene
                Oberfläche. Die Navigation funktioniert bereits.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[#e9ece7] bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur md:hidden">
        {navigation.map(({ id, mobile, icon: Icon }) =>
          id === "shopping" ? (
            <Link
              key={id}
              href="/shopping"
              className="flex flex-col items-center gap-1 py-2 text-[10px] text-[#92998f] transition"
            >
              <Icon size={21} />
              {mobile}
            </Link>
          ) : id === "pantry" ? (
            <Link
              key={id}
              href="/pantry"
              className="flex flex-col items-center gap-1 py-2 text-[10px] text-[#92998f] transition"
            >
              <Icon size={21} />
              {mobile}
            </Link>
          ) : (
            <button
              key={id}
              onClick={() => setScreen(id)}
              className={`flex flex-col items-center gap-1 py-2 text-[10px] transition ${
                activeScreen === id
                  ? "font-semibold text-[#39734a]"
                  : "text-[#92998f]"
              }`}
            >
              <Icon size={21} />
              {mobile}
            </button>
          ),
        )}
      </nav>
    </div>
  );
}
