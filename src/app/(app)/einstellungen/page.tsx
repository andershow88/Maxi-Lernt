import { ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsForm } from "@/components/settings-form";
import { getSettings } from "@/server/settings-actions";

export const dynamic = "force-dynamic";

export default async function EinstellungenPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Einstellungen" />
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
