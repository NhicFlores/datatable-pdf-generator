import { Suspense } from "react";
import { QuarterSettingsForm } from "@/components/quarter-settings-form";
import { CurrentQuarterForm } from "@/components/current-quarter-form";
import { getQuarterSettings, getAllActiveQuarters, updateCurrentQuarter } from "@/lib/actions/quarter-settings-actions";
import { getCurrentQuarterFromDB } from "@/lib/actions/quarter-settings-actions";

interface QuarterSettingsWrapperProps {
  year?: number;
}

async function QuarterSettingsContent({
  year = new Date().getFullYear(),
}: QuarterSettingsWrapperProps) {
  try {
    // Fetch data for both forms
    const [quarterSettingsData, activeQuarters, currentQuarterData] = await Promise.all([
      getQuarterSettings(year),
      getAllActiveQuarters(),
      getCurrentQuarterFromDB(),
    ]);

    // Transform active quarters for the current quarter form
    const availableQuarters = activeQuarters.map((q) => ({
      value: `${q.year}-Q${q.quarter}`,
      label: `Q${q.quarter} ${q.year} (${q.startDate.toLocaleDateString()} - ${q.endDate.toLocaleDateString()})`,
      year: q.year,
      quarter: q.quarter,
    }));

    return (
      <div className="space-y-6">
        {/* Current Quarter Form */}
        <CurrentQuarterForm
          currentQuarter={currentQuarterData.currentQuarter}
          availableQuarters={availableQuarters}
          onUpdate={updateCurrentQuarter}
        />
        
        {/* Quarter Settings Form */}
        <QuarterSettingsForm initialData={quarterSettingsData} />
      </div>
    );
  } catch (error) {
    console.error("Error loading quarter settings:", error);
    return (
      <div className="space-y-6">
        <CurrentQuarterForm
          availableQuarters={[]}
          onUpdate={updateCurrentQuarter}
        />
        <QuarterSettingsForm />
      </div>
    );
  }
}

export function QuarterSettingsWrapper({ year }: QuarterSettingsWrapperProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Current Quarter Setting</h3>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
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
