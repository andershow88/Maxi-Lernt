import { ScanUpload } from "@/components/scan/scan-upload";
import { PageHeader } from "@/components/ui/page-header";

export default function ScanPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Scan & Zusammenfassung"
        description="Fotografiere eine Seite oder füge Text ein — die KI fasst zusammen."
      />
      <ScanUpload />
    </div>
  );
}
