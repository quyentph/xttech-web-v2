'use client';

import React from 'react';
import { MoreVertical, Folder } from 'lucide-react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import type { Document } from '@/types/document';

interface ItemProps {
  data: Document;
  onClick?: (data: Document) => void;
}

const Item = ({ data, onClick }: ItemProps) => {
  const items: MenuProps['items'] = [
    { key: '1', label: 'Xem chi tiết' },
    { key: '2', label: 'Chia sẻ' },
    { type: 'divider' },
    { key: '3', label: 'Xóa', danger: true },
  ];

  return (
    <div
      className="group flex items-center justify-between p-3 rounded-xl bg-[#f0f4f9] hover:bg-[#e4e9f1] transition-colors cursor-pointer"
      onClick={() => onClick?.(data)}
    >
      <div className="flex items-center gap-3 overflow-hidden flex-1 mr-2">
        <Folder size={18} className="text-gray-700 flex-shrink-0" fill="currentColor" />
        <span className="font-medium text-sm text-gray-800 truncate" title={data.title || data.code}>
          {data.title || data.code}
        </span>
      </div>
      <Dropdown menu={{ items }} trigger={['click']}>
        <button 
          className="p-1.5 rounded-full hover:bg-gray-300 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical size={16} className="text-gray-600" />
        </button>
      </Dropdown>
    </div>
  );
};

export default Item;