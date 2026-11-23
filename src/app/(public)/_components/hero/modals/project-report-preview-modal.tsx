'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ProjectReportItem } from '../hero.constants';

interface ProjectReportPreviewModalProps {
  previewImage: ProjectReportItem | null;
  reports: ProjectReportItem[];
  isZoomed: boolean;
  onToggleZoom: () => void;
  onSelectReport: (item: ProjectReportItem) => void;
  onStep: (direction: -1 | 1) => void;
  onClose: () => void;
}

export function ProjectReportPreviewModal({
  previewImage,
  reports,
  isZoomed,
  onToggleZoom,
  onSelectReport,
  onStep,
  onClose,
}: ProjectReportPreviewModalProps) {
  useEffect(() => {
    if (!previewImage) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onStep(-1);
      } else if (e.key === 'ArrowRight') {
        onStep(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewImage, onStep, onClose]);

  if (!previewImage || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-100 flex items-center justify-center overscroll-contain bg-slate-950/85 p-2 sm:p-3 lg:p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative flex w-full max-w-[96vw] xl:max-w-[1560px] 2xl:max-w-[1680px] items-center justify-center">
        {/* Khung Modal chính: Dạng Flex 2 khối (Ảnh 1 flex-1 tự dãn rộng hết cỡ + Ảnh 2 Sidebar cố định gọn gàng), chiều cao gọn gàng giúp triệt tiêu padding trên dưới thừa */}
        <div className="relative flex flex-col lg:flex-row w-full h-[94vh] lg:h-[72vh] lg:max-h-[660px] lg:min-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {/* Header trên Mobile */}
          <div className="flex lg:hidden items-center justify-between border-b border-slate-100 bg-white px-3.5 py-2.5 shrink-0 z-20">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-xs font-black text-primary shrink-0">
                {previewImage.number} / 0{reports.length}
              </span>
              <span className="text-xs font-bold text-slate-800 truncate">
                {previewImage.title}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng xem ảnh"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* KHỐI Ở ẢNH 1: Hiển thị hình ảnh báo cáo (flex-1 dãn tối đa, padding trên dưới cực nhỏ sát mép) */}
          <div className="flex-1 min-w-0 flex flex-col bg-slate-100/50 shrink-0 h-[220px] xs:h-[260px] sm:h-[320px] lg:h-full relative items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200">
            {/* Nút lùi lại trên Desktop (nổi bên trái khung ảnh) */}
            <button
              type="button"
              onClick={() => onStep(-1)}
              aria-label="Màn hình trước"
              className="hidden lg:flex absolute left-3.5 top-1/2 -translate-y-1/2 z-20 h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 text-slate-800 shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:border-primary hover:bg-primary hover:text-white cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Khung chứa ảnh: padding trên dưới cực nhỏ lg:p-1.5 giúp ảnh ôm sát viền không còn khoảng trống thừa */}
            <div className="relative w-full h-full flex items-center justify-center p-1 sm:p-1.5 lg:p-1.5 overflow-hidden">
              <img
                src={previewImage.imageSrc}
                alt={previewImage.title}
                onClick={onToggleZoom}
                className={`transition-transform duration-300 cursor-zoom-in rounded-sm ${
                  isZoomed ? 'scale-125 sm:scale-135 origin-center cursor-zoom-out' : 'max-h-full max-w-full w-auto h-auto object-contain'
                }`}
              />
            </div>

            {/* Nút tiến tới trên Desktop (nổi bên phải khung ảnh) */}
            <button
              type="button"
              onClick={() => onStep(1)}
              aria-label="Màn hình tiếp theo"
              className="hidden lg:flex absolute right-3.5 top-1/2 -translate-y-1/2 z-20 h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 text-slate-800 shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:border-primary hover:bg-primary hover:text-white cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* KHỐI Ở ẢNH 2: Cột nội dung chi tiết & danh sách chọn nhanh bên phải (flex gọn gàng, cố định chiều rộng) */}
          <div className="w-full lg:w-[350px] xl:w-[380px] shrink-0 flex-1 lg:h-full overflow-y-auto overscroll-contain bg-white p-4 sm:p-5 text-slate-900 flex flex-col justify-start [scrollbar-width:thin]">
            <div className="space-y-3.5">
              {/* Header chi tiết trên Desktop */}
              <div className="hidden lg:flex items-center justify-between gap-2 pb-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 font-mono text-xs font-black text-primary">
                    {previewImage.number} / 0{reports.length}
                  </span>
                  <span className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                    {previewImage.category}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng xem ảnh"
                  className="h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer flex"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Tag phân hệ trên Mobile */}
              <div className="flex lg:hidden items-center gap-2">
                <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                  {previewImage.category}
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-black leading-snug text-slate-900">{previewImage.title}</h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600">{previewImage.description}</p>
              </div>

              {/* Điều hướng Trước / Tiếp trên Mobile */}
              <div className="flex lg:hidden items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => onStep(-1)}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Trước</span>
                </button>
                <button
                  type="button"
                  onClick={() => onStep(1)}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <span>Tiếp</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Chuyển nhanh giữa các màn hình */}
              <div className="pt-3 space-y-2 border-t border-slate-100">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Chuyển nhanh màn hình ({reports.length})
                </span>
                <div className="space-y-1.5">
                  {reports.map((rpt) => {
                    const isSelected = rpt.id === previewImage.id;
                    return (
                      <button
                        key={rpt.id}
                        type="button"
                        onClick={() => onSelectReport(rpt)}
                        className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs sm:text-[13px] transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white font-bold shadow-xs'
                            : 'border border-slate-200/80 bg-slate-50/70 text-slate-700 hover:border-primary/40 hover:bg-primary/5 hover:text-primary'
                        }`}
                      >
                        <span className={`font-mono text-xs font-black shrink-0 ${isSelected ? 'text-white/90' : 'text-primary'}`}>
                          {rpt.number}
                        </span>
                        <span className="leading-snug">{rpt.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
