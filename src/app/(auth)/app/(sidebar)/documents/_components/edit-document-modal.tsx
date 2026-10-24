'use client';

import React, { useEffect, useMemo } from 'react';
import { Modal, Button, Input, Select } from '@/components';
import { updateDocument } from '@/actions/document';
import { DOCUMENT_TYPE_MAP, PERSONAL_DOC_TYPES } from '@/types';
import toast from 'react-hot-toast';
import { Edit3 } from 'lucide-react';
import type { DocumentCategory, DocumentItem } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { invalidateDocumentQueries } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-query-keys';

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  categories: DocumentCategory[];
  onSuccess: () => void;
}

// Validation schema tối ưu: Chỉ 4 trường thông tin chính cho tài liệu cá nhân
const editDocumentSchema = z.object({
  title: z.string().trim().min(1, { message: 'Tiêu đề tài liệu không được để trống' }),
  documentType: z.string().min(1, { message: 'Vui lòng chọn loại văn bản' }),
  code: z.string().optional(),
  summary: z.string().optional(),
  categoryId: z.union([z.number(), z.string()]).optional(),
});

type EditDocumentFormValues = z.infer<typeof editDocumentSchema>;

export const EditDocumentModal: React.FC<EditDocumentModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  categories,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditDocumentFormValues>({
    resolver: zodResolver(editDocumentSchema),
  });

  useEffect(() => {
    register('title');
    register('documentType');
    register('code');
    register('summary');
    register('categoryId');
  }, [register]);

  useEffect(() => {
    if (isOpen && doc) {
      reset({
        title: doc.title || '',
        documentType: doc.documentType || 'work_report',
        code: doc.code || '',
        summary: doc.summary || '',
        categoryId: doc.categoryId || doc.category?.id || '',
      });
    }
  }, [isOpen, doc, reset]);

  // Danh sách cây thư mục phẳng cho dropdown chọn thư mục lưu
  const flattenCategories = (
    cats: DocumentCategory[],
    prefix = '',
    visited = new Set<number>()
  ): { id: number; name: string }[] => {
    let result: { id: number; name: string }[] = [];
    if (!Array.isArray(cats)) return result;
    cats.forEach((cat) => {
      if (cat?.id && !visited.has(cat.id)) {
        visited.add(cat.id);
        result.push({ id: cat.id, name: `${prefix}${cat.name}` });
      }
      if (cat?.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, `${prefix}— `, visited));
      }
    });
    return result;
  };

  const flatCategoryList = useMemo(() => flattenCategories(categories), [categories]);

  const folderOptions = useMemo(
    () => [
      { value: '', label: 'Thư mục gốc (Root)' },
      ...flatCategoryList.map((cat) => ({ value: cat.id, label: cat.name })),
    ],
    [flatCategoryList],
  );

  // Phân loại tài liệu cá nhân (Báo cáo, Hợp đồng, Biểu mẫu, Khác)
  const docTypeOptions = useMemo(() => {
    const options = PERSONAL_DOC_TYPES
      .filter((key) => Boolean(DOCUMENT_TYPE_MAP[key]))
      .map((key) => ({
        value: key,
        label: DOCUMENT_TYPE_MAP[key].label,
      }));

    if (doc?.documentType && !PERSONAL_DOC_TYPES.includes(doc.documentType) && DOCUMENT_TYPE_MAP[doc.documentType]) {
      options.unshift({
        value: doc.documentType,
        label: DOCUMENT_TYPE_MAP[doc.documentType].label,
      });
    }

    return options;
  }, [doc?.documentType]);

  // Mutation cập nhật thông tin tài liệu cá nhân
  const updateMutation = useMutation({
    mutationFn: async (data: EditDocumentFormValues) => {
      if (!doc?.id) return;
      const payload: Record<string, any> = {
        title: data.title.trim(),
        documentType: data.documentType,
        shareScope: 'private',
      };

      if (data.code?.trim()) {
        payload.code = data.code.trim().toUpperCase();
      }
      if (data.summary !== undefined) {
        payload.summary = data.summary.trim();
      }
      if (data.categoryId !== undefined) {
        payload.categoryId = data.categoryId ? Number(data.categoryId) : null;
      }

      return updateDocument(doc.id, payload);
    },
    onSuccess: () => {
      toast.success('Cập nhật tài liệu thành công!');
      invalidateDocumentQueries(queryClient);
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể cập nhật tài liệu');
    },
  });

  const loading = updateMutation.isPending;

  const handleFormSubmit = (data: EditDocumentFormValues) => {
    updateMutation.mutate(data);
  };

  const titleVal = watch('title');
  const codeVal = watch('code');
  const summaryVal = watch('summary');
  const documentTypeVal = watch('documentType');
  const categoryIdVal = watch('categoryId');

  if (!doc) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <Edit3 className="text-primary" size={20} />
          <span>Chỉnh sửa thông tin tài liệu</span>
        </div>
      }
      className="m-2 max-w-2xl w-full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4 text-xs">
        {/* 1. Tiêu đề tài liệu * & Mã văn bản (Tùy chọn) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Input
              label="Tiêu đề tài liệu *"
              fullWidth
              placeholder="Ví dụ: Báo cáo công việc tuần 42..."
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

        {/* 2. Trích yếu nội dung (Tùy chọn) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Trích yếu nội dung (Tùy chọn)
          </label>
          <textarea
            rows={2}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-2xs"
            placeholder="Tóm tắt ngắn gọn mục đích, nội dung chính của văn bản..."
            value={summaryVal || ''}
            onChange={(e) => setValue('summary', e.target.value)}
          />
        </div>

        {/* 3. Phân loại tài liệu * & Lưu vào Thư mục */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Select
              label="Phân loại tài liệu *"
              fullWidth
              value={documentTypeVal}
              onChange={(e) => setValue('documentType', e.target.value, { shouldValidate: true })}
              options={docTypeOptions}
              error={errors.documentType?.message}
            />
          </div>

          <div>
            <Select
              label="Lưu vào Thư mục"
              fullWidth
              value={categoryIdVal}
              onChange={(e) => setValue('categoryId', e.target.value ? Number(e.target.value) : '')}
              options={folderOptions}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end w-full mt-4 pt-3 border-t border-slate-200/80">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={loading} loading={loading}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditDocumentModal;
