'use client';

import React from 'react';
import { Modal, Avatar, Tag, Tooltip } from 'antd';
import {
  FileText,
  Calendar,
  User,
  File,
  Globe,
  Lock,
  Users,
  Building,
  Info,
  Download,
} from 'lucide-react';
import type { Document } from '@/types/document';

interface DocumentDetailModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '---';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatDateTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return '---';
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatFileSize = (bytes: number) => {
  if (!bytes) return '---';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const documentTypeMap: Record<string, { label: string; color: string }> = {
  regulation: { label: 'Quy định', color: 'blue' },
  announcement: { label: 'Thông báo', color: 'orange' },
  form: { label: 'Biểu mẫu', color: 'green' },
  work_report: { label: 'Báo cáo công việc', color: 'purple' },
};

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: 'Bản nháp', color: 'default' },
  pending: { label: 'Chờ duyệt', color: 'processing' },
  published: { label: 'Đã ban hành', color: 'success' },
  archived: { label: 'Lưu trữ', color: 'warning' },
};

const approvalStatusMap: Record<string, { label: string; color: string }> = {
  draft: { label: 'Bản nháp', color: 'default' },
  pending: { label: 'Chờ phê duyệt', color: 'processing' },
  approved: { label: 'Đã phê duyệt', color: 'success' },
  rejected: { label: 'Bị từ chối', color: 'error' },
};

const shareScopeMap: Record<string, { label: string; icon: React.ReactNode }> = {
  private: { label: 'Cá nhân', icon: <Lock size={13} /> },
  department: { label: 'Phòng ban', icon: <Building size={13} /> },
  internal: { label: 'Nội bộ', icon: <Users size={13} /> },
  all: { label: 'Toàn công ty', icon: <Globe size={13} /> },
};

const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
    <span className="text-primary">{icon}</span>
    <h3 className="font-semibold text-slate-700 text-sm">{title}</h3>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] text-slate-400 uppercase tracking-wide">{label}</span>
    <span className="text-sm text-slate-800">{value}</span>
  </div>
);

const UserCard = ({
  user,
  role,
}: {
  user: { fullName: string; username: string; email: string; avatar: string | null } | null;
  role: string;
}) => {
  if (!user)
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm italic p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200">
        <User size={14} />
        <span>Chưa chỉ định</span>
      </div>
    );

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
      <Avatar
        src={user.avatar ? `${BASE_URL}${user.avatar}` : undefined}
        size={36}
        className="shrink-0 bg-primary/10 text-primary font-semibold"
      >
        {user.fullName?.[0]?.toUpperCase()}
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{user.fullName}</p>
        <p className="text-xs text-slate-500 truncate">@{user.username}</p>
        <p className="text-xs text-slate-400 truncate">{user.email}</p>
      </div>
      <Tag color="blue" className="shrink-0 text-[10px]">
        {role}
      </Tag>
    </div>
  );
};

