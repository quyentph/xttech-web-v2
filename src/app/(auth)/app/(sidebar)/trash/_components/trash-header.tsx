'use client';

import React from 'react';
import { Trash2, CheckSquare, Square } from 'lucide-react';

interface TrashHeaderProps {
  folderCount?: number;
  docCount?: number;
  isLoading?: boolean;
  totalCount?: number;
  isAllSelected?: boolean;
  onToggleSelectAll?: () => void;
}

export const TrashHeader: React.FC<TrashHeaderProps> = ({
  folderCount = 0,
  docCount = 0,
  isLoading = false,
  totalCount = 0,
  isAllSelected = false,
  onToggleSelectAll,
}) => {
  return (
    <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
          <Trash2 size={16} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm md:text-base font-bold text-slate-800 tracking-tight leading-tight">
            Thùng rác
          </h2>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">
            {!isLoading && `${folderCount} thư mục • ${docCount} tài liệu`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 select-none">
          <span>Giữ</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] font-semibold text-slate-600 shadow-2xs">
            Ctrl
          </kbd>
          <span>để chọn nhiều</span>
        </span>

        {onToggleSelectAll && (
          <button
            type="button"
            disabled={totalCount === 0}
            onClick={(e) => {
              e.stopPropagation();
              if (totalCount > 0) {
                onToggleSelectAll();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-2xs border ${
              totalCount === 0
                ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                : isAllSelected
                ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/15 cursor-pointer'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
            }`}
            title={
              totalCount === 0
                ? 'Không có mục nào để chọn'
                : isAllSelected
                ? 'Bỏ chọn tất cả (Esc)'
                : 'Chọn tất cả (Ctrl + A)'
            }
          >
            {isAllSelected ? (
              <CheckSquare size={14} className="text-primary" />
            ) : (
              <Square size={14} className="text-slate-400" />
            )}
            <span>{isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
