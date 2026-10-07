'use client';

import React from 'react';
import { Modal, Button } from '@/components';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={
        <div className="flex items-center gap-2 text-rose-600">
          <AlertTriangle size={18} />
          <span>{title}</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            Xác nhận xóa
          </Button>
        </div>
      }
    >
      <div className="py-2 text-xs text-slate-600 leading-relaxed">
        {description}
      </div>
    </Modal>
  );
};
