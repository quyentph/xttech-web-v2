'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal, Button, Input, Select } from '@/components';
import { createDocument, bulkUploadDocuments } from '@/actions/document';
import { DOCUMENT_TYPE_MAP, RULE_DOC_TYPES, PERSONAL_DOC_TYPES } from '@/types';
import { formatBytes, getFileVisualInfo } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-helpers';
import toast from 'react-hot-toast';
import { Upload, FileUp, X, FileCheck, Files, Trash2 } from 'lucide-react';
import type { DocumentCategory } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { invalidateDocumentQueries } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-query-keys';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolderId?: number | null;
  currentFolder?: DocumentCategory | null;
  categories: DocumentCategory[];
  onSuccess: () => void;
  defaultGroup?: 'rules' | 'personal';
}

const documentSchema = z.object({
  title: z.string().optional(),
  documentType: z.string().min(1, { message: 'Vui lòng chọn loại văn bản' }),
  summary: z.string().optional(),
  code: z.string().optional(),
  categoryId: z.union([z.number(), z.string()]).optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  onClose,
  currentFolderId = null,
  currentFolder = null,
  categories,
  onSuccess,
  defaultGroup = 'personal',
}) => {
  const queryClient = useQueryClient();
  const isRuleMode = defaultGroup === 'rules';

  // Danh sách các tệp được chọn (có thể là 1 tệp hoặc nhiều tệp khi giữ Ctrl)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBulkMode = selectedFiles.length > 1;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      documentType: isRuleMode ? 'regulation' : 'work_report',
      summary: '',
      code: '',
      categoryId: currentFolderId || '',
    },
  });

  // Mutation cho trường hợp 1 tệp
  const createSingleMutation = useMutation({
    mutationFn: async ({ data, file }: { data: DocumentFormValues; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);

      const scope = isRuleMode ? 'all' : 'private';
      const cleanTitle = (data.title?.trim() || file.name.replace(/\.[^/.]+$/, '')).trim();

      const documentData: Record<string, any> = {
        title: cleanTitle,
        documentType: data.documentType,
        shareScope: scope,
        status: 'draft',
        approvalStatus: 'draft',
      };

      if (data.summary?.trim()) {
        documentData.summary = data.summary.trim();
      }
      if (data.code?.trim()) {
        documentData.code = data.code.trim().toUpperCase();
      }
      const targetCatId = currentFolderId ? Number(currentFolderId) : data.categoryId ? Number(data.categoryId) : undefined;
      if (targetCatId) {
        documentData.categoryId = targetCatId;
      }

      formData.append('document_data', JSON.stringify(documentData));
      formData.append('title', cleanTitle);
      formData.append('documentType', data.documentType);
      formData.append('shareScope', scope);
      formData.append('status', 'draft');
      formData.append('approvalStatus', 'draft');

      if (data.summary?.trim()) {
        formData.append('summary', data.summary.trim());
      }
      if (data.code?.trim()) {
        formData.append('code', data.code.trim().toUpperCase());
      }
      if (targetCatId) {
        formData.append('categoryId', String(targetCatId));
      }

      return createDocument(formData);
    },
    onSuccess: () => {
      toast.success(isRuleMode ? 'Tải lên quy chế thành công (Bản nháp)!' : 'Tải lên tài liệu thành công (Bản nháp)!');
      invalidateDocumentQueries(queryClient);
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể tạo văn bản');
    },
  });

  // Mutation cho trường hợp nhiều tệp (Bulk Upload qua POST /api/v1/documents/bulk-upload)
  const createBulkMutation = useMutation({
    mutationFn: async ({ files, data }: { files: File[]; data: DocumentFormValues }) => {
      const targetCatId = currentFolderId ? Number(currentFolderId) : data.categoryId ? Number(data.categoryId) : undefined;
      const scope = isRuleMode ? 'all' : 'private';

      return bulkUploadDocuments({
        files,
        categoryId: targetCatId,
        shareScope: scope,
      });
    },
    onSuccess: (res: any) => {
      const count = res?.total || selectedFiles.length;
      toast.success(`Đã tải lên thành công ${count} tài liệu!`);
      invalidateDocumentQueries(queryClient);
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Lỗi khi tải lên hàng loạt tài liệu');
    },
  });

  const loading = createSingleMutation.isPending || createBulkMutation.isPending;

  useEffect(() => {
    register('title');
    register('documentType');
    register('code');
    register('categoryId');
  }, [register]);

  useEffect(() => {
    if (isOpen) {
      setSelectedFiles([]);
      setFileError(null);
      reset({
        title: '',
        documentType: defaultGroup === 'rules' ? 'regulation' : 'work_report',
        summary: '',
        code: '',
        categoryId: currentFolderId ? Number(currentFolderId) : '',
      });
    }
  }, [isOpen, currentFolderId, defaultGroup, reset]);

  // Options phân loại theo ngữ cảnh
  const docTypeOptions = useMemo(() => {
    const targetKeys = isRuleMode ? RULE_DOC_TYPES : PERSONAL_DOC_TYPES;
    return targetKeys
      .filter((key) => Boolean(DOCUMENT_TYPE_MAP[key]))
      .map((key) => ({
        value: key,
        label: DOCUMENT_TYPE_MAP[key].label,
      }));
  }, [isRuleMode]);

  // Nhận tệp từ input file (cộng tiếp các tệp mới vào danh sách)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setSelectedFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const uniqueNew = newFiles.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));
      const combined = [...prev, ...uniqueNew];

      // Nếu sau khi thêm chỉ có 1 file và chưa nhập tiêu đề, tự điền tiêu đề từ tên file
      if (combined.length === 1 && !watch('title')?.trim()) {
        const nameWithoutExt = combined[0].name.replace(/\.[^/.]+$/, '');
        setValue('title', nameWithoutExt, { shouldValidate: true });
      }
      return combined;
    });

    setFileError(null);
    // Reset value để người dùng có thể bấm chọn thêm tệp nhiều lần liên tiếp
    e.target.value = '';
  };

  // Kéo thả (hỗ trợ kéo thả cộng dồn vào danh sách)
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setSelectedFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const uniqueNew = newFiles.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));
      const combined = [...prev, ...uniqueNew];

      if (combined.length === 1 && !watch('title')?.trim()) {
        const nameWithoutExt = combined[0].name.replace(/\.[^/.]+$/, '');
        setValue('title', nameWithoutExt, { shouldValidate: true });
      }
      return combined;
    });

    setFileError(null);
  };

  const handleRemoveFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    if (updated.length === 1 && !watch('title')?.trim()) {
      const nameWithoutExt = updated[0].name.replace(/\.[^/.]+$/, '');
      setValue('title', nameWithoutExt, { shouldValidate: true });
    }
  };

  const totalBytes = useMemo(() => {
    return selectedFiles.reduce((acc, f) => acc + f.size, 0);
  }, [selectedFiles]);

  const handleFormSubmit = async (data: DocumentFormValues) => {
    if (selectedFiles.length === 0) {
      setFileError('Vui lòng chọn ít nhất một tệp văn bản đính kèm');
      return;
    }

    if (selectedFiles.length === 1) {
      // 1 file: kiểm tra tiêu đề bắt buộc
      if (!data.title?.trim()) {
        const autoTitle = selectedFiles[0].name.replace(/\.[^/.]+$/, '');
        data.title = autoTitle;
      }
      createSingleMutation.mutate({ data, file: selectedFiles[0] });
    } else {
      // Nhiều file (Bulk upload qua API /api/v1/documents/bulk-upload)
      createBulkMutation.mutate({ files: selectedFiles, data });
    }
  };

  const titleVal = watch('title');
  const codeVal = watch('code');
  const documentTypeVal = watch('documentType');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2 text-slate-800">
          {isRuleMode ? <FileCheck className="text-primary" size={20} /> : <Upload className="text-primary" size={20} />}
          <span>{isRuleMode ? 'Tải lên quy chế / văn bản' : 'Tải lên tài liệu'}</span>
        </div>
      }
      className="m-2 max-w-2xl w-full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4 text-xs">
        {/* Input file ẩn có thuộc tính multiple (Giữ Ctrl để chọn nhiều tệp) */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Khu vực chọn tệp đính kèm Dropzone */}
        <div>
          <label className="text-xs font-semibold text-gray-700 select-none block mb-1.5">
            Tệp đính kèm (PDF, DOCX, XLSX, Ảnh...) <span className="text-rose-500">*</span>
            <span className="text-[11px] font-normal text-slate-400 ml-2">
              (Giữ phím <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] text-slate-700">Ctrl</kbd> để chọn nhiều tệp cùng lúc)
            </span>
          </label>

          {selectedFiles.length === 0 ? (
            /* Chưa chọn tệp nào */
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center gap-2 group ${
                fileError ? 'border-red-500 bg-red-50/10' : 'border-slate-300 hover:border-primary/60'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <FileUp size={24} />
              </div>
              <div>
                <p className="font-semibold text-slate-700 text-xs">
                  Nhấp để chọn tệp (hoặc giữ <kbd className="font-mono text-slate-600 bg-slate-200 px-1 py-0.5 rounded text-[10px]">Ctrl</kbd> chọn nhiều tệp)
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Kéo thả 1 hoặc nhiều tệp vào đây</p>
              </div>
            </div>
          ) : selectedFiles.length === 1 ? (
            /* Chọn 1 tệp */
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                  {getFileVisualInfo(selectedFiles[0].name).icon}
                </div>
                <div className="truncate">
                  <p className="font-semibold text-slate-800 truncate">{selectedFiles[0].name}</p>
                  <p className="text-[10px] text-slate-400">{formatBytes(selectedFiles[0].size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-primary hover:underline cursor-pointer font-medium"
                >
                  + Chọn thêm tệp
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  className="p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Hủy chọn"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* Giữ Ctrl chọn nhiều tệp (Bulk mode) */
            <div className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-50 border border-primary/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-semibold text-slate-800 text-xs">
                    Đã chọn {selectedFiles.length} tệp tin
                  </span>
                  <span className="text-[11px] text-slate-400">({formatBytes(totalBytes)})</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-primary hover:underline cursor-pointer font-medium"
                  >
                    Chọn thêm
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFiles([])}
                    className="text-xs text-rose-500 hover:underline cursor-pointer"
                  >
                    Xóa tất cả
                  </button>
                </div>
              </div>

              {/* Danh sách tệp cuộn gọn gàng */}
              <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white">
                {selectedFiles.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="shrink-0">{getFileVisualInfo(f.name).icon}</div>
                      <div className="truncate">
                        <p className="font-medium text-slate-800 truncate text-xs">{f.name}</p>
                        <p className="text-[10px] text-slate-400">{formatBytes(f.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Xóa tệp này"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {fileError && <span className="text-xs text-red-500 mt-1 block">{fileError}</span>}
        </div>

        {/* Nếu chỉ chọn 1 tệp: Cho phép nhập Tiêu đề & Mã văn bản */}
        {!isBulkMode && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                label={isRuleMode ? 'Tiêu đề quy chế / văn bản *' : 'Tiêu đề tài liệu *'}
                fullWidth
                placeholder={isRuleMode ? 'Ví dụ: Quy chế công tác phí 2026...' : 'Ví dụ: Báo cáo công việc tuần 42...'}
                value={titleVal}
                onChange={(e) => setValue('title', e.target.value, { shouldValidate: true })}
                error={errors.title?.message}
              />
            </div>

            <div>
              <Input
                label="Mã văn bản (Tùy chọn)"
                fullWidth
                placeholder="TỰ ĐỘNG NẾU ĐỂ TRỐNG"
                value={codeVal}
                onChange={(e) => setValue('code', e.target.value.toUpperCase())}
                error={errors.code?.message}
                className="font-mono uppercase"
              />
            </div>
          </div>
        )}

        {/* Trích yếu nội dung */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Trích yếu nội dung (Tùy chọn)
          </label>
          <textarea
            rows={2}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-2xs"
            placeholder={
              isBulkMode
                ? 'Ghi chú / trích yếu áp dụng chung cho toàn bộ các tệp được tải lên...'
                : 'Tóm tắt ngắn gọn mục đích, nội dung chính của văn bản...'
            }
            value={watch('summary') || ''}
            onChange={(e) => setValue('summary', e.target.value)}
          />
        </div>

        {/* Phân loại & Lưu vào Thư mục */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Select
              label={isRuleMode ? 'Phân loại văn bản quy chế / ban hành *' : 'Phân loại tài liệu *'}
              fullWidth
              value={documentTypeVal}
              onChange={(e) => setValue('documentType', e.target.value, { shouldValidate: true })}
              options={docTypeOptions}
              error={errors.documentType?.message}
            />
          </div>

          <div>
            <Input
              label="Lưu vào Thư mục"
              fullWidth
              readOnly
              disabled
              value={currentFolder ? currentFolder.name : 'Thư mục gốc (Root)'}
              className="bg-slate-100 text-slate-700 font-medium cursor-not-allowed select-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end w-full mt-4">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={loading} loading={loading}>
            {isBulkMode
              ? `Tải lên ${selectedFiles.length} ${isRuleMode ? 'quy chế' : 'tài liệu'}`
              : isRuleMode
              ? 'Tải lên quy chế'
              : 'Tải lên tài liệu'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
