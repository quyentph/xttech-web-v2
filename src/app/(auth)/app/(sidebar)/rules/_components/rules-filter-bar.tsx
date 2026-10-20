'use client';

import React, { useMemo } from 'react';
import { Select } from '@/components';
import { cn } from '@/utils';
import { DOCUMENT_TYPE_MAP, RULES_SCOPE_LABEL_MAP, RULE_FILTER_TYPES } from '@/types';
import { CURRENT_SCOPE_CHIPS, CURRENT_STATUS_OPTIONS, type CurrentScopeChip, type RulesTab } from '../_utils/rules-constants';

import { RotateCcw } from 'lucide-react';

interface RulesFilterBarProps {
  tab: RulesTab;
  chip: CurrentScopeChip;
  documentType: string;
  status: string;
  isUnreadOnly: boolean;
  isExpiringOnly: boolean;
  expiringSoonCount: number;
  onChipChange: (chip: CurrentScopeChip) => void;
  onDocumentTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onUnreadOnlyChange: (isOn: boolean) => void;
  onExpiringOnlyChange: (isOn: boolean) => void;
  onResetFilters?: () => void;
}

const TOGGLE_BASE =
  'px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer select-none transition-all whitespace-nowrap shrink-0';
const TOGGLE_ON = 'bg-primary text-white border-primary shadow-xs font-semibold';
const TOGGLE_OFF = 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800';

export const RulesFilterBar: React.FC<RulesFilterBarProps> = (props) => {
  const { tab, chip, documentType, status, isUnreadOnly, isExpiringOnly, expiringSoonCount, onResetFilters } = props;
  const isCurrentTab = tab === 'current';

  const typeOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả loại' },
      ...RULE_FILTER_TYPES.map((key) => ({ value: key, label: DOCUMENT_TYPE_MAP[key].label })),
    ],
    [],
  );

  const hasExtraFilters = Boolean(
    documentType || (isCurrentTab && (status || isUnreadOnly || isExpiringOnly || chip !== 'all'))
  );

  return (
    <div className="flex flex-col gap-2.5 px-4 py-2.5 border-b border-slate-100 sm:border-b-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:py-3">
      {/* Scope Chips & Quick Toggles: Swipeable on mobile */}
      {isCurrentTab && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible shrink-0">
          {CURRENT_SCOPE_CHIPS.map((key) => (
            <button
              key={key}
              id={`rules-chip-${key}`}
              type="button"
              onClick={() => props.onChipChange(key)}
              className={cn(TOGGLE_BASE, chip === key ? TOGGLE_ON : TOGGLE_OFF)}
            >
              {RULES_SCOPE_LABEL_MAP[key]}
            </button>
          ))}

          <span className="w-px h-4 bg-slate-200 shrink-0 mx-1" />

          {/* Quick toggle chips right in the scrollable row on mobile */}
          <button
            id="rules-filter-unread"
            type="button"
            onClick={() => props.onUnreadOnlyChange(!isUnreadOnly)}
            className={cn(TOGGLE_BASE, isUnreadOnly ? TOGGLE_ON : TOGGLE_OFF)}
          >
            Chưa đọc
          </button>
          <button
            id="rules-filter-expiring"
            type="button"
            onClick={() => props.onExpiringOnlyChange(!isExpiringOnly)}
            className={cn(
              TOGGLE_BASE,
              isExpiringOnly
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs font-semibold'
                : TOGGLE_OFF
            )}
          >
            Sắp hết hiệu lực{expiringSoonCount > 0 ? ` (${expiringSoonCount})` : ''}
          </button>

          {hasExtraFilters && onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              title="Đặt lại bộ lọc"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-dashed border-slate-300 transition-colors shrink-0"
            >
              <RotateCcw size={12} />
              <span>Xóa lọc</span>
            </button>
          )}
        </div>
      )}

      {/* Select Dropdowns: Balanced 2-column grid on mobile, inline on desktop */}
      <div
        className={cn(
          'w-full sm:w-auto',
          isCurrentTab ? 'grid grid-cols-2 gap-2 sm:flex sm:items-center' : 'w-full sm:w-48'
        )}
      >
        <div className="w-full sm:w-44">
          <Select
            fullWidth
            value={documentType}
            onChange={(e) => props.onDocumentTypeChange(e.target.value)}
            options={typeOptions}
            className="!h-9 !text-xs !pr-8 bg-slate-50/60 focus:bg-white"
          />
        </div>

        {isCurrentTab && (
          <div className="w-full sm:w-40">
            <Select
              fullWidth
              value={status}
              onChange={(e) => props.onStatusChange(e.target.value)}
              options={CURRENT_STATUS_OPTIONS}
              className="!h-9 !text-xs !pr-8 bg-slate-50/60 focus:bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};
