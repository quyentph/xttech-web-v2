'use client';

import React from 'react';
import { Modal, Button } from '@/components';
import { useMutation } from '@tanstack/react-query';
import { deleteDocumentCategory } from '@/actions/document';
import toast from 'react-hot-toast';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: { id: number; name: string } | null;
}

export default function DeleteCategoryModal({ isOpen, onClose, onSuccess, category }: DeleteCategoryModalProps) {
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDocumentCategory(id),
    onSuccess: () => {
      toast.success('Xóa thư mục thành công');
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra khi xóa thư mục');
    }
  });

  const handleDelete = () => {
    if (!category) return;
    deleteMutation.mutate(category.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận xóa"
      size="sm"
    >
      <div className="p-1">
        <p className="text-sm text-slate-600 mb-6">
          Bạn có chắc chắn muốn xóa thư mục <strong className="text-slate-800">{category?.name}</strong>? Hành động này không thể hoàn tác.
        </p>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={deleteMutation.isPending}>
            Hủy
          </Button>
          <Button 
            type="button" 
            color="danger"
            className="bg-red-500 hover:bg-red-600 text-white border-red-500" 
            onClick={handleDelete} 
            loading={deleteMutation.isPending}
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </Modal>
  );
}
