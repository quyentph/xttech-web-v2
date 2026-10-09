'use client';

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { CreateFolderModal } from './_components/create-folder-modal';
import { EditFolderModal } from './_components/edit-folder-modal';
import { CreateDocumentModal } from './_components/create-document-modal';
import { DocumentDetailModal } from './_components/document-detail-modal';
import { DeleteConfirmModal } from './_components/delete-confirm-modal';
import { ShareFolderModal } from './_components/share-folder-modal';
import { Button, Select, TableSearch } from '@/components';

// Icons
import {
  FolderPlus,
  Upload,
  LayoutGrid,
  List,
  Folder,
  FolderOpen,
  FileText,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

function MyDocumentsContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  
  // Navigation & View States
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);

  // If the URL changes to a different tab, reset currentFolderId to null
  useEffect(() => {
    setCurrentFolderId(null);
  }, [tab]);
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
  const [shareFolderOpen, setShareFolderOpen] = useState(false);
  const [sharingFolder, setSharingFolder] = useState<DocumentCategory | null>(null);

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

  // Helper: Find current folder, its direct parent, and subfolders recursively
  const { currentFolder, parentFolder, subFolders, myFolders, sharedFolders } = useMemo<{
    currentFolder: DocumentCategory | null;
    parentFolder: DocumentCategory | null;
    subFolders: DocumentCategory[];
    myFolders: DocumentCategory[];
    sharedFolders: DocumentCategory[];
  }>(() => {
    if (currentFolderId === null) {
      return {
        currentFolder: null,
        parentFolder: null,
        subFolders: safeCategoryTree,
        myFolders: safeCategoryTree.filter((f) => !f.isShared),
        sharedFolders: safeCategoryTree.filter((f) => f.isShared),
      };
    }

    let targetFolder: DocumentCategory | null = null;
    let directParent: DocumentCategory | null = null;

    const findFolderRecursive = (
      nodes: DocumentCategory[],
      parent: DocumentCategory | null
    ): boolean => {
      for (const node of nodes) {
        if (node.id === currentFolderId) {
          targetFolder = node;
          directParent = parent;
          return true;
        }
        if (node.children && node.children.length > 0) {
          if (findFolderRecursive(node.children, node)) {
            return true;
          }
        }
      }
      return false;
    };

    findFolderRecursive(safeCategoryTree, null);
    
    const children = targetFolder ? (targetFolder as DocumentCategory).children || [] : [];

    return {
      currentFolder: targetFolder,
      parentFolder: directParent,
      subFolders: children,
      myFolders: children,
      sharedFolders: [],
    };
  }, [safeCategoryTree, currentFolderId]);

  // Handle go back 1 level (như nút Back trên máy tính)
  const handleGoBack = () => {
    if (parentFolder) {
      setCurrentFolderId(parentFolder.id);
    } else {
      setCurrentFolderId(null);
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
  const isEmptyState =
    !hasSubFolders && !hasDocuments && !isLoadingCategories && !isLoadingDocuments;
  const hasActiveFilters = Boolean(search || documentType || status);

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white select-none">
      {/* Top Header & Navigation Bar */}
      <div className="bg-white border-b border-slate-200/80 p-4 shrink-0 shadow-2xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Left: Search, Filters & View Controls (Ảnh 2) */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap flex-1 min-w-0">
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

          {/* Right: Action buttons (Ảnh 3) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
              onClick={() => setCreateFolderOpen(true)}
              leftIcon={<FolderPlus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            >
              Thư mục mới
            </Button>

            <Button
              variant="primary"
              size="sm"
              className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
              onClick={() => setCreateDocOpen(true)}
              leftIcon={<Upload className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            >
              Tải lên tài liệu
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Main Views */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Thanh tiêu đề vị trí thư mục & Nút quay lại (Kiểu folder máy tính) */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
          <div className="flex items-center gap-3 min-w-0">
            {/* Nút Quay lại 1 cấp (chỉ hiện khi đang ở trong thư mục con) */}
            {currentFolderId !== null && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoBack}
                leftIcon={<ArrowLeft size={15} />}
                className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 border-slate-200 bg-white hover:bg-slate-100 cursor-pointer shadow-2xs shrink-0"
                title={parentFolder ? `Quay lại ${parentFolder.name}` : 'Quay lại Tài liệu của tôi'}
              >
                Quay lại
              </Button>
            )}

            {/* Thông tin thư mục hiện tại */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {currentFolderId !== null ? <FolderOpen size={18} /> : <Folder size={18} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm md:text-base font-bold text-slate-800 truncate leading-tight">
                    {currentFolder ? currentFolder.name : 'Tài liệu của tôi'}
                  </h2>
                  {currentFolder?.code && (
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {currentFolder.code}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {currentFolder
                    ? `${subFolders.length} thư mục con • ${documents.length} tài liệu`
                    : `${subFolders.length} thư mục • ${documents.length} tài liệu`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: THƯ MỤC CÁ NHÂN (NẾU CÓ) */}
        {(tab === 'my' || tab === null) && myFolders.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder size={16} className="text-slate-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {currentFolderId === null ? 'Thư mục của tôi' : 'Thư mục'}
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-semibold">
                  {myFolders.length}
                </span>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {myFolders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    locationName={currentFolder ? currentFolder.name : 'Tài liệu của tôi'}
                    onOpen={(f) => setCurrentFolderId(f.id)}
                    onEdit={(f) => {
                      setEditingFolder(f);
                      setEditFolderOpen(true);
                    }}
                    onShare={(f) => {
                      setSharingFolder(f);
                      setShareFolderOpen(true);
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
                folders={myFolders}
                locationName={currentFolder ? currentFolder.name : 'Tài liệu của tôi'}
                showHeader={true}
                onOpen={(f) => setCurrentFolderId(f.id)}
                onEdit={(f) => {
                  setEditingFolder(f);
                  setEditFolderOpen(true);
                }}
                onShare={(f) => {
                  setSharingFolder(f);
                  setShareFolderOpen(true);
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
            )}
          </div>
        )}

        {/* SECTION 1.5: THƯ MỤC ĐƯỢC CHIA SẺ (CHỈ HIỂN THỊ Ở ROOT) */}
        {(tab === 'shared' || tab === null) && sharedFolders.length > 0 && (
          <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen size={16} className="text-slate-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Được chia sẻ với tôi
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-semibold">
                  {sharedFolders.length}
                </span>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {sharedFolders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    locationName="Được chia sẻ với tôi"
                    onOpen={(f) => setCurrentFolderId(f.id)}
                    onEdit={(f) => {
                      setEditingFolder(f);
                      setEditFolderOpen(true);
                    }}
                    onShare={(f) => {
                      setSharingFolder(f);
                      setShareFolderOpen(true);
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
                folders={sharedFolders}
                locationName="Được chia sẻ với tôi"
                showHeader={true}
                onOpen={(f) => setCurrentFolderId(f.id)}
                onEdit={(f) => {
                  setEditingFolder(f);
                  setEditFolderOpen(true);
                }}
                onShare={(f) => {
                  setSharingFolder(f);
                  setShareFolderOpen(true);
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
            )}
          </div>
        )}

        {/* SECTION 2: TÀI LIỆU & TỆP TIN TRONG FOLDER HIỆN TẠI (NẾU CÓ HOẶC KHI ĐANG TẢI) */}
        {(hasDocuments || isLoadingDocuments) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-slate-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Tài liệu & Tệp tin
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  {documents.length}
                </span>
              </div>
            </div>

            {isLoadingDocuments ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-slate-200/60 animate-pulse" />
                ))}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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

        {/* EMPTY STATE TOÀN BỘ (Khi folder hiện tại không có thư mục con và không có file con nào) */}
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
                leftIcon={<FolderPlus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              >
                Thư mục mới
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCreateDocOpen(true)}
                leftIcon={<Upload className="w-3.5 h-3.5 md:w-4 md:h-4" />}
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
        onSuccess={refetchDocuments}
      />

      {/* 5. Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        title={deleteModal.type === 'folder' ? 'Xác nhận xóa thư mục' : 'Xác nhận xóa tài liệu'}
        description={
          deleteModal.type === 'folder' ? (
            <>
              Bạn có chắc chắn muốn xóa thư mục{' '}
              <strong className="text-gray-900 font-semibold">{deleteModal.name}</strong>?
            </>
          ) : (
            <>
              Bạn có chắc chắn muốn xóa tài liệu{' '}
              <strong className="text-gray-900 font-semibold">{deleteModal.name}</strong>?
            </>
          )
        }
        onConfirm={handleConfirmDelete}
        loading={deleteModal.loading}
      />

      {/* 6. Share Folder Modal */}
      <ShareFolderModal
        isOpen={shareFolderOpen}
        onClose={() => {
          setShareFolderOpen(false);
          setSharingFolder(null);
        }}
        folder={sharingFolder}
        onSuccess={() => {
          refetchCategories();
        }}
      />
    </div>
  );
}

export default function MyDocumentsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex flex-col min-w-0 h-full overflow-hidden bg-white select-none items-center justify-center text-slate-500 text-xs">
          Đang tải dữ liệu...
        </div>
      }
    >
      <MyDocumentsContent />
    </Suspense>
  );
}
