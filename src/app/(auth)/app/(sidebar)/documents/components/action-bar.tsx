'use client';

import React from 'react';
import { Search, Plus, RotateCw, Filter } from 'lucide-react';
import { Button, Input, Select } from '@/components';

interface ActionBarProps {
  search?: string;
  onSearchChange?: (val: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (val: string) => void;
  onAddClick?: () => void;
  onRefreshClick?: () => void;
  isRefreshing?: boolean;
}

export default function ActionBar({
  search = '',
  onSearchChange = () => {},
  statusFilter = 'all',
  onStatusFilterChange = () => {},
  onAddClick = () => {},
  onRefreshClick = () => {},
  isRefreshing = false
}: ActionBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3 items-center justify-between mb-4 w-full">
      <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto flex-1 items-center">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input 
            placeholder="Tìm kiếm tài liệu..." 
            value={search}
            onChange={(e: any) => onSearchChange(e.target.value)}
            className="w-full pl-10"
          />
        </div>
        <div className="w-full md:w-56">
          <Select 
            value={statusFilter}
            onChange={(e: any) => onStatusFilterChange(e.target.value)}
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'pending', label: 'Đang chờ duyệt' },
              { value: 'approved', label: 'Đã phê duyệt' },
              { value: 'rejected', label: 'Bị từ chối' },
              { value: 'draft', label: 'Bản nháp' },
            ]}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        <Button 
          variant="outline" 
          onClick={onRefreshClick}
          className="p-2 h-10 w-10 flex items-center justify-center shrink-0 border-gray-200 text-gray-500 hover:bg-gray-50"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
        <Button 
          onClick={onAddClick}
          leftIcon={<Plus className="w-4 h-4" />}
          className="h-10"
        >
          Tạo thư mục
        </Button>
      </div>
    </div>
  );
}