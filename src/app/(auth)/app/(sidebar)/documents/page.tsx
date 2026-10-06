'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getDocuments, getDocumentCategoriesTree } from '@/actions/document';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import StatCards from './components/stat-cards';
import CreateCategoryModal from './components/create-document-modal';
import { FileText, Eye, MoreVertical, Plus, Folder as FolderIcon } from 'lucide-react';
import { Button, TableData } from '@/components';
import { useQueryParam } from '@/hooks';

export default function DocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  const shared = searchParams.get('shared');
  const shareScope = searchParams.get('shareScope');
  const routeStatus = searchParams.get('status');

  const [search, setSearch] = useQueryParam('search');
  const [status, setStatus] = useQueryParam('status');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isRootMyDocuments = !categoryId && !shared && !routeStatus && !shareScope;

  const queryClient = useQueryClient();

  // Fetch Categories Tree
  const { data: categoriesData } = useQuery({
    queryKey: ['document-categories'],
    queryFn: () => getDocumentCategoriesTree(),
  });

  // Find sub-folders to display
  let currentFolders: any[] = [];
  if (categoriesData) {
    const rootFolders = categoriesData.myFolders || categoriesData.data?.myFolders || [];
    
    if (categoryId) {
      // Find the folder in tree
      const findFolder = (folders: any[], id: number): any => {
        for (const f of folders) {
          if (f.id === id) return f;
          if (f.children) {
            const found = findFolder(f.children, id);
            if (found) return found;
          }
        }
        return null;
      };
      const currentFolder = findFolder(rootFolders, Number(categoryId));
      currentFolders = currentFolder?.children || [];
    } else if (!shared && !routeStatus) {
      // Root view
      currentFolders = rootFolders;
    }
  }

  // Sort folders to show newest first (so created items go to the top)
  currentFolders.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  // Define fetcher for TableData
  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    const params: any = { offset, limit };
    if (search) params.search = search;
    if (status) params.status = status;
    
    if (categoryId) params.categoryId = Number(categoryId);
    if (shared) params.shared = true;
    if (routeStatus) params.status = routeStatus;
    if (shareScope) params.shareScope = shareScope;

    const res = await getDocuments(params);
    return {
      items: res.data || [],
      meta: {
        total: res.total || 0,
        offset,
        limit,
        next: (offset + limit) < (res.total || 0),
      }
    };
  };

  const columns = [
    {
      key: 'code',
      label: 'Mã VB',
      minWidth: '120px',
      cell: (row: any) => <span className="font-medium text-slate-900">{row.code || '---'}</span>,
    },
    {
      key: 'title',
      label: 'Tiêu đề',
      minWidth: '250px',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-primary/70 shrink-0" />
          <span className="text-sm text-slate-700 font-medium line-clamp-1">{row.title}</span>
        </div>
      ),
    },
    {
      key: 'version',
      label: 'Phiên bản',
      minWidth: '100px',
      cell: (row: any) => <span className="text-slate-500">{row.version || '1.0'}</span>,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '120px',
      cell: (row: any) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
          {row.status || 'Chờ duyệt'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      minWidth: '80px',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <button className="p-1 text-slate-400 hover:text-primary transition-colors" title="Xem chi tiết">
            <Eye size={16} />
          </button>
          <button className="p-1 text-slate-400 hover:text-slate-700 transition-colors" title="Thêm">
            <MoreVertical size={16} />
          </button>
        </div>
      ),
    },
  ];

  const renderCard = (row: any, index: number) => (
    <div key={row.id || index} className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-primary/70 shrink-0" />
          <span className="font-bold text-gray-900 line-clamp-2">{row.title}</span>
        </div>
        <button className="p-1 text-slate-400 hover:text-primary transition-colors shrink-0">
          <MoreVertical size={16} />
        </button>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="font-mono bg-gray-50 px-2 py-0.5 rounded">{row.code || '---'}</span>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
          {row.status || 'Chờ duyệt'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-slate-50 min-h-full">
      <div className="mb-6">
        <StatCards />
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">
          {categoryId ? 'Thư mục đã chọn' : shared ? 'Được chia sẻ với tôi' : routeStatus === 'published' ? 'Văn bản công ty' : 'Tài liệu của tôi'}
        </h2>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="h-9 text-sm"
        >
          Tạo thư mục
        </Button>
      </div>
      
      {/* Thư mục con */}
      {currentFolders.length > 0 && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {currentFolders.map((folder: any) => (
            <div 
              key={folder.id} 
              onClick={() => router.push(`/app/documents?categoryId=${folder.id}`)}
              className="group flex items-center justify-between p-3.5 bg-slate-100/70 hover:bg-slate-200/60 border border-slate-200/80 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <FolderIcon className="text-slate-600 shrink-0 fill-slate-500/20" size={20} />
                <span className="font-medium text-sm text-slate-700 truncate">{folder.name}</span>
              </div>
              <button 
                className="p-1 text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  // Menu hành động thư mục (sửa/xoá)
                }}
              >
                <MoreVertical size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bảng danh sách tài liệu (Ẩn ở trang chủ Tài liệu của tôi) */}
      {!isRootMyDocuments && (
        <div>
          <TableData<any>
            queryKey={['documents', categoryId, shared, routeStatus, shareScope, search, status]}
            fetcher={fetcher}
            columns={columns}
            renderCard={renderCard}
            search={{
              placeholder: 'Tìm kiếm tài liệu...',
              value: search,
              onChange: setSearch,
              className: 'w-full md:w-80',
            }}
            filters={[
              {
                label: 'Trạng thái',
                value: status,
                onChange: setStatus,
                options: [
                  { value: undefined, label: 'Tất cả' },
                  { value: 'pending', label: 'Đang chờ duyệt' },
                  { value: 'approved', label: 'Đã phê duyệt' },
                  { value: 'rejected', label: 'Bị từ chối' },
                  { value: 'draft', label: 'Bản nháp' },
                ],
              },
            ]}
          />
        </div>
      )}

      <CreateCategoryModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['document-categories'] });
        }}
      />
    </div>
  );
}