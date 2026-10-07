'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal, Button, Input, Textarea, Select } from '@/components';
import { createDocument } from '@/actions/document';
import { getEmployees } from '@/actions/employee';
import { DOCUMENT_TYPE_MAP, SHARE_SCOPE_MAP } from '@/types';
import { formatBytes, getFileVisualInfo } from '../_utils/doc-helpers';
import toast from 'react-hot-toast';
import { Upload, FileUp, X } from 'lucide-react';
import type { DocumentCategory } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolderId?: number | null;
  currentFolder?: DocumentCategory | null;
  categories: DocumentCategory[];
  onSuccess: () => void;
}

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  onClose,
  currentFolderId = null,
  currentFolder = null,
  categories,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [documentType, setDocumentType] = useState('work_report');
  const [categoryId, setCategoryId] = useState<number | ''>(currentFolderId || '');
  const [summary, setSummary] = useState('');
  const [shareScope, setShareScope] = useState('private');
  const [approverId, setApproverId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch employees for approver selection
  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'approvers'],
    queryFn: () => getEmployees({ limit: 100 }),
    enabled: isOpen,
  });

  const employees = employeesData?.items || [];

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setTitle('');
      setCode('');
      setDocumentType('work_report');
      setCategoryId(currentFolderId || '');
      setSummary('');
      setShareScope('private');
      setApproverId('');
      setEffectiveDate('');
      setExpirationDate('');
    }
  }, [isOpen, currentFolderId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!title.trim()) {
        const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, '');
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      if (!title.trim()) {
        const nameWithoutExt = dropped.name.replace(/\.[^/.]+$/, '');
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Vui lòng chọn hoặc tải lên tệp tin');
      return;
    }
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề văn bản');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      formData.append('documentType', documentType);

      if (code.trim()) {
        formData.append('code', code.trim().toUpperCase());
      }
      if (categoryId) {
        formData.append('categoryId', String(categoryId));
      }
      if (summary.trim()) {
        formData.append('summary', summary.trim());
      }
      if (shareScope) {
        formData.append('shareScope', shareScope);
      }
      if (approverId) {
        formData.append('approverId', approverId);
      }
      if (effectiveDate) {
        formData.append('effectiveDate', effectiveDate);
      }
      if (expirationDate) {
        formData.append('expirationDate', expirationDate);
      }

      await createDocument(formData);
      toast.success('Tải lên và tạo tài liệu thành công!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Không thể tạo tài liệu');
    } finally {
      setLoading(false);
    }
  };

  // Flatten categories for select dropdown
  const flattenCategories = (cats: DocumentCategory[], prefix = ''): { id: number; name: string }[] => {
    let result: { id: number; name: string }[] = [];
    if (!Array.isArray(cats)) return result;
    cats.forEach((cat) => {
      result.push({ id: cat.id, name: `${prefix}${cat.name}` });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, `${prefix}— `));
      }
    });
    return result;
  };

  const flatCategoryList = useMemo(() => flattenCategories(categories), [categories]);

  const docTypeOptions = useMemo(
    () =>
      Object.entries(DOCUMENT_TYPE_MAP).map(([key, item]) => ({
        value: key,
        label: item.label,
      })),
    [],
  );

  const folderOptions = useMemo(
    () => [
      { value: '', label: 'Thư mục gốc (Root)' },
      ...flatCategoryList.map((cat) => ({ value: cat.id, label: cat.name })),
    ],
    [flatCategoryList],
  );

  const shareScopeOptions = useMemo(
    () => [
      { value: 'private', label: SHARE_SCOPE_MAP.private },
      { value: 'department', label: SHARE_SCOPE_MAP.department },
      { value: 'all', label: SHARE_SCOPE_MAP.all },
    ],
    [],
  );

  const approverOptions = useMemo(
    () => [
      { value: '', label: 'Không chỉ định (Tự duyệt / Bản thảo)' },
      ...employees.map((emp: any) => ({
        value: emp.id,
        label: `${emp.fullName || emp.name} (${emp.email || 'NV'})`,
      })),
    ],
    [employees],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <Upload className="text-primary" size={20} />
          <span>Tải lên & Tạo tài liệu mới</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Tải lên tài liệu
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Upload Dropzone */}
        <div>
          <label className="text-xs font-semibold text-gray-700 select-none block mb-1.5">
            Tệp đính kèm (PDF, DOCX, XLSX, Ảnh...) <span className="text-rose-500">*</span>
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 hover:border-primary/60 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <FileUp size={24} />
              </div>
              <div>
                <p className="font-semibold text-slate-700 text-xs">
                  Nhấp để tải tệp hoặc kéo thả vào đây
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hỗ trợ tài liệu Word, Excel, PDF, hình ảnh...
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                  {getFileVisualInfo(file.name).icon}
                </div>
                <div className="truncate">
                  <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-400">{formatBytes(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Chọn tệp khác"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Title & Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Tiêu đề tài liệu *"
              required
              fullWidth
              placeholder="Ví dụ: Quy chế công tác phí 2026..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Mã văn bản (Tùy chọn)"
              fullWidth
              placeholder="Tự động nếu để trống"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono uppercase"
            />
          </div>
        </div>

        {/* Document Type & Folder Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Select
              label="Phân loại văn bản *"
              fullWidth
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              options={docTypeOptions}
            />
          </div>

          <div>
            <Select
              label="Lưu vào Thư mục"
              fullWidth
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
              options={folderOptions}
            />
          </div>
        </div>

        {/* Share Scope & Approver */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Select
              label="Phạm vi chia sẻ"
              fullWidth
              value={shareScope}
              onChange={(e) => setShareScope(e.target.value)}
              options={shareScopeOptions}
            />
          </div>

          <div>
            <Select
              label="Người phê duyệt (Nếu cần trình duyệt)"
              fullWidth
              value={approverId}
              onChange={(e) => setApproverId(e.target.value)}
              options={approverOptions}
            />
          </div>
        </div>

        {/* Effective & Expiration Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Input
              type="date"
              label="Ngày bắt đầu hiệu lực (Tùy chọn)"
              fullWidth
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          </div>

          <div>
            <Input
              type="date"
              label="Ngày hết hiệu lực (Tùy chọn)"
              fullWidth
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>
        </div>

        {/* Summary */}
        <div>
          <Textarea
            label="Trích yếu nội dung"
            fullWidth
            rows={2}
            placeholder="Tóm tắt ngắn gọn nội dung tài liệu..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
