'use client';

import React from 'react';
import Item from './item';
import type { Document } from '@/types/document';
import { Empty, Spin } from 'antd';

interface ItemListProps {
  items: any[];
  loading?: boolean;
  onItemClick?: (item: any) => void;
}

const ItemList = ({ items, loading, onItemClick }: ItemListProps) => {
  if (loading) {
    return (
      <div className="w-full h-40 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <Empty description="Không có tài liệu nào" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {items.map((item) => (
        <Item key={item.id} data={item} onClick={onItemClick} />
      ))}
    </div>
  );
};

export default ItemList;