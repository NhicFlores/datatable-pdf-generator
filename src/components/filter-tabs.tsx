import { Button } from "./ui/button";

interface FilterTabsProps {
  activeFilter: "all" | "matched" | "unmatched";
  onFilterChange: (filter: "all" | "matched" | "unmatched") => void;
  matchedCount: number;
  unmatchedCount: number;
  totalCount: number;
}

export function FilterTabs({
  activeFilter,
  onFilterChange,
  matchedCount,
  unmatchedCount,
  totalCount,
}: FilterTabsProps) {
  const tabs = [
    { key: "all" as const, label: "All", count: totalCount },
    { key: "matched" as const, label: "Matched", count: matchedCount },
    { key: "unmatched" as const, label: "Unmatched", count: unmatchedCount },
  ];

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
      {tabs.map((tab) => (
        <Button
          key={tab.key}
          variant={activeFilter === tab.key ? "default" : "ghost"}
          size="sm"
          onClick={() => onFilterChange(tab.key)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeFilter === tab.key
              ? "bg-white shadow-sm text-gray-900"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
          }`}
        >
          {tab.label}
          <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
            {tab.count}
          </span>
        </Button>
      ))}
    </div>
  );
}
