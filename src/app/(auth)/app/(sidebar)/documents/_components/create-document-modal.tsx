'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Modal, Button, Input, Textarea, Select, MultiSelect } from '@/components';

import { createDocument } from '@/actions/document';

import { getEmployees } from '@/actions/employee';

import { getDepartments } from '@/actions/department';

import { DOCUMENT_TYPE_MAP, SHARE_SCOPE_MAP } from '@/types';

import { formatBytes, getFileVisualInfo } from '../_utils/doc-helpers';

import toast from 'react-hot-toast';

import { Upload, FileUp, X } from 'lucide-react';

import type { DocumentCategory } from '@/types';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolderId?: number | null;
  currentFolder?: DocumentCategory | null;
  categories: DocumentCategory[];
  onSuccess: () => void;
}

// Validation schema dùng Zod theo chuẩn form-modal
const documentSchema = z.object({
  title: z.string().min(1, { message: 'Tiêu đề tài liệu không được để trống' }),
  documentType: z.string().min(1, { message: 'Vui lòng chọn loại văn bản' }),
  code: z.string().optional(),
  categoryId: z.union([z.number(), z.string()]).optional(),
  summary: z.string().optional(),
  shareScope: z.string().optional(),
  approverId: z.string().optional(),
  effectiveDate: z.string().optional(),
  expirationDate: z.string().optional(),
  recipientUserIds: z.array(z.string()).optional(),
  recipientDepartmentIds: z.array(z.string()).optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

// Chỉ người dùng có role admin, hr hoặc super/supper admin mới có quyền phê duyệt
const isApproverEligible = (emp: any): boolean => {
  if (!emp) return false;

  const validKeywords = ['admin', 'hr', 'super', 'supper', 'quản trị', 'nhân sự'];

  const matchString = (val?: string | null): boolean => {
    if (!val || typeof val !== 'string') return false;
    const lower = val.toLowerCase().trim();
    return validKeywords.some((keyword) => lower.includes(keyword));
  };

  // 1. Kiểm tra trong danh sách roles
  if (Array.isArray(emp.roles) && emp.roles.length > 0) {
    const hasMatch = emp.roles.some((r: any) => {
      if (typeof r === 'string') return matchString(r);
      return matchString(r?.code) || matchString(r?.name);
    });
    if (hasMatch) return true;
  }

  // 2. Kiểm tra thuộc tính role đơn lẻ nếu có
  if (typeof emp.role === 'string' && matchString(emp.role)) return true;
  if (emp.role && typeof emp.role === 'object') {
    if (matchString(emp.role?.code) || matchString(emp.role?.name)) return true;
  }

  // 3. Kiểm tra positions nếu có
  if (Array.isArray(emp.positions) && emp.positions.length > 0) {
    const hasMatchPos = emp.positions.some((p: any) => {
      if (typeof p === 'string') return matchString(p);
      return matchString(p?.code) || matchString(p?.name);
    });
    if (hasMatchPos) return true;
  }

  return false;
};

// Lấy nhãn hiển thị vai trò của người duyệt
const getApproverRoleBadge = (emp: any): string => {
  if (Array.isArray(emp.roles) && emp.roles.length > 0) {
    const names = emp.roles.map((r: any) => (typeof r === 'string' ? r : r.name || r.code)).filter(Boolean);
    if (names.length > 0) return names.join(', ');
  }
  if (typeof emp.role === 'string') return emp.role;
  if (emp.role && typeof emp.role === 'object') return emp.role.name || emp.role.code || '';
  return 'Cán bộ duyệt';
};

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  onClose,
  currentFolderId = null,
  currentFolder = null,
  categories,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([]);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<(string | number)[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      documentType: 'work_report',
      code: '',
      categoryId: currentFolderId || '',
      summary: '',
      shareScope: 'private',
      approverId: '',
      effectiveDate: '',
      expirationDate: '',
    },
  });

  // React Query Mutation để tạo mới tài liệu
  const createDocumentMutation = useMutation({
    mutationFn: async ({
      data,
      file,
      userIds,
      deptIds,
    }: {
      data: DocumentFormValues;
      file: File;
      userIds: (string | number)[];
      deptIds: (string | number)[];
    }) => {
      const formData = new FormData();
      formData.append('file', file);

      // Backend FastAPI yêu cầu dữ liệu thông tin tài liệu nằm trong trường 'document_data' (dạng JSON string)
      const documentData: Record<string, any> = {
        title: data.title.trim(),
        documentType: data.documentType,
        document_type: data.documentType,
        shareScope: data.shareScope || 'private',
        share_scope: data.shareScope || 'private',
      };

      if (data.code?.trim()) {
        documentData.code = data.code.trim().toUpperCase();
      }
      if (data.categoryId) {
        documentData.category_id = Number(data.categoryId);
        documentData.categoryId = Number(data.categoryId);
      }
      if (data.summary?.trim()) {
        documentData.summary = data.summary.trim();
      }
      if (data.approverId && data.approverId.trim() !== '') {
        documentData.approver_id = data.approverId.trim();
        documentData.approverId = data.approverId.trim();
      }
      if (data.effectiveDate && data.effectiveDate.trim() !== '') {
        documentData.effective_date = data.effectiveDate.trim();
        documentData.effectiveDate = data.effectiveDate.trim();
      }
      if (data.expirationDate && data.expirationDate.trim() !== '') {
        documentData.expiration_date = data.expirationDate.trim();
        documentData.expirationDate = data.expirationDate.trim();
      }

      if (userIds.length > 0) {
        documentData.recipientUserIds = userIds.map(String);
        documentData.recipient_user_ids = userIds.map(String);
      }
      if (deptIds.length > 0) {
        documentData.recipientDepartmentIds = deptIds.map(Number);
        documentData.recipient_department_ids = deptIds.map(Number);
      }

      formData.append('document_data', JSON.stringify(documentData));

      // Đồng thời bổ sung các trường riêng lẻ để tương thích đa dạng API
      formData.append('title', data.title.trim());
      formData.append('document_type', data.documentType);
      formData.append('documentType', data.documentType);
      if (data.code?.trim()) formData.append('code', data.code.trim().toUpperCase());
      if (data.categoryId) {
        formData.append('category_id', String(data.categoryId));
        formData.append('categoryId', String(data.categoryId));
      }
      if (data.summary?.trim()) formData.append('summary', data.summary.trim());
      if (data.shareScope) {
        formData.append('share_scope', data.shareScope);
        formData.append('shareScope', data.shareScope);
      }
      if (data.approverId) {
        formData.append('approver_id', data.approverId);
        formData.append('approverId', data.approverId);
      }
      if (data.effectiveDate) {
        formData.append('effective_date', data.effectiveDate);
        formData.append('effectiveDate', data.effectiveDate);
      }
      if (data.expirationDate) {
        formData.append('expiration_date', data.expirationDate);
        formData.append('expirationDate', data.expirationDate);
      }
      if (userIds.length > 0) {
        formData.append('recipientUserIds', JSON.stringify(userIds.map(String)));
        formData.append('recipient_user_ids', JSON.stringify(userIds.map(String)));
      }
      if (deptIds.length > 0) {
        formData.append('recipientDepartmentIds', JSON.stringify(deptIds.map(Number)));
        formData.append('recipient_department_ids', JSON.stringify(deptIds.map(Number)));
      }

      return createDocument(formData);
    },
    onSuccess: () => {
      toast.success('Tải lên và tạo tài liệu thành công!');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['inbox-documents'] });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể tạo tài liệu');
    },
  });

  const loading = createDocumentMutation.isPending;

  // Lấy danh sách nhân viên để làm người phê duyệt hoặc người nhận
  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'approvers'],
    queryFn: () => getEmployees({ limit: 200 }),
    enabled: isOpen,
  });

  // Lấy danh sách phòng ban
  const { data: departmentsData } = useQuery({
    queryKey: ['departments', 'share-options'],
    queryFn: () => getDepartments({ limit: 100 }),
    enabled: isOpen,
  });

  const employees = employeesData?.items || [];
  const departments = useMemo(() => {
    const raw = (departmentsData as any)?.data ?? departmentsData;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  }, [departmentsData]);

  useEffect(() => {
    register('title');
    register('documentType');
    register('code');
    register('categoryId');
    register('summary');
    register('shareScope');
    register('approverId');
    register('effectiveDate');
    register('expirationDate');
  }, [register]);

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setFileError(null);
      setSelectedUserIds([]);
      setSelectedDepartmentIds([]);
      reset({
        title: '',
        documentType: 'work_report',
        code: '',
        categoryId: currentFolderId || '',
        summary: '',
        shareScope: 'private',
        approverId: '',
        effectiveDate: '',
        expirationDate: '',
      });
    }
  }, [isOpen, currentFolderId, reset]);

  // Xử lý chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setFileError(null);
      if (!watch('title')?.trim()) {
        const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, '');
        setValue('title', nameWithoutExt, { shouldValidate: true });
      }
    }
  };

  // Xử lý kéo thả file
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setFileError(null);
      if (!watch('title')?.trim()) {
        const nameWithoutExt = dropped.name.replace(/\.[^/.]+$/, '');
        setValue('title', nameWithoutExt, { shouldValidate: true });
      }
    }
  };

  const handleFormSubmit = (data: DocumentFormValues) => {
    if (!file) {
      setFileError('Vui lòng chọn hoặc tải lên tệp tin');
      return;
    }

    createDocumentMutation.mutate({
      data,
      file,
      userIds: selectedUserIds,
      deptIds: selectedDepartmentIds,
    });
  };

  // Tạo thụt lề trực quan theo cấp bậc
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

  const docTypeOptions = useMemo(
    () =>
      Object.entries(DOCUMENT_TYPE_MAP).map(([key, item]) => ({
        value: key,
        label: item.label,
      })),
    [],
  );

  const folderOptions = useMemo(
    () => [{ value: '', label: 'Thư mục gốc (Root)' }, ...flatCategoryList.map((cat) => ({ value: cat.id, label: cat.name }))],
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

  const approverOptions = useMemo(() => {
    // Chỉ hiển thị các nhân sự có quyền duyệt (Admin, HR, Super Admin)
    const eligibleApprovers = employees.filter(isApproverEligible);
    const seenIds = new Set<string | number>();

    const uniqueApprovers = eligibleApprovers.filter((emp: any) => {
      if (!emp?.id || seenIds.has(emp.id)) return false;
      seenIds.add(emp.id);
      return true;
    });

    return [
      { value: '', label: 'Không chỉ định (Tự duyệt / Bản thảo)' },
      ...uniqueApprovers.map((emp: any) => {
        const roleName = getApproverRoleBadge(emp);
        const roleLabel = roleName ? ` [${roleName}]` : '';
        return {
          value: emp.id,
          label: `${emp.fullName || emp.name}${roleLabel} (${emp.email || 'NV'})`,
        };
      }),
    ];
  }, [employees]);

  const employeeOptions = useMemo(() => {
    const seen = new Set<string | number>();
    return employees
      .filter((emp: any) => {
        if (!emp?.id || seen.has(emp.id)) return false;
        seen.add(emp.id);
        return true;
      })
      .map((emp: any) => ({
        value: String(emp.id),
        label: emp.fullName || emp.username || 'Nhân sự',
        subLabel: emp.email || (emp.code ? `Mã: ${emp.code}` : undefined),
      }));
  }, [employees]);

  const departmentOptions = useMemo(() => {
    const seen = new Set<string | number>();
    return departments
      .filter((dept: any) => {
        if (!dept?.id || seen.has(dept.id)) return false;
        seen.add(dept.id);
        return true;
      })
      .map((dept: any) => ({
        value: String(dept.id),
        label: dept.name,
        subLabel: dept.code ? `[${dept.code}]` : undefined,
      }));
  }, [departments]);

  const titleVal = watch('title');
  const codeVal = watch('code');
  const documentTypeVal = watch('documentType');
  const categoryIdVal = watch('categoryId');
  const shareScopeVal = watch('shareScope');
  const approverIdVal = watch('approverId');
  const effectiveDateVal = watch('effectiveDate');
  const expirationDateVal = watch('expirationDate');
  const summaryVal = watch('summary');

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
      className="m-2 max-w-2xl w-full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4 text-xs">
        {/* Upload Dropzone */}
        <div>
          <label className="text-xs font-semibold text-gray-700 select-none block mb-1.5">
            Tệp đính kèm (PDF, DOCX, XLSX, Ảnh...) <span className="text-rose-500">*</span>
          </label>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

          {!file ? (
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
                <p className="font-semibold text-slate-700 text-xs">Nhấp để tải tệp hoặc kéo thả vào đây</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ tài liệu Word, Excel, PDF, hình ảnh...</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">{getFileVisualInfo(file.name).icon}</div>
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
          {fileError && <span className="text-xs text-red-500 mt-1 block">{fileError}</span>}
        </div>

        {/* Title & Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Input
              label="Tiêu đề tài liệu *"
              fullWidth
              placeholder="Ví dụ: Quy chế công tác phí 2026..."
              value={titleVal}
              onChange={(e) => setValue('title', e.target.value, { shouldValidate: true })}
              error={errors.title?.message}
            />
          </div>

          <div>
            <Input
              label="Mã văn bản (Tùy chọn)"
              fullWidth
              placeholder="Tự động nếu để trống"
              value={codeVal}
              onChange={(e) => setValue('code', e.target.value.toUpperCase())}
              error={errors.code?.message}
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
              disabled
              value={categoryIdVal}
              onChange={(e) => setValue('categoryId', e.target.value ? Number(e.target.value) : '')}
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
              value={shareScopeVal}
              onChange={(e) => setValue('shareScope', e.target.value)}
              options={shareScopeOptions}
            />
          </div>

          <div>
            <Select
              label="Người phê duyệt (Chỉ Admin / HR / Super Admin)"
              fullWidth
              value={approverIdVal}
              onChange={(e) => setValue('approverId', e.target.value)}
              options={approverOptions}
            />
          </div>
        </div>

        {/* Recipients MultiSelect */}
        {shareScopeVal !== 'all' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <MultiSelect
                label="Người nhận đích danh"
                options={employeeOptions}
                value={selectedUserIds}
                onChange={setSelectedUserIds}
                placeholder="Chọn nhân sự..."
                searchPlaceholder="Tìm tên hoặc email..."
                fullWidth
              />
            </div>
            <div>
              <MultiSelect
                label="Phòng ban nhận"
                options={departmentOptions}
                value={selectedDepartmentIds}
                onChange={setSelectedDepartmentIds}
                placeholder="Chọn phòng ban..."
                searchPlaceholder="Tìm tên phòng ban..."
                fullWidth
              />
            </div>
          </div>
        )}

        {/* Effective & Expiration Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Input
              type="date"
              label="Ngày bắt đầu hiệu lực (Tùy chọn)"
              fullWidth
              value={effectiveDateVal}
              onChange={(e) => setValue('effectiveDate', e.target.value)}
            />
          </div>

          <div>
            <Input
              type="date"
              label="Ngày hết hiệu lực (Tùy chọn)"
              fullWidth
              value={expirationDateVal}
              onChange={(e) => setValue('expirationDate', e.target.value)}
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
            value={summaryVal}
            onChange={(e) => setValue('summary', e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end w-full mt-4">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={loading} loading={loading}>
            Tải lên tài liệu
          </Button>
        </div>
      </form>
    </Modal>
  );
};
