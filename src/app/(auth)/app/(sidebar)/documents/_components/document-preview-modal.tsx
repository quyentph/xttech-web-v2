'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Download,
  Printer,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { DocumentItem } from '@/types';
import { getFileUrl } from '@/utils/string';
import api from '@/utils/api';
import { formatBytes, getFileVisualInfo } from '../_utils/doc-helpers';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document: doc,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // DOCX rendering state
  const [isDocxLoading, setIsDocxLoading] = useState(false);
  const [docxError, setDocxError] = useState<string | null>(null);
  const docxContainerRef = useRef<HTMLDivElement>(null);

  const currentVersion = doc?.currentVersion;
  const fileName = currentVersion?.fileName || doc?.title || '';
  const downloadUrl =
    currentVersion?.downloadUrl ||
    (currentVersion?.filePath ? getFileUrl(currentVersion.filePath) : null);

  const visualInfo = doc ? getFileVisualInfo(fileName, currentVersion?.mimeType) : null;

  // File type checks
  const isImage = Boolean(
    currentVersion?.mimeType?.startsWith('image/') ||
    fileName.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i)
  );
  const isPdf = Boolean(
    currentVersion?.mimeType?.includes('pdf') ||
    fileName.match(/\.pdf$/i)
  );
  const isDocx = Boolean(
    currentVersion?.mimeType?.includes('word') ||
    fileName.match(/\.(docx|doc)$/i)
  );

  // Render Word/DOCX natively in browser
  useEffect(() => {
    if (!isOpen || !doc || !downloadUrl || !isDocx) {
      return;
    }

    let isMounted = true;
    setIsDocxLoading(true);
    setDocxError(null);

    const loadDocx = async () => {
      try {
        let buffer: ArrayBuffer;

        // Tải nội dung nhị phân có kèm Authorization Token
        try {
          const res = await api.get(downloadUrl, {
            responseType: 'arraybuffer',
          });
          buffer = res.data;
        } catch {
          const res = await fetch(downloadUrl);
          if (!res.ok) {
            throw new Error(`Máy chủ phản hồi lỗi: ${res.status} ${res.statusText}`);
          }
          buffer = await res.arrayBuffer();
        }

        if (!isMounted) return;

        if (!buffer || buffer.byteLength === 0) {
          throw new Error('Tệp tin Word rỗng hoặc không có dữ liệu');
        }

        // Kiểm tra magic bytes của file
        const bytes = new Uint8Array(buffer.slice(0, 4));
        const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b; // PK (DOCX là gói ZIP XML)
        const isOldDoc = bytes[0] === 0xd0 && bytes[1] === 0xcf; // OLE binary (.doc)

        if (isOldDoc) {
          if (isMounted) {
            setDocxError(
              'Tệp tin này sử dụng định dạng Word cũ (.doc). Vui lòng tải tệp về máy để xem trực tiếp.'
            );
          }
          return;
        }

        if (!isZip) {
          // Kiểm tra xem phản hồi có phải là chuỗi văn bản/JSON lỗi không
          try {
            const textDecoder = new TextDecoder('utf-8');
            const sampleText = textDecoder.decode(buffer.slice(0, 200));
            if (sampleText.includes('message') || sampleText.includes('error') || sampleText.includes('<html')) {
              throw new Error('Dữ liệu trả về không phải là tệp văn bản hợp lệ.');
            }
          } catch {}
        }

        // Dynamic import docx-preview
        const { renderAsync } = await import('docx-preview');

        if (docxContainerRef.current && isMounted) {
          docxContainerRef.current.innerHTML = '';
          await renderAsync(buffer, docxContainerRef.current, undefined, {
            inWrapper: false,
            ignoreWidth: false,
            ignoreHeight: false,
            breakPages: true,
            renderHeaders: true,
            renderFooters: true,
            renderFootnotes: true,
            renderEndnotes: true,
            useBase64URL: true,
            className: 'docx-document-viewer',
          });
        }
      } catch (err: any) {
        console.error('Lỗi khi hiển thị file docx:', err);
        if (isMounted) {
          setDocxError(
            err.message || 'Trình duyệt không thể đọc định dạng văn bản này trực tiếp.'
          );
        }
      } finally {
        if (isMounted) {
          setIsDocxLoading(false);
        }
      }
    };

    loadDocx();

    return () => {
      isMounted = false;
    };
  }, [isOpen, doc, downloadUrl, isDocx]);

  // Reset zoom & rotation when doc changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, doc]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !doc) return null;

  // Action handlers
  const handleDownload = () => {
    if (!downloadUrl) return;
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePrint = () => {
    if (!downloadUrl) return;
    if (isImage || isPdf) {
      const printWindow = window.open(downloadUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
        printWindow.print();
      }
    } else if (docxContainerRef.current) {
      window.print();
    } else {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 text-white backdrop-blur-sm select-none animate-in fade-in duration-150"
    >
      {/* 1. Header Toolbar kiểu Google Drive */}
      <div className="h-14 px-3 sm:px-4 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0 z-10 shadow-md">
        {/* Left: Nút quay lại + Icon + Tiêu đề tài liệu */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Đóng (ESC)"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="shrink-0 flex items-center justify-center">
            {visualInfo?.icon ? (
              React.cloneElement(visualInfo.icon as React.ReactElement<{ size?: number }>, { size: 20 })
            ) : (
              <FileText size={20} className="text-blue-400" />
            )}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-xs sm:text-sm font-semibold text-white truncate leading-tight" title={doc.title}>
              {doc.title}
            </h1>
            {doc.code && (
              <span className="hidden md:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0 border border-slate-700">
                {doc.code}
              </span>
            )}
            {currentVersion?.fileSize && (
              <span className="hidden lg:inline-block text-[11px] text-slate-400 shrink-0">
                • {formatBytes(currentVersion.fileSize)}
              </span>
            )}
          </div>
        </div>

        {/* Right: Các nút công cụ thao tác */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Zoom controls (Cho hình ảnh) */}
          {isImage && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 mr-1">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                title="Thu nhỏ"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-[11px] font-mono px-1 text-slate-300 min-w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                title="Phóng to"
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                onClick={handleRotate}
                className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer ml-0.5 border-l border-slate-700"
                title="Xoay 90°"
              >
                <RotateCw size={16} />
              </button>
            </div>
          )}

          {/* In tài liệu */}
          {downloadUrl && (
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="In tài liệu"
            >
              <Printer size={18} />
            </button>
          )}

          {/* Tải xuống */}
          {downloadUrl && (
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tải xuống tệp tin"
            >
              <Download size={18} />
            </button>
          )}

          {/* Mở tab mới */}
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Mở trong tab mới"
            >
              <ExternalLink size={18} />
            </a>
          )}

          {/* Đóng (Dấu X) */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            title="Đóng (ESC)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* 2. Main Viewer Area - Chiếm toàn bộ không gian còn lại */}
      <div className="flex-1 w-full h-[calc(100vh-56px)] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden relative">
        {!downloadUrl ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-md shadow-2xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Không có tệp xem trước</p>
              <p className="text-xs text-slate-400 mt-1">
                Tài liệu này chưa được đính kèm tệp tin hoặc đường dẫn tệp không tồn tại.
              </p>
            </div>
          </div>
        ) : isImage ? (
          <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
            <img
              src={downloadUrl}
              alt={doc.title}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-150"
            />
          </div>
        ) : isDocx ? (
          /* TRÌNH XEM DOCX NỘI BỘ (KHÔNG DÙNG MICROSOFT) */
          <div className="w-full h-full max-w-5xl bg-white rounded-xl overflow-y-auto p-4 sm:p-8 md:p-12 shadow-2xl border border-slate-800 text-slate-900 selection:bg-primary/20">
            {isDocxLoading && (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
                <Loader2 size={32} className="animate-spin text-primary" />
                <p className="text-xs font-medium">Đang tải và dựng văn bản Word...</p>
              </div>
            )}
            {docxError && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-600 text-center">
                <AlertCircle size={32} className="text-amber-500" />
                <p className="text-sm font-semibold text-slate-800">Không thể xem trực tiếp tệp Word</p>
                <p className="text-xs text-slate-500 max-w-sm">{docxError}</p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  <Download size={15} />
                  <span>Tải tệp về máy</span>
                </button>
              </div>
            )}
            <div
              ref={docxContainerRef}
              className={isDocxLoading || docxError ? 'hidden' : 'w-full docx-container text-slate-900'}
            />
          </div>
        ) : (
          /* TRÌNH XEM PDF HOẶC TỆP KHÁC */
          <div className="w-full h-full max-w-6xl flex items-center justify-center bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-800">
            <iframe
              src={downloadUrl}
              className="w-full h-full border-0 bg-white"
              title={`Preview of ${doc.title}`}
            />
          </div>
        )}
      </div>
    </div>
  );
};
