'use client';

import React, { useState } from 'react';
import { Modal, Button } from '@/components';
import { Download, FileText, Clock, User, Calendar, Folder, CheckCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { DocumentItem } from '@/types';
import {
  DOCUMENT_TYPE_MAP,
  DOCUMENT_STATUS_MAP,
  APPROVAL_STATUS_MAP,
  SHARE_SCOPE_MAP,
} from '@/types';
import { formatBytes, getFileVisualInfo } from '../_utils/doc-helpers';
import { getFileUrl } from '@/utils/string';
import dayjs from 'dayjs';
import { reviewDocument } from '@/actions/document';
import { useAuthStore } from '@/stores';
import { usePermission } from '@/hooks/user-permission';
import toast from 'react-hot-toast';

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  onSuccess?: () => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  onSuccess,
}) => {
  const [reviewLoading, setReviewLoading] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const { hasRole, isAdmin, isHR, isSuper } = usePermission();

  if (!doc) return null;

  // Chỉ role admin, hr, super/supper admin hoặc đúng người được chỉ định duyệt mới có quyền phê duyệt
  const canApprove =
    isAdmin ||
    isHR ||
    isSuper ||
    hasRole(['admin', 'hr', 'super', 'supper', 'super_admin', 'supper_admin']) ||
    (Boolean(currentUser?.id) && String(doc.approverId) === String(currentUser?.id));

  const isPendingApproval = doc.approvalStatus === 'pending' || doc.approvalStatus === 'submitted';

  const handleReview = async (status: 'approved' | 'rejected') => {
    try {
      setReviewLoading(true);
      await reviewDocument(doc.id, { approvalStatus: status });
      toast.success(status === 'approved' ? 'Phê duyệt tài liệu thành công!' : 'Đã từ chối tài liệu');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Không thể thực hiện phê duyệt');
    } finally {
      setReviewLoading(false);
    }
  };

  const currentVersion = doc.currentVersion;
  const fileName = currentVersion?.fileName || doc.title;
  const visualInfo = getFileVisualInfo(fileName, currentVersion?.mimeType);

  const docTypeInfo = DOCUMENT_TYPE_MAP[doc.documentType] || {
    label: doc.documentType || 'Văn bản',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  const statusInfo = DOCUMENT_STATUS_MAP[doc.status] || {
    label: doc.status || 'Bản nháp',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const approvalInfo = APPROVAL_STATUS_MAP[doc.approvalStatus] || {
    label: doc.approvalStatus || 'Soạn thảo',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const downloadUrl =
    currentVersion?.downloadUrl ||
    (currentVersion?.filePath ? getFileUrl(currentVersion.filePath) : null);

  const handleDownload = () => {
    if (!downloadUrl) return;
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <FileText className="text-primary" size={20} />
          <span className="truncate">Chi tiết văn bản / tài liệu</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-600">
            {currentVersion?.fileSize ? `Dung lượng: ${formatBytes(currentVersion.fileSize)}` : ''}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} disabled={reviewLoading}>
              Đóng
            </Button>
            {downloadUrl && (
              <Button
                variant="outline"
                onClick={handleDownload}
                leftIcon={<Download size={15} />}
                disabled={reviewLoading}
              >
                Tải tệp tin
              </Button>
            )}
            {canApprove && isPendingApproval && (
              <>
                <Button
                  variant="danger"
                  onClick={() => handleReview('rejected')}
                  loading={reviewLoading}
                  disabled={reviewLoading}
                  size="sm"
                >
                  Từ chối
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleReview('approved')}
                  loading={reviewLoading}
                  disabled={reviewLoading}
                  size="sm"
                >
                  Phê duyệt
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Header file banner */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div className={`p-3 rounded-xl border shrink-0 ${visualInfo.bgColor}`}>
            {visualInfo.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                {doc.code}
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${docTypeInfo.badgeClass}`}>
                {docTypeInfo.label}
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusInfo.badgeClass}`}>
                {statusInfo.label}
              </span>
              {currentVersion?.versionNumber && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  v{currentVersion.versionNumber}
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900 leading-snug">
              {doc.title}
            </h3>
            {fileName && fileName !== doc.title && (
              <p className="text-[11px] text-slate-600 mt-0.5">Tệp: {fileName}</p>
            )}
          </div>
        </div>

        {/* Trích yếu nội dung */}
        {doc.summary && (
          <div className="space-y-1">
            <span className="font-semibold text-slate-700">Trích yếu nội dung:</span>
            <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
              {doc.summary}
            </p>
          </div>
        )}

        {/* Thông tin hành chính & phê duyệt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-600">
              <Folder size={14} className="text-slate-500 shrink-0" />
              <span>Thư mục:</span>
              <span className="font-semibold text-slate-800">
                {doc.category?.name || 'Thư mục gốc'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <User size={14} className="text-slate-500 shrink-0" />
              <span>Người tạo:</span>
              <span className="font-semibold text-slate-800">
                {doc.createdBy?.fullName || 'CBNV'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <Clock size={14} className="text-slate-500 shrink-0" />
              <span>Ngày tạo:</span>
              <span className="font-semibold text-slate-800">
                {dayjs(doc.createdAt).format('HH:mm - DD/MM/YYYY')}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck size={14} className="text-slate-500 shrink-0" />
              <span>Trạng thái duyệt:</span>
              <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${approvalInfo.badgeClass}`}>
                {approvalInfo.label}
              </span>
            </div>

            {doc.approver && (
              <div className="flex items-center gap-2 text-slate-600">
                <User size={14} className="text-slate-500 shrink-0" />
                <span>Người duyệt:</span>
                <span className="font-semibold text-slate-800">
                  {doc.approver.fullName}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-slate-600">
              <Calendar size={14} className="text-slate-500 shrink-0" />
              <span>Phạm vi chia sẻ:</span>
              <span className="font-semibold text-slate-800">
                {SHARE_SCOPE_MAP[doc.shareScope] || doc.shareScope || 'Cá nhân'}
              </span>
            </div>
          </div>
        </div>

        {/* Hiệu lực nếu có */}
        {(doc.effectiveDate || doc.expirationDate) && (
          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
            {doc.effectiveDate && (
              <div>
                <span>Hiệu lực từ: </span>
                <span className="font-semibold text-slate-800">
                  {dayjs(doc.effectiveDate).format('DD/MM/YYYY')}
                </span>
              </div>
            )}
            {doc.expirationDate && (
              <div>
                <span>Hết hạn: </span>
                <span className="font-semibold text-slate-800">
                  {dayjs(doc.expirationDate).format('DD/MM/YYYY')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Lịch sử phiên bản nếu có */}
        {doc.versions && doc.versions.length > 1 && (
          <div className="space-y-2 pt-2">
            <h4 className="font-semibold text-slate-800 text-xs">Lịch sử các phiên bản</h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {doc.versions.map((ver) => (
                <div key={ver.id} className="p-2.5 flex items-center justify-between bg-white text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold font-mono text-primary">v{ver.versionNumber}</span>
                    <span className="text-slate-700 truncate max-w-[200px]">{ver.fileName}</span>
                    {ver.isCurrent && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                        Hiện hành
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span>{formatBytes(ver.fileSize)}</span>
                    <span>{dayjs(ver.createdAt).format('DD/MM/YYYY')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
