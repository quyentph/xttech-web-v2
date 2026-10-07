'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Textarea } from '@/components';
import { updateDocumentCategory } from '@/actions/document';
import toast from 'react-hot-toast';
import { Edit2 } from 'lucide-react';
import type { DocumentCategory } from '@/types';

interface EditFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: DocumentCategory | null;
  onSuccess: () => void;
}

export const EditFolderModal: React.FC<EditFolderModalProps> = ({
  isOpen,
  onClose,
  folder,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (folder) {
      setName(folder.name || '');
      setDescription(folder.description || '');
    }
  }, [folder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folder) return;
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên thư mục');
      return;
    }

    try {
      setLoading(true);
      await updateDocumentCategory(folder.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success('Đã cập nhật thư mục!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật thư mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <Edit2 className="text-primary" size={18} />
          <span>Đổi tên / Chỉnh sửa thư mục</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Lưu thay đổi
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Input
          label="Tên thư mục *"
          required
          fullWidth
          placeholder="Tên thư mục..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <Textarea
          label="Mô tả mục đích"
          fullWidth
          rows={3}
          placeholder="Mô tả thư mục..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </form>
    </Modal>
  );
};
