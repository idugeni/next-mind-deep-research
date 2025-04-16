import React, { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import ReportTabContent from "./report-tab-content";

// TabItem tidak perlu properti icon, hanya value dan label
interface TabItem {
  value: string;
  label: string;
}

interface ReportTabsProps {
  tabList: TabItem[];
  tabIcons: { [key: string]: React.ElementType };
  report: Record<string, string | string[] | null | undefined>;
  t: Record<string, string>;
}

export default function ReportTabs({ tabList, tabIcons, report, t }: ReportTabsProps) {
  const [activeTab, setActiveTab] = useState("full");
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList
        className="w-full flex gap-0 justify-between overflow-x-auto scroll-smooth scroll-px-4 snap-x scrollbar-hide bg-muted border border-border rounded-full shadow-md p-1 h-[48px] min-h-[48px] transition-colors duration-300"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabList.map((tab) => {
          const Icon = tabIcons[tab.value] || tabIcons["full"];
          const isActive = tab.value === activeTab;
          return (
            <Tooltip key={tab.value}>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value={tab.value}
                  className={cn(
                    "flex-1 min-w-0 h-full flex items-center justify-center rounded-full px-0 py-0 text-base font-medium whitespace-nowrap transition-all duration-300 ease-in-out border shadow-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow"
                      : "bg-muted text-muted-foreground border-transparent"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "stroke-primary-foreground" : "stroke-muted-foreground")} />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">{tab.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </TabsList>
      {/* Tabs Content */}
      <ReportTabContent
        tabList={tabList}
        report={report}
        t={t}
        activeTab={activeTab}
      />
    </Tabs>
  );
}
