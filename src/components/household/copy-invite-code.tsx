"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

type CopyInviteCodeProps = {
  inviteCode: string;
};

export function CopyInviteCode({ inviteCode }: CopyInviteCodeProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast.success("Einladungscode kopiert!");

      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Der Einladungscode konnte nicht kopiert werden.");
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleCopy}
      aria-label="Einladungscode kopieren"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}
