'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, Button } from '@/components';
import { Article } from '@/types/news';

interface NewsDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
  onConfirm: (id: number) => void;
  isLoading: boolean;
}

export const NewsDeleteModal: React.FC<NewsDeleteModalProps> = ({
  isOpen,
  onClose,
  article,
  onConfirm,
  isLoading,
}) => {
  if (!article) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      size="sm"
      title={
        <div className="flex items-center gap-2 text-rose-600 font-semibold text-base">
          <AlertTriangle size={20} />
          <span>Xác nhận xoá bài viết</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg h-9 px-4"
          >
            Hủy bỏ
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onConfirm(article.id)}
            loading={isLoading}
            disabled={isLoading}
            className="rounded-lg h-9 px-4 font-medium"
          >
            Xoá bài viết
          </Button>
        </div>
      }
    >
      <div className="py-2 text-slate-700 text-sm leading-relaxed">
        <p>
          Bạn có chắc chắn muốn xoá bài viết sau khỏi hệ thống?
        </p>
        <div className="my-3 p-3 bg-rose-50/70 border border-rose-100 rounded-lg text-rose-900 font-medium text-xs sm:text-sm">
          {article.title}
        </div>
        <p className="text-xs text-slate-400">
          * Thao tác này sẽ xoá vĩnh viễn bài viết cùng các bình luận và thẻ liên quan. Bạn không thể hoàn tác.
        </p>
      </div>
    </Modal>
  );
};

export default NewsDeleteModal;

