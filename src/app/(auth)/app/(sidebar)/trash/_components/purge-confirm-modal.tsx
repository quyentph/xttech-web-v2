'use client';

import React from 'react';
import { Modal, Button } from '@/components';
import type { TrashItem } from '@/types';

interface PurgeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: TrashItem | null;
  items?: TrashItem[] | null;
  onConfirm: () => void;
  loading?: boolean;
}

export const PurgeConfirmModal: React.FC<PurgeConfirmModalProps> = ({
  isOpen,
  onClose,
  item,
  items,
  onConfirm,
  loading = false,
}) => {
  const isMultiple = Boolean(items && items.length > 0);
  if (!item && !isMultiple) return null;

  const isFolder = item?.itemType === 'folder';
  const itemName = item?.title || (item as any)?.name || (item as any)?.fileName || (item as any)?.folder_name || '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isMultiple ? `Xác nhận xóa vĩnh viễn ${items!.length} mục` : 'Xác nhận xóa'}
      className="m-2 max-w-md w-full"
    >
      <div className="flex flex-col gap-2 py-2">
        {isMultiple ? (
          <>
            <p className="text-gray-600 text-sm leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn{' '}
              <strong className="text-gray-900 font-semibold">{items!.length} mục đã chọn</strong>?
            </p>
            <div className="max-h-36 overflow-y-auto rounded-md bg-slate-50 p-2 border border-slate-200 text-xs text-slate-700 divide-y divide-slate-100">
              {items!.slice(0, 5).map((it, idx) => {
                const name = it.title || (it as any).name || (it as any).fileName || (it as any).folder_name || 'Mục';
                return (
                  <div key={idx} className="py-1 flex items-center gap-1.5 truncate">
                    <span className="text-slate-400 font-mono text-[11px]">&bull;</span>
                    <span className="truncate">{name}</span>
                  </div>
                );
              })}
              {items!.length > 5 && (
                <div className="pt-1 text-slate-400 italic">
                  ... và {items!.length - 5} mục khác
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa vĩnh viễn {isFolder ? 'thư mục' : 'tài liệu'}{' '}
            <strong className="text-gray-900 font-semibold">{itemName}</strong>?
          </p>
        )}
        <p className="text-xs text-rose-500 font-medium">
          * Hành động này không thể hoàn tác. Dữ liệu và các tệp liên quan sẽ bị xóa vĩnh viễn khỏi hệ thống.
        </p>
      </div>

      <div className="flex gap-3 justify-end w-full mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={onConfirm}
          loading={loading}
        >
          Xác nhận xóa
        </Button>
      </div>
    </Modal>
  );
};
