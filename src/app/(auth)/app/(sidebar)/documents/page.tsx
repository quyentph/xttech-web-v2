'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks';
import {
  getDocumentCategoryTree,
  getDocuments,
  deleteDocumentCategory,
  deleteDocument,
} from '@/actions/document';
import type { DocumentCategory, DocumentItem } from '@/types';
import { DOCUMENT_TYPE_MAP, DOCUMENT_STATUS_MAP } from '@/types';

// Components
import { FolderCard } from './_components/folder-card';
import { FolderTable } from './_components/folder-table';
import { FileCard } from './_components/file-card';
import { FileTable } from './_components/file-table';
import { BreadcrumbBar } from './_components/breadcrumb-bar';
import { CreateFolderModal } from './_components/create-folder-modal';
import { EditFolderModal } from './_components/edit-folder-modal';
import { CreateDocumentModal } from './_components/create-document-modal';
import { DocumentDetailModal } from './_components/document-detail-modal';
import { DeleteConfirmModal } from './_components/delete-confirm-modal';
import { Button, Select, TableSearch } from '@/components';

// Icons
import {
  FolderPlus,
  Upload,
  LayoutGrid,
  List,
  Folder,
  FileText,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyDocumentsPage() {
  // Navigation & View States
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [status, setStatus] = useState('');

  // Options for existing Select component
  const documentTypeOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả loại văn bản' },
      ...Object.entries(DOCUMENT_TYPE_MAP).map(([key, item]) => ({
        value: key,
        label: item.label,
      })),
    ],
    []
  );

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả trạng thái' },
      ...Object.entries(DOCUMENT_STATUS_MAP).map(([key, item]) => ({
        value: key,
        label: item.label,
      })),
    ],
    []
  );

  // Modals
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [editFolderOpen, setEditFolderOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<DocumentCategory | null>(null);

  const [createDocOpen, setCreateDocOpen] = useState(false);
  const [detailDocOpen, setDetailDocOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'folder' | 'document';
    id: number;
    name: string;
    loading: boolean;
  }>({
    isOpen: false,
    type: 'folder',
    id: 0,
    name: '',
    loading: false,
  });

  // 1. Fetch Category Tree
  const {
    data: categoryTree = [],
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['document-categories', 'tree'],
    queryFn: getDocumentCategoryTree,
  });

  // 2. Fetch Documents for current folder & filters
  const {
    data: documentsData,
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ['documents', { categoryId: currentFolderId, search, documentType, status }],
    queryFn: () =>
      getDocuments({
        categoryId: currentFolderId || undefined,
        search: search.trim() || undefined,
        documentType: documentType || undefined,
        status: status || undefined,
        limit: 100,
      }),
  });

  const documents = useMemo<DocumentItem[]>(() => {
    if (Array.isArray(documentsData?.items)) return documentsData.items;
    if (Array.isArray(documentsData)) return documentsData as any;
    if (Array.isArray((documentsData as any)?.data)) return (documentsData as any).data;
    return [];
  }, [documentsData]);

  const safeCategoryTree = useMemo<DocumentCategory[]>(() => {
    if (Array.isArray(categoryTree)) return categoryTree;
    if (Array.isArray((categoryTree as any)?.data)) return (categoryTree as any).data;
    if (Array.isArray((categoryTree as any)?.items)) return (categoryTree as any).items;
    return [];
  }, [categoryTree]);

  // Helper: Find folder node and its breadcrumbs path recursively
  const { currentFolder, breadcrumbs, subFolders } = useMemo<{
    currentFolder: DocumentCategory | null;
    breadcrumbs: DocumentCategory[];
    subFolders: DocumentCategory[];
  }>(() => {
    if (currentFolderId === null) {
      return {
        currentFolder: null,
        breadcrumbs: [],
        subFolders: safeCategoryTree,
      };
    }

    const trail: DocumentCategory[] = [];
    let targetFolder: DocumentCategory | null = null;

    const findFolderRecursive = (nodes: DocumentCategory[], currentTrail: DocumentCategory[]): boolean => {
      for (const node of nodes) {
        const nextTrail = [...currentTrail, node];
        if (node.id === currentFolderId) {
          targetFolder = node;
          trail.push(...nextTrail);
          return true;
        }
        if (node.children && node.children.length > 0) {
          if (findFolderRecursive(node.children, nextTrail)) {
            return true;
          }
        }
      }
      return false;
    };

    findFolderRecursive(safeCategoryTree, []);

    return {
      currentFolder: targetFolder,
      breadcrumbs: trail,
      subFolders: targetFolder ? (targetFolder as DocumentCategory).children || [] : [],
    };
  }, [safeCategoryTree, currentFolderId]);

  // Handle go back 1 level
  const handleGoBack = () => {
    if (breadcrumbs.length <= 1) {
      setCurrentFolderId(null);
    } else {
      const parent = breadcrumbs[breadcrumbs.length - 2];
      setCurrentFolderId(parent ? parent.id : null);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, loading: true }));
      if (deleteModal.type === 'folder') {
        await deleteDocumentCategory(deleteModal.id);
        toast.success(`Đã xóa thư mục "${deleteModal.name}"`);
        refetchCategories();
        if (currentFolderId === deleteModal.id) {
          handleGoBack();
        }
      } else {
        await deleteDocument(deleteModal.id);
        toast.success(`Đã xóa tài liệu "${deleteModal.name}"`);
        refetchDocuments();
      }
      setDeleteModal((prev) => ({ ...prev, isOpen: false, loading: false }));
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi xóa');
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const hasSubFolders = subFolders.length > 0;
  const hasDocuments = documents.length > 0;
  const isEmptyState = !hasSubFolders && !hasDocuments && !isLoadingCategories && !isLoadingDocuments;
  const hasActiveFilters = Boolean(search || documentType || status);

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white select-none">
      {/* Top Header & Navigation Bar */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3.5 shrink-0 shadow-2xs">
        {/* Row 1: Title & Primary Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
              Tài liệu của tôi
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              Quản lý thư mục, cơ chế, chính sách và tài liệu lưu trữ nội bộ
            </p>
          </div>

          {/* Action buttons: Tạo thư mục mới & Tải lên tài liệu */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateFolderOpen(true)}
              leftIcon={<FolderPlus size={16} />}
              className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-medium h-9 px-3.5 shadow-2xs transition-all"
            >
              Thư mục mới
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreateDocOpen(true)}
              leftIcon={<Upload size={16} />}
              className="rounded-xl font-medium h-9 px-4 shadow-xs transition-all"
            >
              Tải lên tài liệu
            </Button>
          </div>
        </div>

        {/* Row 2: Breadcrumb Trail & Filters & View Switcher */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Breadcrumb Path on Left */}
          <div className="min-w-0">
            <BreadcrumbBar
              breadcrumbs={breadcrumbs}
              onNavigate={(id) => setCurrentFolderId(id)}
              onGoBack={handleGoBack}
            />
          </div>

          {/* Search, Filter & View Controls on Right */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            {/* Search Input using existing TableSearch component */}
            <div className="w-full sm:w-52 lg:w-64">
              <TableSearch
                placeholder="Tìm mã, tiêu đề..."
                value={search}
                onChange={setSearch}
                className="w-full"
              />
            </div>

            {/* Document Type Filter using existing Select component */}
            <div className="w-44 sm:w-48">
              <Select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                options={documentTypeOptions}
                placeholder="Tất cả loại văn bản"
                className="h-9 text-xs"
              />
            </div>

            {/* Status Filter using existing Select component */}
            <div className="w-40 sm:w-44 hidden sm:block">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={statusOptions}
                placeholder="Tất cả trạng thái"
                className="h-9 text-xs"
              />
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setDocumentType('');
                  setStatus('');
                }}
                className="h-9 px-2.5 rounded-lg border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw size={14} />
              </Button>
            )}

            {/* Divider */}
            <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0 mx-0.5" />

            {/* View Switch: 2 Options (Folder Grid vs Google Drive List) */}
            <div className="flex items-center p-0.5 rounded-xl border border-slate-200 bg-slate-100/80 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Dạng thư mục & lưới"
              >
                <LayoutGrid size={15} />
                <span className="hidden xl:inline text-xs">Lưới</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-primary shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Dạng danh sách Google Drive"
              >
                <List size={15} />
                <span className="hidden xl:inline text-xs">Danh sách</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Main Views */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
        {/* SECTION 1: THƯ MỤC (FOLDERS) - Hiển thị thẻ gọn gàng phong cách Drive */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder size={17} className="text-slate-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Thư mục
              </h3>
              {hasSubFolders && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-semibold">
                  {subFolders.length}
                </span>
              )}
            </div>
          </div>

          {hasSubFolders ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {subFolders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    locationName={currentFolder ? currentFolder.name : 'Tài liệu của tôi'}
                    onOpen={(f) => setCurrentFolderId(f.id)}
                    onEdit={(f) => {
                      setEditingFolder(f);
                      setEditFolderOpen(true);
                    }}
                    onDelete={(f) => {
                      setDeleteModal({
                        isOpen: true,
                        type: 'folder',
                        id: f.id,
                        name: f.name,
                        loading: false,
                      });
                    }}
                  />
                ))}
              </div>
            ) : (
              <FolderTable
                folders={subFolders}
                locationName={currentFolder ? currentFolder.name : 'Tài liệu của tôi'}
                showHeader={true}
                onOpen={(f) => setCurrentFolderId(f.id)}
                onEdit={(f) => {
                  setEditingFolder(f);
                  setEditFolderOpen(true);
                }}
                onDelete={(f) => {
                  setDeleteModal({
                    isOpen: true,
                    type: 'folder',
                    id: f.id,
                    name: f.name,
                    loading: false,
                  });
                }}
              />
            )
          ) : (
            <div
              onClick={() => setCreateFolderOpen(true)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border-2 border-dashed border-slate-200 hover:border-primary/50 bg-slate-50/50 hover:bg-primary/5 text-slate-400 hover:text-primary transition-all cursor-pointer w-fit text-xs font-medium"
            >
              <FolderPlus size={16} />
              <span>+ Thêm thư mục để sắp xếp tài liệu</span>
            </div>
          )}
        </div>

        {/* SECTION 2: TÀI LIỆU & TỆP TIN (FILES) */}
        {(hasDocuments || (!hasSubFolders && !isEmptyState)) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={17} className="text-slate-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Tài liệu & Tệp tin
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  {documents.length}
                </span>
              </div>
            </div>

            {isLoadingDocuments ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-lg bg-slate-200/60 animate-pulse"
                  />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="py-8 text-center bg-white rounded-lg border border-slate-200/80 text-xs text-slate-400">
                Chưa có tài liệu nào trong thư mục này.
              </div>
            ) : viewMode === 'grid' ? (
              /* Option 1: Dạng Thư mục & Thẻ lưới */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {documents.map((doc) => (
                  <FileCard
                    key={doc.id}
                    document={doc}
                    locationName={currentFolder ? currentFolder.name : doc.category?.name || 'Tài liệu của tôi'}
                    onView={(d) => {
                      setSelectedDoc(d);
                      setDetailDocOpen(true);
                    }}
                    onDelete={(d) => {
                      setDeleteModal({
                        isOpen: true,
                        type: 'document',
                        id: d.id,
                        name: d.title,
                        loading: false,
                      });
                    }}
                  />
                ))}
              </div>
            ) : (
              /* Option 2: Dạng Danh sách phẳng phong cách Google Drive */
              <FileTable
                documents={documents}
                currentFolderName={currentFolder ? currentFolder.name : 'Tài liệu của tôi'}
                showHeader={!hasSubFolders}
                onView={(d) => {
                  setSelectedDoc(d);
                  setDetailDocOpen(true);
                }}
                onDelete={(d) => {
                  setDeleteModal({
                    isOpen: true,
                    type: 'document',
                    id: d.id,
                    name: d.title,
                    loading: false,
                  });
                }}
                onNavigateFolder={(id) => setCurrentFolderId(id)}
              />
            )}
          </div>
        )}

        {/* EMPTY STATE TOÀN BỘ */}
        {isEmptyState && (
          <div className="py-16 flex flex-col items-center justify-center text-center bg-white border border-dashed border-slate-300 rounded-3xl p-8 max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <Folder size={32} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              {currentFolder ? `Thư mục "${currentFolder.name}" đang trống` : 'Chưa có thư mục hoặc tài liệu nào'}
            </h3>
            <p className="text-xs text-slate-500 mb-6 max-w-xs">
              Bắt đầu tạo thư mục con hoặc tải lên tài liệu đầu tiên để quản lý.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreateFolderOpen(true)}
                leftIcon={<FolderPlus size={15} />}
                className="rounded-xl border-slate-300 text-slate-700"
              >
                Thư mục mới
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCreateDocOpen(true)}
                leftIcon={<Upload size={15} />}
                className="rounded-xl"
              >
                Tải lên tài liệu
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* 1. Create Folder Modal */}
      <CreateFolderModal
        isOpen={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        parentId={currentFolderId}
        parentFolder={currentFolder}
        onSuccess={() => {
          refetchCategories();
        }}
      />

      {/* 2. Edit Folder Modal */}
      <EditFolderModal
        isOpen={editFolderOpen}
        onClose={() => {
          setEditFolderOpen(false);
          setEditingFolder(null);
        }}
        folder={editingFolder}
        onSuccess={() => {
          refetchCategories();
        }}
      />

      {/* 3. Create / Upload Document Modal */}
      <CreateDocumentModal
        isOpen={createDocOpen}
        onClose={() => setCreateDocOpen(false)}
        currentFolderId={currentFolderId}
        currentFolder={currentFolder}
        categories={safeCategoryTree}
        onSuccess={() => {
          refetchDocuments();
        }}
      />

      {/* 4. Document Detail Modal */}
      <DocumentDetailModal
        isOpen={detailDocOpen}
        onClose={() => {
          setDetailDocOpen(false);
          setSelectedDoc(null);
        }}
        document={selectedDoc}
      />

      {/* 5. Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        title={deleteModal.type === 'folder' ? 'Xác nhận xóa thư mục' : 'Xác nhận xóa tài liệu'}
        description={
          deleteModal.type === 'folder'
            ? `Bạn có chắc chắn muốn xóa thư mục "${deleteModal.name}"? Chỉ có thể xóa khi thư mục không chứa tài liệu hoặc thư mục con.`
            : `Bạn có chắc chắn muốn xóa tài liệu "${deleteModal.name}"? Tài liệu sẽ được chuyển vào mục lưu trữ / xóa mềm.`
        }
        onConfirm={handleConfirmDelete}
        loading={deleteModal.loading}
      />
    </div>
  );
}
