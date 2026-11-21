import type { ReactNode } from "react";
import { Leaf, UtensilsCrossed, ShoppingBasket, Heart } from "lucide-react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f7f8f5] lg:grid lg:grid-cols-2">
      {/* Branding */}
      <section className="relative hidden min-h-screen overflow-hidden bg-[#527a4d] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" />
        <div className="absolute -bottom-40 -left-32 h-[500px] w-[500px] rounded-full border border-white/10" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/[0.04]" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
            <Leaf className="h-6 w-6" />
          </div>
          <span className="text-2xl font-semibold tracking-tight">FoodOS</span>
        </div>

        <div className="relative max-w-lg space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90">
            <Heart className="h-4 w-4" />
            Gemeinsam schmeckt&apos;s besser
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-semibold leading-[1.12] tracking-tight xl:text-6xl">
              Alles für eure Küche.
              <span className="block text-[#dcebd5]">An einem Ort.</span>
            </h1>

            <p className="max-w-md text-lg leading-relaxed text-white/75">
              Organisiert euren Einkauf, entdeckt Rezepte und plant eure
              gemeinsamen Mahlzeiten – ganz einfach.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <ShoppingBasket className="mb-3 h-6 w-6 text-[#dcebd5]" />
              <p className="font-medium">Einkäufe</p>
              <p className="mt-1 text-sm text-white/65">
                Gemeinsam organisieren
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <UtensilsCrossed className="mb-3 h-6 w-6 text-[#dcebd5]" />
              <p className="font-medium">Rezepte</p>
              <p className="mt-1 text-sm text-white/65">Neues entdecken</p>
            </div>
          </div>
        </div>

        <p className="relative text-sm text-white/50">
          Weniger organisieren. Mehr genießen.
        </p>
      </section>

      {/* Form area */}
      <section className="flex min-h-screen flex-col">
        <div className="flex items-center gap-2 p-6 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4e9] text-[#638c5b]">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-[#334b30]">
            FoodOS
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <p className="px-6 pb-6 text-center text-xs text-muted-foreground">
          FoodOS · Gemeinsam den Alltag einfacher machen
        </p>
      </section>
    </main>
  );
}
