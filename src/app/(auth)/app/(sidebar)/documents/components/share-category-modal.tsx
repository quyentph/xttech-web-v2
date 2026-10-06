'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Select } from '@/components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocumentCategoryShares, addDocumentCategoryShare, removeDocumentCategoryShare } from '@/actions/document';
import { getUsers } from '@/actions/user';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: { id: number; name: string } | null;
}

export default function ShareCategoryModal({ isOpen, onClose, category }: ShareCategoryModalProps) {
  const queryClient = useQueryClient();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
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
    if (selectedUserIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 người dùng');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const promises = selectedUserIds.map(userId => 
        addDocumentCategoryShare(category!.id, { userId, departmentId: null, permission })
      );
      await Promise.all(promises);
      toast.success('Đã thêm quyền chia sẻ');
      queryClient.invalidateQueries({ queryKey: ['category-shares', category?.id] });
      setSelectedUserIds([]);
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi chia sẻ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableUsers = usersData?.items?.filter((u: any) => !selectedUserIds.includes(u.id)) || [];
  const usersOptions = availableUsers.map((user: any) => ({
    label: `${user.fullName} (${user.email})`,
    value: user.id
  })) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chia sẻ thư mục: ${category?.name || ''}`}
      size="md"
    >
      <div className="flex flex-col gap-4 p-1">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Select
              label="Chọn người dùng"
              placeholder="Tìm kiếm người dùng..."
              options={usersOptions}
              value=""
              onChange={(e: any) => {
                const val = e.target.value;
                if (val && !selectedUserIds.includes(val)) {
                  setSelectedUserIds([...selectedUserIds, val]);
                }
              }}
            />
          </div>
          <div className="w-32">
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
            disabled={selectedUserIds.length === 0}
          >
            Thêm
          </Button>
        </div>

        {selectedUserIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {selectedUserIds.map(id => {
              const u = usersData?.items?.find((user: any) => user.id === id);
              return (
                <div key={id} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs px-2.5 py-1.5 rounded-md border border-blue-100">
                  <span className="font-medium">{u?.fullName || id}</span>
                  <button 
                    type="button"
                    onClick={() => setSelectedUserIds(prev => prev.filter(uid => uid !== id))} 
                    className="text-blue-400 hover:text-red-500 transition-colors"
                  >
                    &times;
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Danh sách đã chia sẻ</h4>
          {isLoadingShares ? (
            <div className="text-sm text-slate-500">Đang tải...</div>
          ) : shares && shares.length > 0 ? (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {shares.map((share: any) => (
                <div key={share.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{share.user?.fullName || share.userId}</p>
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
              ))}
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
