'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

interface TrashHeaderProps {
  totalItems?: number;
  isLoading?: boolean;
}

export const TrashHeader: React.FC<TrashHeaderProps> = ({
  totalItems,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col gap-3 pb-3 border-b border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Title & Description */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 shadow-2xs">
            <Trash2 size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                Thùng rác
              </h1>
              {!isLoading && typeof totalItems === 'number' && totalItems > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200/60">
                    {totalItems} mục
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý các tài liệu và thư mục đã xóa trong hệ thống
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
