"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateHouseholdName } from "@/app/(app)/household/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type HouseholdNameDialogProps = {
  householdName: string;
};

export function HouseholdNameDialog({
  householdName,
}: HouseholdNameDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(householdName);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 50) {
      toast.error("Der Name muss zwischen 2 und 50 Zeichen lang sein.");
      return;
    }

    const formData = new FormData();
    formData.set("name", trimmedName);

    startTransition(async () => {
      const result = await updateHouseholdName(formData);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Haushaltsname erfolgreich geändert!");
      setOpen(false);
      router.refresh();
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return;

    if (nextOpen) {
      setName(householdName);
    }

    setOpen(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-[#638c5b] transition-colors hover:bg-white/70"
        aria-label="Haushaltsnamen bearbeiten"
      >
        <Pencil size={17} />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Haushaltsnamen ändern</DialogTitle>
          <DialogDescription>
            Gib deinem gemeinsamen Haushalt einen Namen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <label htmlFor="household-name" className="text-sm font-medium">
            Haushaltsname
          </label>

          <Input
            id="household-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={50}
            placeholder="z. B. Familie Müller"
            disabled={isPending}
          />

          <p className="text-right text-xs text-muted-foreground">
            {name.length}/50 Zeichen
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Abbrechen
          </Button>

          <Button
            onClick={handleSave}
            disabled={isPending || name.trim() === householdName}
            className="bg-[#638c5b] text-white hover:bg-[#52794c]"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Speichern...
              </>
            ) : (
              "Speichern"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
