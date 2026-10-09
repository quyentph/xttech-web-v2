'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Select } from '@/components';
import {
  shareDocumentCategory,
  getDocumentCategoryShares,
  revokeDocumentCategoryShare,
} from '@/actions/document';
import { getEmployees } from '@/actions/employee';
import { getDepartments } from '@/actions/department';
import type { DocumentCategory, FolderShare } from '@/types';
import { useAuthStore } from '@/stores';
import toast from 'react-hot-toast';
import {
  Share2,
  Users,
  Building2,
  User,
  Trash2,
  Eye,
  Edit3,
  Check,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { cn } from '@/utils';

interface ShareFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: DocumentCategory | null;
  onSuccess?: () => void;
}

export const ShareFolderModal: React.FC<ShareFolderModalProps> = ({
  isOpen,
  onClose,
  folder,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const [shareTarget, setShareTarget] = useState<'user' | 'department'>('user');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revokingId, setRevokingId] = useState<number | string | null>(null);
  const [userSearchText, setUserSearchText] = useState('');

  // 1. Fetch current shares of folder
  const {
    data: shares = [],
    isLoading: isLoadingShares,
    refetch: refetchShares,
  } = useQuery<FolderShare[]>({
    queryKey: ['document-category-shares', folder?.id],
    queryFn: () => (folder ? getDocumentCategoryShares(folder.id) : Promise.resolve([])),
    enabled: Boolean(isOpen && folder?.id),
  });

  // 2. Fetch Employees list
  const { data: employeesData } = useQuery({
    queryKey: ['users', 'share-options'],
    queryFn: () => getEmployees({ limit: 200 }),
    enabled: isOpen,
  });

  // 3. Fetch Departments list
  const { data: departmentsData } = useQuery({
    queryKey: ['departments', 'share-options'],
    queryFn: () => getDepartments({ limit: 100 }),
    enabled: isOpen,
  });

  const employees = React.useMemo(() => {
    if (Array.isArray(employeesData?.items)) return employeesData.items;
    if (Array.isArray(employeesData)) return employeesData;
    return [];
  }, [employeesData]);

  const departments = React.useMemo(() => {
    const raw = (departmentsData as any)?.data ?? departmentsData;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  }, [departmentsData]);

  // Reset states on open/close
  useEffect(() => {
    if (isOpen) {
      setSelectedUserId('');
      setSelectedDepartmentId('');
      setPermission('view');
      setUserSearchText('');
    }
  }, [isOpen, folder?.id]);

  // Filter employees by search text
  const filteredEmployees = React.useMemo(() => {
    if (!userSearchText.trim()) return employees;
    const term = userSearchText.toLowerCase();
    return employees.filter(
      (emp: any) =>
        emp.fullName?.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term) ||
        emp.username?.toLowerCase().includes(term)
    );
  }, [employees, userSearchText]);

  // Handle Share Submit
  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folder) return;

    if (shareTarget === 'user' && !selectedUserId) {
      toast.error('Vui lòng chọn nhân sự để chia sẻ');
      return;
    }

    if (shareTarget === 'department' && !selectedDepartmentId) {
      toast.error('Vui lòng chọn phòng ban để chia sẻ');
      return;
    }

    try {
      setIsSubmitting(true);
      await shareDocumentCategory(folder.id, {
        userId: shareTarget === 'user' ? selectedUserId : null,
        departmentId: shareTarget === 'department' ? Number(selectedDepartmentId) : null,
        permission,
      });

      toast.success(
        shareTarget === 'user'
          ? 'Đã chia sẻ thư mục cho nhân sự thành công'
          : 'Đã chia sẻ thư mục cho phòng ban thành công'
      );

      // Reset selection
      setSelectedUserId('');
      setSelectedDepartmentId('');
      setUserSearchText('');

      // Refetch
      refetchShares();
      queryClient.invalidateQueries({ queryKey: ['document-categories'] });
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi chia sẻ thư mục');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Revoke Share
  const handleRevoke = async (shareId: number | string, name: string) => {
    if (!folder) return;
    try {
      setRevokingId(shareId);
      await revokeDocumentCategoryShare(folder.id, shareId);
      toast.success(`Đã hủy quyền chia sẻ của "${name}"`);
      refetchShares();
      queryClient.invalidateQueries({ queryKey: ['document-categories'] });
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi thu hồi quyền chia sẻ');
    } finally {
      setRevokingId(null);
    }
  };

  if (!folder) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="p-0 overflow-hidden rounded-2xl"
    >
      <div className="flex flex-col select-none">
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Share2 size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
              Chia sẻ thư mục &quot;{folder.name}&quot;
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cấp quyền xem hoặc sửa cho nhân sự hoặc phòng ban khác
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Target Tabs: Cá nhân vs Phòng ban */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setShareTarget('user')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                shareTarget === 'user'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <User size={15} />
              <span>Cá nhân (Nhân sự)</span>
            </button>

            <button
              type="button"
              onClick={() => setShareTarget('department')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                shareTarget === 'department'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Building2 size={15} />
              <span>Phòng ban</span>
            </button>
          </div>

          {/* Form thêm người / phòng ban chia sẻ */}
          <form onSubmit={handleShareSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Lựa chọn đối tượng */}
              <div className="flex-1 min-w-0">
                {shareTarget === 'user' ? (
                  <div className="relative">
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full h-10 px-3 pr-8 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                    >
                      <option value="">-- Chọn nhân sự muốn chia sẻ --</option>
                      {filteredEmployees.map((emp: any) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName || emp.username} {emp.email ? `(${emp.email})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedDepartmentId}
                      onChange={(e) => setSelectedDepartmentId(e.target.value)}
                      className="w-full h-10 px-3 pr-8 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                    >
                      <option value="">-- Chọn phòng ban muốn chia sẻ --</option>
                      {departments.map((dept: any) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} {dept.code ? `[${dept.code}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Lựa chọn quyền hạn (view vs edit) */}
              <div className="w-full sm:w-44">
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
                  className="w-full h-10 px-3 pr-8 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  <option value="view">Người xem (Chỉ xem & tải)</option>
                  <option value="edit">Người sửa (Upload & sửa)</option>
                </select>
              </div>

              {/* Nút gửi Chia sẻ */}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={isSubmitting}
                className="h-10 px-4 rounded-xl shrink-0 font-medium"
              >
                Chia sẻ
              </Button>
            </div>
          </form>

          {/* Danh sách những người đang có quyền truy cập */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Những người có quyền truy cập</span>
              <span className="text-[11px] font-normal text-slate-400">
                {shares.length + 1} người / nhóm
              </span>
            </h4>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {/* 1. Hàng Chủ sở hữu (Owner) */}
              <div className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {currentUser?.fullName?.charAt(0) || 'T'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-900 truncate">
                      {currentUser?.fullName || 'Tôi'} (Bạn)
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">
                      {currentUser?.email || 'Chủ sở hữu thư mục'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    Chủ sở hữu
                  </span>
                </div>
              </div>

              {/* 2. Danh sách cộng tác viên đang được share */}
              {isLoadingShares ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Đang tải danh sách cộng tác viên...
                </div>
              ) : shares.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 italic">
                  Chưa chia sẻ thư mục này cho ai khác.
                </div>
              ) : (
                shares.map((share) => {
                  const isDept = Boolean(share.departmentId || share.department);
                  const displayName = isDept
                    ? share.department?.name || `Phòng ban #${share.departmentId}`
                    : share.user?.fullName || share.user?.email || `Nhân sự #${share.userId}`;
                  const subText = isDept
                    ? 'Toàn bộ nhân viên trong phòng ban'
                    : share.user?.email || 'Nhân sự chỉ định';
                  const isEditing = share.permission === 'edit';

                  return (
                    <div
                      key={share.id}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isDept ? (
                          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Building2 size={16} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {displayName.charAt(0)}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-slate-900 truncate flex items-center gap-1.5">
                            {displayName}
                            {isDept && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-primary/10 text-primary font-medium">
                                Phòng ban
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate">
                            {subText}
                          </span>
                        </div>
                      </div>

                      {/* Quyền & Nút Gỡ quyền */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-full text-[11px] font-medium border flex items-center gap-1',
                            isEditing
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          )}
                        >
                          {isEditing ? <Edit3 size={11} /> : <Eye size={11} />}
                          <span>{isEditing ? 'Người chỉnh sửa' : 'Người xem'}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRevoke(share.id, displayName)}
                          disabled={revokingId === share.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Thu hồi quyền chia sẻ"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Người được cấp quyền sẽ thấy thư mục này trong danh mục tài liệu của họ.
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl px-5 h-9 font-medium"
          >
            Xong
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareFolderModal;
