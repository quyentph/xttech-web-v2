'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Button, Input, Textarea } from '@/components';
import { updateDocumentCategory } from '@/actions/document';
import toast from 'react-hot-toast';
import { Edit2 } from 'lucide-react';
import type { DocumentCategory } from '@/types';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface EditFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: DocumentCategory | null;
  onSuccess: () => void;
}

// Validation schema dùng Zod theo chuẩn form-modal
const editFolderSchema = z.object({
  name: z.string().min(1, { message: 'Tên thư mục không được để trống' }),
  description: z.string().optional(),
});

type EditFolderFormValues = z.infer<typeof editFolderSchema>;

export const EditFolderModal: React.FC<EditFolderModalProps> = ({
  isOpen,
  onClose,
  folder,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditFolderFormValues>({
    resolver: zodResolver(editFolderSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    register('name');
    register('description');
  }, [register]);

  useEffect(() => {
    if (folder && isOpen) {
      reset({
        name: folder.name || '',
        description: folder.description || '',
      });
    }
  }, [folder, isOpen, reset]);

  const nameVal = watch('name');
  const descVal = watch('description');

  const handleFormSubmit = async (data: EditFolderFormValues) => {
    if (!folder) return;

    try {
      setLoading(true);
      await updateDocumentCategory(folder.id, {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
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
      className="m-2 max-w-md w-full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4 text-xs">
        <div>
          <Input
            label="Tên thư mục *"
            placeholder="Tên thư mục..."
            fullWidth
            value={nameVal}
            onChange={(e) => setValue('name', e.target.value, { shouldValidate: true })}
            error={errors.name?.message}
            autoFocus
          />
        </div>

        <Textarea
          label="Mô tả mục đích"
          fullWidth
          rows={3}
          placeholder="Mô tả thư mục..."
          value={descVal}
          onChange={(e) => setValue('description', e.target.value)}
          error={errors.description?.message}
        />

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

