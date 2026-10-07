'use client';

import React from 'react';
import { ChevronRight, Home, ChevronLeft, Folder } from 'lucide-react';
import type { DocumentCategory } from '@/types';

interface BreadcrumbBarProps {
  breadcrumbs: DocumentCategory[];
  onNavigate: (folderId: number | null) => void;
  onGoBack: () => void;
}

export const BreadcrumbBar: React.FC<BreadcrumbBarProps> = ({
  breadcrumbs,
  onNavigate,
  onGoBack,
}) => {
  const isSubFolder = breadcrumbs.length > 0;

  return (
    <div className="flex items-center gap-1.5 text-sm select-none overflow-x-auto scrollbar-none py-0.5">
      {/* Nút Quay lại 1 cấp khi đang trong thư mục con */}
      {isSubFolder && (
        <button
          type="button"
          onClick={onGoBack}
          className="h-9 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 transition-all shrink-0 flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow-2xs active:scale-95"
          title="Quay lại thư mục trước"
        >
          <ChevronLeft size={15} />
          <span className="hidden sm:inline">Quay lại</span>
        </button>
      )}

      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {/* Thư mục gốc: Tài liệu của tôi */}
        <button
          type="button"
          onClick={() => onNavigate(null)}
          className={`h-9 px-3 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            breadcrumbs.length === 0
              ? 'bg-primary/10 text-primary font-semibold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Home size={14} className={breadcrumbs.length === 0 ? 'text-primary' : 'text-slate-500'} />
          <span>Tài liệu của tôi</span>
        </button>

        {/* Cây thư mục con */}
        {breadcrumbs.map((folder, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <React.Fragment key={folder.id}>
              <ChevronRight size={14} className="text-slate-300 shrink-0" />
              <button
                type="button"
                onClick={() => onNavigate(folder.id)}
                className={`h-9 px-3 rounded-xl text-xs font-medium transition-all max-w-[200px] truncate shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isLast
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={folder.name}
              >
                <Folder size={14} className={isLast ? 'text-primary fill-primary/20' : 'text-slate-500'} />
                <span className="truncate">{folder.name}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
