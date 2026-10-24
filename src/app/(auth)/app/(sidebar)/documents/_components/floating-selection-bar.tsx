'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import type { ClipboardState } from '../_hooks/use-document-clipboard';

interface FloatingSelectionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  clipboard?: ClipboardState | null;
  onClearClipboard?: () => void;
  onDeleteSelected?: () => void;
}

export const FloatingSelectionBar: React.FC<FloatingSelectionBarProps> = ({
  selectedCount,
  onClearSelection,
  clipboard,
  onClearClipboard,
  onDeleteSelected,
}) => {
  const isCutting = clipboard?.action === 'cut' && clipboard.items.length > 0;
  const isCopying = clipboard?.action === 'copy' && clipboard.items.length > 0;

  if (selectedCount === 0 && !isCutting && !isCopying) return null;

  if (isCutting || isCopying) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border border-primary/50 animate-in fade-in slide-in-from-bottom-3 duration-150 text-xs">
        <span className="font-medium flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isCutting ? 'bg-amber-400' : 'bg-emerald-400'
            } animate-pulse`}
          />
          {isCutting ? 'Đang cắt' : 'Đang sao chép'} <strong>{clipboard?.items.length}</strong> mục
        </span>
        <div className="h-3 w-px bg-slate-700" />
        <span className="text-slate-300 text-[11px]">
          Mở thư mục đích rồi bấm{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 font-mono text-[10px] text-white">
            Ctrl + V
          </kbd>
        </span>
        <div className="h-3 w-px bg-slate-700" />
        <button
          type="button"
          onClick={onClearClipboard}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
        >
          Hủy (Esc)
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700/80 animate-in fade-in slide-in-from-bottom-3 duration-150 text-xs">
      <span className="font-medium flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        Đã chọn <strong>{selectedCount}</strong> mục
      </span>
      <div className="h-3 w-px bg-slate-700 hidden sm:block" />
      <span className="text-slate-300 text-[11px] hidden sm:inline">
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 font-mono text-[10px] text-white">
          Ctrl + C
        </kbd>{' '}
        sao chép &bull;{' '}
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 font-mono text-[10px] text-white">
          Ctrl + X
        </kbd>{' '}
        cắt
      </span>
      {onDeleteSelected && (
        <>
          <div className="h-3 w-px bg-slate-700" />
          <button
            type="button"
            onClick={onDeleteSelected}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-all cursor-pointer shadow-xs hover:shadow active:scale-95"
            title="Xóa các mục đã chọn (Delete)"
          >
            <Trash2 size={13} />
            <span>Xóa ({selectedCount})</span>
          </button>
        </>
      )}
      <div className="h-3 w-px bg-slate-700" />
      <button
        type="button"
        onClick={onClearSelection}
        className="text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
      >
        Bỏ chọn (Esc)
      </button>
    </div>
  );
};
