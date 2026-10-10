'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Input, Textarea, Select, MultiSelect } from '@/components';
import { updateDocument } from '@/actions/document';
import { getEmployees } from '@/actions/employee';
import { getDepartments } from '@/actions/department';
import { DOCUMENT_TYPE_MAP, SHARE_SCOPE_MAP } from '@/types';
import toast from 'react-hot-toast';
import { Edit3 } from 'lucide-react';
import type { DocumentCategory, DocumentItem } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  categories: DocumentCategory[];
  onSuccess: () => void;
}

const editDocumentSchema = z.object({
  title: z.string().min(1, { message: 'Tiêu đề tài liệu không được để trống' }),
  documentType: z.string().min(1, { message: 'Vui lòng chọn loại văn bản' }),
  code: z.string().optional(),
  categoryId: z.union([z.number(), z.string()]).optional(),
  summary: z.string().optional(),
  shareScope: z.string().optional(),
  approverId: z.string().optional(),
  effectiveDate: z.string().optional(),
  expirationDate: z.string().optional(),
});

type EditDocumentFormValues = z.infer<typeof editDocumentSchema>;

const isApproverEligible = (emp: any): boolean => {
  if (!emp) return false;
  const validKeywords = ['admin', 'hr', 'super', 'supper', 'quản trị', 'nhân sự'];
  const matchString = (val?: string | null): boolean => {
    if (!val || typeof val !== 'string') return false;
    const lower = val.toLowerCase().trim();
    return validKeywords.some((keyword) => lower.includes(keyword));
  };
  if (Array.isArray(emp.roles) && emp.roles.length > 0) {
    const hasMatch = emp.roles.some((r: any) => {
      if (typeof r === 'string') return matchString(r);
      return matchString(r?.code) || matchString(r?.name);
    });
    if (hasMatch) return true;
  }
  if (typeof emp.role === 'string' && matchString(emp.role)) return true;
  if (emp.role && typeof emp.role === 'object') {
    if (matchString(emp.role?.code) || matchString(emp.role?.name)) return true;
  }
  if (Array.isArray(emp.positions) && emp.positions.length > 0) {
    const hasMatchPos = emp.positions.some((p: any) => {
      if (typeof p === 'string') return matchString(p);
      return matchString(p?.code) || matchString(p?.name);
    });
    if (hasMatchPos) return true;
  }
  return false;
};

const getApproverRoleBadge = (emp: any): string => {
  if (Array.isArray(emp.roles) && emp.roles.length > 0) {
    const names = emp.roles
      .map((r: any) => (typeof r === 'string' ? r : r.name || r.code))
      .filter(Boolean);
    if (names.length > 0) return names.join(', ');
  }
  if (typeof emp.role === 'string') return emp.role;
  if (emp.role && typeof emp.role === 'object') return emp.role.name || emp.role.code || '';
  return 'Cán bộ duyệt';
};

export const EditDocumentModal: React.FC<EditDocumentModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  categories,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([]);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<(string | number)[]>([]);

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

  // Fetch employees & departments for selection
  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'share-options'],
    queryFn: () => getEmployees({ limit: 200 }),
    enabled: isOpen,
  });

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
    if (isOpen && doc) {
      reset({
        title: doc.title || '',
        documentType: doc.documentType || 'work_report',
        code: doc.code || '',
        categoryId: doc.categoryId || doc.category?.id || '',
        summary: doc.summary || '',
        shareScope: doc.shareScope || 'private',
        approverId: doc.approverId || doc.approver?.id || '',
        effectiveDate: doc.effectiveDate ? dayjs(doc.effectiveDate).format('YYYY-MM-DD') : '',
        expirationDate: doc.expirationDate ? dayjs(doc.expirationDate).format('YYYY-MM-DD') : '',
      });

      // Populate recipients if available
      const recipientUsers = (doc.recipients || [])
        .map((r) => r.userId)
        .filter(Boolean);
      setSelectedUserIds(recipientUsers);
      setSelectedDepartmentIds([]);
    }
  }, [isOpen, doc, reset]);

  const handleFormSubmit = async (data: EditDocumentFormValues) => {
    if (!doc) return;

    try {
      setLoading(true);

      const payload: Record<string, any> = {
        title: data.title.trim(),
        documentType: data.documentType,
        document_type: data.documentType,
        shareScope: data.shareScope || 'private',
        share_scope: data.shareScope || 'private',
      };

      if (data.code?.trim()) payload.code = data.code.trim().toUpperCase();
      if (data.categoryId) {
        payload.categoryId = Number(data.categoryId);
        payload.category_id = Number(data.categoryId);
      }
      if (data.summary !== undefined) payload.summary = data.summary?.trim() || null;
      if (data.approverId) {
        payload.approverId = data.approverId.trim();
        payload.approver_id = data.approverId.trim();
      }
      if (data.effectiveDate) {
        payload.effectiveDate = data.effectiveDate.trim();
        payload.effective_date = data.effectiveDate.trim();
      }
      if (data.expirationDate) {
        payload.expirationDate = data.expirationDate.trim();
        payload.expiration_date = data.expirationDate.trim();
      }

      if (selectedUserIds.length > 0) {
        payload.recipientUserIds = selectedUserIds.map(String);
        payload.recipient_user_ids = selectedUserIds.map(String);
      }
      if (selectedDepartmentIds.length > 0) {
        payload.recipientDepartmentIds = selectedDepartmentIds.map(Number);
        payload.recipient_department_ids = selectedDepartmentIds.map(Number);
      }

      await updateDocument(doc.id, payload);
      toast.success('Cập nhật thông tin tài liệu thành công!');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['inbox-documents'] });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật tài liệu');
    } finally {
      setLoading(false);
    }
  };

  // Flatten categories for select dropdown (với cơ chế deduplicate ID)
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

  const approverOptions = useMemo(() => {
    const eligibleApprovers = employees.filter(isApproverEligible);
    return [
      { value: '', label: 'Không chỉ định (Tự duyệt / Bản thảo)' },
      ...eligibleApprovers.map((emp: any) => {
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
    return employees.map((emp: any) => ({
      value: String(emp.id),
      label: emp.fullName || emp.username || 'Nhân sự',
      subLabel: emp.email || (emp.code ? `Mã: ${emp.code}` : undefined),
    }));
  }, [employees]);

  const departmentOptions = useMemo(() => {
    return departments.map((dept: any) => ({
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
              label="Mã văn bản"
              fullWidth
              placeholder="Mã tài liệu"
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
              label="Thư mục"
              fullWidth
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
              label="Ngày bắt đầu hiệu lực"
              fullWidth
              value={effectiveDateVal}
              onChange={(e) => setValue('effectiveDate', e.target.value)}
            />
          </div>

          <div>
            <Input
              type="date"
              label="Ngày hết hiệu lực"
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
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditDocumentModal;
