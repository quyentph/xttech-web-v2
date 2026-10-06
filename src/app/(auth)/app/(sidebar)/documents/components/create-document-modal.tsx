'use client';

import React, { useState } from 'react';
import { Modal, Input, Textarea, Button } from '@/components';
import { useMutation } from '@tanstack/react-query';
import { createDocumentCategory } from '@/actions/document';
import toast from 'react-hot-toast';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentId?: number | null; // Nếu đang đứng ở thư mục nào đó thì truyền parentId vào
}

export default function CreateCategoryModal({ isOpen, onClose, onSuccess, parentId = null }: CreateCategoryModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setName('');
    setCode('');
    setDescription('');
  };

  const handleClose = () => { 
    resetForm();
    onClose();
  };

  const createMutation = useMutation({
    mutationFn: (data: { name: string; code: string; description: string; parentId: number | null }) => 
      createDocumentCategory(data),
    onSuccess: () => {
      toast.success('Tạo thư mục thành công');
      onSuccess();
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra khi tạo thư mục');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên thư mục');
      return;
    }
    if (!code.trim()) {
      toast.error('Vui lòng nhập mã thư mục');
      return;
    }

    createMutation.mutate({
      name,
      code,
      description,
      parentId
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tạo mới thư mục (Category)"
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-1">
        <Input
          label="Tên thư mục *"
          placeholder="Nhập tên thư mục (VD: Hồ sơ nghiệm thu)"
          value={name}
          onChange={(e: any) => setName(e.target.value)}
        />

        <Input
          label="Mã thư mục *"
          placeholder="Nhập mã định danh (VD: HS_NT)"
          value={code}
          onChange={(e: any) => setCode(e.target.value)}
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
          <Button type="submit" loading={createMutation.isPending}>
            Tạo thư mục
          </Button>
        </div>
      </form>
    </Modal>
  );
}
