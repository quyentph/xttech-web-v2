'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Textarea } from '@/components';
import { createDocumentCategory } from '@/actions/document';
import { generateSlugCode } from '../_utils/doc-helpers';
import toast from 'react-hot-toast';
import { FolderPlus } from 'lucide-react';
import type { DocumentCategory } from '@/types';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: number | null;
  parentFolder?: DocumentCategory | null;
  onSuccess: () => void;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  parentId = null,
  parentFolder = null,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isManualCode, setIsManualCode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setCode('');
      setDescription('');
      setIsManualCode(false);
    }
  }, [isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isManualCode) {
      setCode(generateSlugCode(val, 'DIR'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên thư mục');
      return;
    }

    const finalCode = (code.trim() || generateSlugCode(name, 'DIR')).toUpperCase();

    try {
      setLoading(true);
      await createDocumentCategory({
        name: name.trim(),
        code: finalCode,
        description: description.trim() || undefined,
        parentId: parentId || null,
      });
      toast.success('Đã tạo thư mục thành công!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Không thể tạo thư mục');
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
          <FolderPlus className="text-primary" size={20} />
          <span>Tạo thư mục mới</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Tạo thư mục
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {parentFolder && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-between">
            <span>Vị trí lưu:</span>
            <span className="font-semibold text-slate-800">{parentFolder.name}</span>
          </div>
        )}

        <Input
          label="Tên thư mục *"
          required
          fullWidth
          placeholder="Ví dụ: Hồ sơ nghiệm thu 2026..."
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          autoFocus
        />

        <div>
          <Input
            label="Mã định danh (Code) *"
            required
            fullWidth
            placeholder="Ví dụ: HS_NT_2026"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setIsManualCode(true);
            }}
            className="font-mono uppercase"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Mã định danh viết hoa, không dấu, ngăn cách bằng dấu gạch dưới.
          </p>
        </div>

        <Textarea
          label="Mô tả mục đích (Tùy chọn)"
          fullWidth
          rows={3}
          placeholder="Mô tả nội dung tài liệu lưu trong thư mục này..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </form>
    </Modal>
  );
};
