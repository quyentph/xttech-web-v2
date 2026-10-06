'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Select } from '@/components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocumentCategoryShares, addDocumentCategoryShare, removeDocumentCategoryShare } from '@/actions/document';
import { getUsers } from '@/actions/user';
import { getDepartments } from '@/actions/department';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: { id: number; name: string } | null;
}

type ShareSubject = { type: 'user', id: string, name: string } | { type: 'department', id: number, name: string };

export default function ShareCategoryModal({ isOpen, onClose, category }: ShareCategoryModalProps) {
  const queryClient = useQueryClient();
  const [shareType, setShareType] = useState<'user' | 'department'>('user');
  const [selectedSubjects, setSelectedSubjects] = useState<ShareSubject[]>([]);
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revokingShareId, setRevokingShareId] = useState<number | null>(null);

  const { data: shares, isLoading: isLoadingShares } = useQuery({
    queryKey: ['category-shares', category?.id],
    queryFn: () => getDocumentCategoryShares(category!.id),
    enabled: !!category && isOpen,
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers({ limit: 100, offset: 0 }),
    enabled: isOpen,
  });

  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments({ limit: 100, offset: 0 }),
    enabled: isOpen,
  });

  const removeShareMutation = useMutation({
    mutationFn: (shareId: number) => 
      removeDocumentCategoryShare(category!.id, shareId),
    onSuccess: () => {
      toast.success('Đã thu hồi quyền chia sẻ');
      queryClient.invalidateQueries({ queryKey: ['category-shares', category?.id] });
      setRevokingShareId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra khi thu hồi quyền');
    }
  });

  const handleAddShare = async () => {
    if (selectedSubjects.length === 0) {
      toast.error('Vui lòng chọn đối tượng chia sẻ');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const promises = selectedSubjects.map(sub => 
        addDocumentCategoryShare(category!.id, { 
          userId: sub.type === 'user' ? sub.id : null, 
          departmentId: sub.type === 'department' ? sub.id : null, 
          permission 
        })
      );
      await Promise.all(promises);
      toast.success('Đã thêm quyền chia sẻ');
      queryClient.invalidateQueries({ queryKey: ['category-shares', category?.id] });
      setSelectedSubjects([]);
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi chia sẻ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableUsers = usersData?.items?.filter((u: any) => !selectedSubjects.find(s => s.type === 'user' && s.id === u.id)) || [];
  const usersOptions = availableUsers.map((user: any) => ({
    label: `${user.fullName} (${user.email})`,
    value: user.id
  })) || [];

  const availableDepartments = departmentsData?.items?.filter((d: any) => !selectedSubjects.find(s => s.type === 'department' && s.id === d.id)) || [];
  const deptOptions = availableDepartments.map((dept: any) => ({
    label: dept.name,
    value: String(dept.id) // Select value is expected to be string/number internally, but e.target.value comes as string usually
  })) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chia sẻ thư mục: ${category?.name || ''}`}
      size="lg"
    >
      <div className="flex flex-col gap-4 p-1">
        <div className="flex items-end gap-2">
          <div className="w-32">
            <Select
              label="Đối tượng"
              options={[
                { label: 'Nhân viên', value: 'user' },
                { label: 'Phòng ban', value: 'department' }
              ]}
              value={shareType}
              onChange={(e: any) => setShareType(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Select
              label={shareType === 'user' ? 'Chọn nhân viên' : 'Chọn phòng ban'}
              placeholder="Tìm kiếm..."
              options={shareType === 'user' ? usersOptions : deptOptions}
              value=""
              onChange={(e: any) => {
                const val = e.target.value;
                if (!val) return;
                
                if (shareType === 'user') {
                  const u = usersData?.items?.find((user: any) => user.id === val);
                  if (u && !selectedSubjects.find(s => s.type === 'user' && s.id === u.id)) {
                    setSelectedSubjects([...selectedSubjects, { type: 'user', id: u.id, name: u.fullName }]);
                  }
                } else {
                  const d = departmentsData?.items?.find((dept: any) => String(dept.id) === val);
                  if (d && !selectedSubjects.find(s => s.type === 'department' && s.id === d.id)) {
                    setSelectedSubjects([...selectedSubjects, { type: 'department', id: d.id, name: d.name }]);
                  }
                }
              }}
            />
          </div>
          <div className="w-28">
            <Select
              label="Quyền"
              options={[
                { label: 'Chỉ xem', value: 'view' },
                { label: 'Chỉnh sửa', value: 'edit' }
              ]}
              value={permission}
              onChange={(e: any) => setPermission(e.target.value)}
            />
          </div>
          <Button 
            className="mb-0.5" 
            onClick={handleAddShare} 
            loading={isSubmitting}
            disabled={selectedSubjects.length === 0}
          >
            Thêm
          </Button>
        </div>

        {selectedSubjects.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {selectedSubjects.map(sub => (
              <div 
                key={`${sub.type}-${sub.id}`} 
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border ${
                  sub.type === 'user' 
                    ? 'bg-blue-50 text-blue-700 border-blue-100' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}
              >
                <span className="font-medium">
                  {sub.type === 'department' && '🏢 '}
                  {sub.name}
                </span>
                <button 
                  type="button"
                  onClick={() => setSelectedSubjects(prev => prev.filter(s => s.id !== sub.id || s.type !== sub.type))} 
                  className={`transition-colors ${
                    sub.type === 'user' ? 'text-blue-400 hover:text-red-500' : 'text-emerald-400 hover:text-red-500'
                  }`}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Danh sách đã chia sẻ</h4>
          {isLoadingShares ? (
            <div className="text-sm text-slate-500">Đang tải...</div>
          ) : shares && shares.length > 0 ? (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {shares.map((share: any) => {
                // Because API might not return the names depending on whether it's user or department
                const displayName = share.department
                  ? `🏢 Phòng: ${share.department.name}`
                  : (share.user ? share.user.fullName : (share.departmentId ? `Phòng ban ${share.departmentId}` : share.userId));

                return (
                  <div key={share.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{displayName}</p>
                      <p className="text-xs text-slate-500">Quyền: {share.permission === 'edit' ? 'Chỉnh sửa' : 'Chỉ xem'}</p>
                    </div>
                    <button
                      onClick={() => setRevokingShareId(share.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Thu hồi quyền"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-slate-500 italic text-center py-4 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
              Chưa chia sẻ với ai
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
          <Button type="button" onClick={onClose}>
            Đóng
          </Button>
        </div>

        <Modal
          isOpen={revokingShareId !== null}
          onClose={() => setRevokingShareId(null)}
          title="Xác nhận thu hồi"
          size="sm"
        >
          <div className="p-1">
            <p className="text-sm text-slate-600 mb-6">
              Bạn có chắc chắn muốn thu hồi quyền truy cập của người này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setRevokingShareId(null)} disabled={removeShareMutation.isPending}>
                Hủy
              </Button>
              <Button 
                type="button" 
                color="danger"
                className="bg-red-500 hover:bg-red-600 text-white border-red-500" 
                onClick={() => {
                  if (revokingShareId !== null) {
                    removeShareMutation.mutate(revokingShareId);
                  }
                }} 
                loading={removeShareMutation.isPending}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Modal>
  );
}
