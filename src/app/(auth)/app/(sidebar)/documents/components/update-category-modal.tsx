'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Input, Textarea, Button } from '@/components';
import { useMutation } from '@tanstack/react-query';
import { updateDocumentCategory } from '@/actions/document';
import toast from 'react-hot-toast';

interface UpdateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: { id: number; name: string; code?: string; description?: string } | null;
}

export default function UpdateCategoryModal({ isOpen, onClose, onSuccess, category }: UpdateCategoryModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
    }
  }, [category]);

  const handleClose = () => {
    onClose();
  };

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; payload: { name: string; description?: string } }) => 
      updateDocumentCategory(data.id, data.payload),
    onSuccess: () => {
      toast.success('Cập nhật thư mục thành công');
      onSuccess();
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật thư mục');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên thư mục');
      return;
    }
    if (!category) return;

    updateMutation.mutate({
      id: category.id,
      payload: { name, description }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cập nhật thư mục"
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-1">
        <Input
          label="Tên thư mục *"
          placeholder="Nhập tên thư mục"
          value={name}
          onChange={(e: any) => setName(e.target.value)}
        />

        <Textarea
          label="Mô tả"
          placeholder="Mô tả mục đích của thư mục..."
          value={description}
          onChange={(e: any) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={handleClose}>
            Hủy bỏ
          </Button>
          <Button type="submit" loading={updateMutation.isPending}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
}
