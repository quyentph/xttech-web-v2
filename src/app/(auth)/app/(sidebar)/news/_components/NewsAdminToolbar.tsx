'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, UserCheck } from 'lucide-react';
import { Button, Input } from '@/components';
import { ArticleStatus, Category, UserRole } from '@/types/news';

interface NewsAdminToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: ArticleStatus | 'all';
  onStatusChange: (status: ArticleStatus | 'all') => void;
  categoryFilter: string | number;
  onCategoryChange: (cat: string | number) => void;
  categories: Category[];
  onOpenCreate: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const NewsAdminToolbar: React.FC<NewsAdminToolbarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  categories,
  onOpenCreate,
  currentRole,
  onRoleChange,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce 300ms cho ô tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  const STATUS_OPTIONS: { label: string; value: ArticleStatus | 'all' }[] = [
    { label: 'Tất cả trạng thái', value: 'all' },
    { label: 'Đã xuất bản (Published)', value: 'published' },
    { label: 'Chờ duyệt (Pending)', value: 'pending' },
    { label: 'Bản nháp (Draft)', value: 'draft' },
    { label: 'Đã lưu trữ (Archived)', value: 'archived' },
  ];

  return (
    <div className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Ô tìm kiếm có debounce */}
        <div className="relative flex-1 max-w-md">
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề bài viết..."
            className="pl-9 pr-4 h-9 text-xs sm:text-sm rounded-lg"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Nút hành động & Phân quyền Test */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Giả lập đổi vai trò (Role Switcher) để test phân quyền */}
          <div className="flex items-center gap-1.5 bg-slate-100/90 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
            <UserCheck size={14} className="text-primary shrink-0" />
            <span className="text-slate-500 font-medium">Vai trò:</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="admin">Quản trị viên (Admin)</option>
              <option value="editor">Biên tập viên (Editor)</option>
              <option value="author">Tác giả (Author)</option>
            </select>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreate}
            leftIcon={<Plus size={16} />}
            className="rounded-lg px-3.5 h-9 font-medium"
          >
            Thêm bài viết
          </Button>
        </div>
      </div>

      {/* Dòng bộ lọc: Trạng thái & Chuyên mục */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mr-1">
          <Filter size={13} />
          <span>Bộ lọc:</span>
        </div>

        {/* Lọc trạng thái */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as ArticleStatus | 'all')}
          className="h-8 px-2.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 outline-none hover:border-slate-300 focus:border-primary cursor-pointer"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Lọc chuyên mục */}
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="h-8 px-2.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 outline-none hover:border-slate-300 focus:border-primary cursor-pointer"
        >
          <option value="all">Tất cả chuyên mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default NewsAdminToolbar;

