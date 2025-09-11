import { Suspense } from "react";
import { QuarterSettingsForm } from "@/components/quarter-settings-form";
import { getQuarterSettings } from "@/lib/actions/quarter-settings-actions";

interface QuarterSettingsWrapperProps {
  year?: number;
}

async function QuarterSettingsContent({
  year = new Date().getFullYear(),
}: QuarterSettingsWrapperProps) {
  try {
    const initialData = await getQuarterSettings(year);
    return <QuarterSettingsForm initialData={initialData} />;
  } catch (error) {
    console.error("Error loading quarter settings:", error);
    return <QuarterSettingsForm />;
  }
}

export function QuarterSettingsWrapper({ year }: QuarterSettingsWrapperProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Quarter Settings</h3>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <QuarterSettingsContent year={year} />
    </Suspense>
  );
}
