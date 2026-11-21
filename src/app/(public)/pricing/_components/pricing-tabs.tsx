'use client';

import React, { useState } from 'react';
import { Layers, HardHat, Briefcase } from 'lucide-react';
import AluminumPricingSection from './aluminum-pricing';
import BuiderSpicing from './builder-pricing';
import BusinessPricing from './business-pricing';

const TABS = [
  {
    id: 'aluminum',
    label: 'Xưởng Nhôm & Nội Thất',
    shortLabel: 'Nhôm & Nội Thất',
    icon: Layers,
    component: AluminumPricingSection,
  },
  {
    id: 'builder',
    label: 'Xây dựng & Đội thợ',
    shortLabel: 'Xây dựng',
    icon: HardHat,
    component: BuiderSpicing,
  },
  {
    id: 'business',
    label: 'HCNS, Kế Toán, Kinh doanh',
    shortLabel: 'HCNS & KD',
    icon: Briefcase,
    component: BusinessPricing,
  },
];

const PricingTabs = () => {
  const [activeTab, setActiveTab] = useState('aluminum');

  const ActiveComponent = TABS.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="w-full">
      {/* Tab Buttons – cùng padding + max-width với các section pricing để thẳng lề */}
      <div className="w-full bg-white px-4 pb-2 pt-6 sm:px-8 lg:px-16 xl:px-24">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-2.5 overflow-x-auto pb-2 pt-1 sm:pb-0 sm:pt-0 sm:flex-wrap sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={(e) => {
                  setActiveTab(tab.id);
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className={`
                  flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all duration-200 sm:px-5 sm:py-2.5 sm:text-sm
                  ${
                    isActive
                      ? 'scale-[1.02] bg-primary text-white shadow-md'
                      : 'bg-primary/5 text-gray-600 hover:bg-primary/10 hover:text-primary'
                  }
                `}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Pricing Section */}
      <div className="transition-all duration-300">{ActiveComponent && <ActiveComponent />}</div>
    </div>
  );
};

export default PricingTabs;