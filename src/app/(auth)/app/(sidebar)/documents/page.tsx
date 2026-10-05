'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDocuments } from '@/actions';
import ItemList from './components/item-list';

export default function DocumentsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: () => getDocuments(),
  });

  return (
    <div className="p-6 bg-white min-h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-800">Tài liệu của tôi</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý và xem các tài liệu bạn có quyền truy cập</p>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-4 text-red-600 bg-red-50 rounded-lg">
          Đã có lỗi xảy ra khi tải danh sách tài liệu.
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          Tệp đề xuất
        </h2>
        <ItemList 
          items={data?.items || []} 
          loading={isLoading} 
          onItemClick={(item) => console.log('Clicked', item)}
        />
      </div>
    </div>
  );
}