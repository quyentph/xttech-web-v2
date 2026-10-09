'use client';

import React from 'react';
import { Modal, Button } from '@/components';
import { FileText, Download } from 'lucide-react';
import type { DocumentItem } from '@/types';
import { getFileUrl } from '@/utils/string';
import { formatBytes } from '../_utils/doc-helpers';

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
  if (!doc) return null;

  const currentVersion = doc.currentVersion;
  const downloadUrl =
    currentVersion?.downloadUrl ||
    (currentVersion?.filePath ? getFileUrl(currentVersion.filePath) : null);

  const handleDownload = () => {
    if (!downloadUrl) return;
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  // Determine if it's an image
  const isImage = currentVersion?.mimeType?.startsWith('image/');
  
  // Use Google Docs Viewer for Word/Excel/Powerpoint. It might not work on localhost, 
  // but works on public domains.
  const isOfficeDoc = 
    currentVersion?.mimeType?.includes('word') || 
    currentVersion?.mimeType?.includes('excel') || 
    currentVersion?.mimeType?.includes('powerpoint') ||
    currentVersion?.fileName?.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/i);

  // Determine iframe source
  let iframeSrc = downloadUrl || '';
  if (isOfficeDoc && iframeSrc) {
    // Add ui=vi-VN&rs=vi-VN to force Vietnamese language on Microsoft Office Viewer
    iframeSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(iframeSrc)}&ui=vi-VN&rs=vi-VN&wdUILang=vi-VN`;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <FileText className="text-primary" size={20} />
          <span className="truncate">Xem trước: {doc.title}</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end w-full">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Đóng
            </Button>
            {downloadUrl && (
              <Button
                variant="outline"
                onClick={handleDownload}
                leftIcon={<Download size={15} />}
              >
                Tải tệp tin
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="w-full h-[70vh] bg-slate-100 flex flex-col items-center justify-center rounded-xl overflow-hidden">
        {!downloadUrl ? (
          <div className="text-slate-500 text-sm">Tài liệu này không có tệp đính kèm để xem trước.</div>
        ) : isImage ? (
          <img 
            src={downloadUrl} 
            alt={doc.title} 
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <iframe
            src={iframeSrc}
            className="w-full h-full border-0"
            title={`Preview of ${doc.title}`}
          />
        )}
      </div>
    </Modal>
  );
};