const DocumentDetailModal = ({ document, isOpen, onClose }: DocumentDetailModalProps) => {
  if (!document) return null;

  const docType = documentTypeMap[document.documentType] || { label: document.documentType, color: 'default' };
  const statusInfo = statusMap[document.status] || { label: document.status, color: 'default' };
  const approvalInfo = approvalStatusMap[document.approvalStatus] || { label: document.approvalStatus, color: 'default' };
  const scopeInfo = shareScopeMap[document.shareScope] || { label: document.shareScope, icon: null };
  const version = document.currentVersion;

  const isImage = version?.mimeType?.startsWith('image/');
  const fileUrl = version?.filePath ? `${BASE_URL}${version.filePath}` : null;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={720}
      title={
        <div className="flex items-center gap-2 pr-4">
          <FileText size={18} className="text-primary" />
          <span className="font-bold text-slate-800 text-base truncate">{document.title}</span>
        </div>
      }
      styles={{ 
        body: { padding: '16px 24px 24px', maxHeight: '75vh', overflowY: 'auto' },
        header: { borderBottom: '1px solid #f1f5f9', paddingBottom: 12 },
      }}
    >
      {/* Preview ảnh nếu file là hình ảnh */}
      {isImage && fileUrl && (
        <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center max-h-60">
          <img
            src={fileUrl}
            alt={version?.fileName}
            className="max-h-60 object-contain"
          />
        </div>
      )}

      {/* Thông tin cơ bản */}
      <div className="mb-5">
        <SectionTitle icon={<Info size={14} />} title="Thông tin tài liệu" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <InfoRow
            label="Mã văn bản"
            value={<code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">{document.code || '---'}</code>}
          />
          <InfoRow
            label="Loại tài liệu"
            value={<Tag color={docType.color}>{docType.label}</Tag>}
          />
          <InfoRow
            label="Trạng thái"
            value={<Tag color={statusInfo.color}>{statusInfo.label}</Tag>}
          />
          <InfoRow
            label="Trạng thái duyệt"
            value={<Tag color={approvalInfo.color}>{approvalInfo.label}</Tag>}
          />
          <InfoRow
            label="Phạm vi chia sẻ"
            value={
              <span className="flex items-center gap-1 text-slate-700 text-sm">
                {scopeInfo.icon}
                {scopeInfo.label}
              </span>
            }
          />
          <InfoRow
            label="Danh mục"
            value={document.categoryName || <span className="text-slate-400 italic text-sm">Không có</span>}
          />
          <InfoRow
            label="Phòng ban ban hành"
            value={document.issuingDepartmentName || <span className="text-slate-400 italic text-sm">---</span>}
          />
          {document.approvalNote && (
            <div className="col-span-2">
              <InfoRow
                label="Ghi chú duyệt"
                value={
                  <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded text-xs">
                    {document.approvalNote}
                  </span>
                }
              />
            </div>
          )}
        </div>

        {document.summary && (
          <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-500 mb-1 uppercase tracking-wide">Tóm tắt nội dung</p>
            <p className="text-sm text-slate-700">{document.summary}</p>
          </div>
        )}
      </div>

      {/* Thời gian */}
      <div className="mb-5">
        <SectionTitle icon={<Calendar size={14} />} title="Thời gian" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <InfoRow label="Ngày hiệu lực" value={formatDate(document.effectiveDate)} />
          <InfoRow label="Ngày hết hạn" value={formatDate(document.expirationDate)} />
          <InfoRow label="Ngày phê duyệt" value={formatDateTime(document.approvedAt)} />
          <InfoRow label="Ngày tạo" value={formatDateTime(document.createdAt)} />
          <InfoRow label="Cập nhật lần cuối" value={formatDateTime(document.updatedAt)} />
        </div>
      </div>

      {/* Phiên bản hiện tại */}
      <div className="mb-5">
        <SectionTitle icon={<File size={14} />} title="Phiên bản hiện tại" />
        {version ? (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">
                  v{version.versionNumber}
                </span>
                {version.isCurrent && (
                  <Tag color="success" className="text-[10px]">Hiện tại</Tag>
                )}
              </div>
              {fileUrl && (
                <Tooltip title="Mở file">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 bg-primary/10 px-2 py-1 rounded transition-colors"
                  >
                    <Download size={12} />
                    Mở / Tải xuống
                  </a>
                </Tooltip>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <InfoRow label="Tên file" value={<span className="truncate block max-w-[200px]">{version.fileName}</span>} />
              <InfoRow label="Định dạng" value={<code className="bg-slate-200 px-1 py-0.5 rounded text-xs">{version.mimeType}</code>} />
              <InfoRow label="Kích thước" value={formatFileSize(version.fileSize)} />
              <InfoRow label="Ngày upload" value={formatDateTime(version.createdAt)} />
              {version.changeSummary && (
                <div className="col-span-2">
                  <InfoRow label="Ghi chú phiên bản" value={version.changeSummary} />
                </div>
              )}
            </div>
            {version.createdBy && (
              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-2">
                <span className="text-xs text-slate-400">Upload bởi:</span>
                <Avatar
                  src={version.createdBy.avatar ? `${BASE_URL}${version.createdBy.avatar}` : undefined}
                  size={20}
                  className="shrink-0 bg-primary/10 text-primary text-xs"
                >
                  {version.createdBy.fullName?.[0]?.toUpperCase()}
                </Avatar>
                <span className="text-xs font-medium text-slate-700">{version.createdBy.fullName}</span>
                <span className="text-xs text-slate-400">@{version.createdBy.username}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 text-sm italic p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <File size={14} />
            <span>Chưa có file đính kèm</span>
          </div>
        )}
      </div>

      {/* Người liên quan */}
      <div>
        <SectionTitle icon={<User size={14} />} title="Người liên quan" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1.5">Người tạo</p>
            <UserCard user={document.createdBy} role="Tác giả" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1.5">Người phê duyệt</p>
            <UserCard user={document.approver} role="Người duyệt" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentDetailModal;
