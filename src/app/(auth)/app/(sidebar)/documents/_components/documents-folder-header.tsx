import React from 'react';
import { ArrowLeft, Folder, FolderOpen, CheckSquare, Square } from 'lucide-react';
import type { DocumentCategory } from '@/types';

interface DocumentsFolderHeaderProps {
  currentFolderId: number | null;
  currentFolder: DocumentCategory | null;
  parentFolder: DocumentCategory | null;
  tab: string | null;
  subFoldersCount: number;
  documentsCount: number;
  onGoBack: () => void;
  totalItemsCount?: number;
  isAllSelected?: boolean;
  onToggleSelectAll?: () => void;
}

export const DocumentsFolderHeader: React.FC<DocumentsFolderHeaderProps> = ({
  currentFolderId,
  currentFolder,
  parentFolder,
  tab,
  subFoldersCount,
  documentsCount,
  onGoBack,
  totalItemsCount = 0,
  isAllSelected = false,
  onToggleSelectAll,
}) => {
  return (
    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
      <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Nút Quay lại 1 cấp (mobile chỉ hiện icon, sm trở lên hiện thêm chữ) */}
        {currentFolderId !== null && (
          <button
            type="button"
            onClick={onGoBack}
            className="h-8 w-8 sm:w-auto px-0 sm:px-2.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 cursor-pointer shadow-2xs shrink-0 inline-flex items-center justify-center gap-1.5 whitespace-nowrap select-none"
            title={
              parentFolder
                ? `Quay lại ${parentFolder.name}`
                : tab === 'shared'
                ? 'Quay lại Được chia sẻ với tôi'
                : 'Quay lại Tài liệu của tôi'
            }
          >
            <ArrowLeft size={16} className="shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap leading-none">Quay lại</span>
          </button>
        )}

        {/* Thông tin thư mục hiện tại */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {currentFolderId !== null ? <FolderOpen size={18} /> : <Folder size={18} />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 truncate leading-tight max-w-[180px] xs:max-w-xs sm:max-w-md md:max-w-xl">
                {currentFolder
                  ? currentFolder.name
                  : tab === 'shared'
                  ? 'Được chia sẻ với tôi'
                  : tab === 'trash'
                  ? 'Thùng rác'
                  : 'Tài liệu của tôi'}
              </h2>
            </div>
          </div>
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
            disabled={totalItemsCount === 0}
            onClick={(e) => {
              e.stopPropagation();
              if (totalItemsCount > 0) {
                onToggleSelectAll();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-2xs border shrink-0 ${
              totalItemsCount === 0
                ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                : isAllSelected
                ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/15 cursor-pointer'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
            }`}
            title={
              totalItemsCount === 0
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
