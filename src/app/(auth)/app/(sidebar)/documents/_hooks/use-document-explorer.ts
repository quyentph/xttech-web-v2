'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePermission, useQueryParam } from '@/hooks';
import { useAuthStore } from '@/stores';
import {
  getDocumentCategoryTree,
  getDocuments,
  getInboxDocuments,
  updateDocumentCategory,
  updateDocument,
  deleteDocumentCategory,
  deleteDocument,
  removeDocumentFromFolder,
  getDocumentById,
} from '@/actions/document';
import {
  DOCUMENT_TYPE_MAP,
  DOCUMENT_STATUS_MAP,
  RULE_DOC_TYPES,
  type DocumentCategory,
  type DocumentItem,
} from '@/types';
import {
  isDocumentOwner,
  isDocumentSharedWithUser,
  getDocumentPermissions,
} from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-helpers';
import { useDocumentSelection } from '@/app/(auth)/app/(sidebar)/documents/_hooks/use-document-selection';
import { useDocumentClipboard } from '@/app/(auth)/app/(sidebar)/documents/_hooks/use-document-clipboard';
import { useFolderTree } from '@/app/(auth)/app/(sidebar)/documents/_hooks/use-folder-tree';
import { useDocumentModals } from '@/app/(auth)/app/(sidebar)/documents/_hooks/use-document-modals';
import { DOC_QUERY_KEYS, invalidateDocumentQueries } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-query-keys';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';

interface UseDocumentExplorerOptions {
  tab?: 'my' | 'shared' | string | null;
  defaultFolderId?: number | null;
}

export function useDocumentExplorer({ tab = 'my', defaultFolderId = null }: UseDocumentExplorerOptions = {}) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const { isAdmin, isHR } = usePermission();
  const canManageDocuments = isAdmin || isHR;

  // 1. Navigation & View States
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(defaultFolderId);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState<boolean>(false);

  // Reset thư mục khi đổi tab
  useEffect(() => {
    setCurrentFolderId(defaultFolderId);
  }, [tab, defaultFolderId]);

  // 2. Selection Hook
  const { selectedItemKeys, toggleSelectItem, selectSingleItem, selectAllItems, clearSelection } =
    useDocumentSelection(currentFolderId, tab);

  // 3. Search & Filters (Đồng bộ URL qua useQueryParam)
  const [rawSearch, setRawSearch] = useQueryParam('search', '');
  const search = rawSearch || '';
  const setSearch = useCallback((v: string) => setRawSearch(v), [setRawSearch]);

  const [rawDocType, setRawDocType] = useQueryParam('type', '');
  const documentType = rawDocType || '';
  const setDocumentType = useCallback((v: string) => setRawDocType(v), [setRawDocType]);

  const [rawStatus, setRawStatus] = useQueryParam('status', '');
  const status = rawStatus || '';
  const setStatus = useCallback((v: string) => setRawStatus(v), [setRawStatus]);

  const documentTypeOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả loại văn bản' },
      ...Object.entries(DOCUMENT_TYPE_MAP).map(([key, item]) => ({
        value: key,
        label: item.label,
      })),
    ],
    [],
  );

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả trạng thái' },
      ...Object.entries(DOCUMENT_STATUS_MAP).map(([key, item]) => ({
        value: key,
        label: item.label,
      })),
    ],
    [],
  );

  const hasActiveFilters = Boolean(search || documentType || status);

  const handleResetFilters = useCallback(() => {
    setSearch('');
    setDocumentType('');
    setStatus('');
    setFilterUnreadOnly(false);
  }, [setSearch, setDocumentType, setStatus]);

  // 4. Modals Controller Hook
  const modals = useDocumentModals();

  // 5. Fetch Category Tree (Sử dụng chung DOC_QUERY_KEYS.categories.tree)
  const {
    data: categoryTree = [],
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: DOC_QUERY_KEYS.categories.tree,
    queryFn: getDocumentCategoryTree,
  });

  // 6. Folder Hierarchy Resolution
  const {
    safeCategoryTree,
    currentFolder,
    currentFolderPermission,
    parentFolder,
    subFolders,
    myFolders,
    sharedFolders,
    foldersToDisplay,
    isSharedSection,
    isDescendant,
  } = useFolderTree({
    categoryTree,
    currentFolderId,
    tab,
  });

  // Phân tập ID thư mục
  const allSharedCategoryIds = useMemo(() => {
    const ids = new Set<number>();
    const collect = (nodes: DocumentCategory[]) => {
      for (const node of nodes) {
        ids.add(node.id);
        if (node.children && node.children.length > 0) {
          collect(node.children);
        }
      }
    };
    collect(sharedFolders);
    return ids;
  }, [sharedFolders]);

  const allMyCategoryIds = useMemo(() => {
    const ids = new Set<number>();
    const collect = (nodes: DocumentCategory[]) => {
      for (const node of nodes) {
        ids.add(node.id);
        if (node.children && node.children.length > 0) {
          collect(node.children);
        }
      }
    };
    collect(myFolders);
    return ids;
  }, [myFolders]);

  // 7. Fetch Documents (Sử dụng chung DOC_QUERY_KEYS.documents.list)
  const queryParams = useMemo(
    () => ({
      categoryId: currentFolderId || undefined,
      search: search?.trim() || undefined,
      documentType: documentType || undefined,
      status: status || undefined,
      limit: 1000,
    }),
    [currentFolderId, search, documentType, status],
  );

  const {
    data: documentsData,
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: DOC_QUERY_KEYS.documents.list({ ...queryParams, tab }),
    queryFn: () => (tab === 'shared' ? getInboxDocuments(queryParams) : getDocuments(queryParams)),
  });

  // 8. Resolve danh sách tài liệu theo phân vùng (Shared vs My)
  const documents = useMemo<DocumentItem[]>(() => {
    let rawItems: DocumentItem[] = [];
    if (Array.isArray(documentsData?.items)) rawItems = documentsData.items;
    else if (Array.isArray(documentsData)) rawItems = documentsData as any;
    else if (Array.isArray((documentsData as any)?.data)) rawItems = (documentsData as any).data;

    // PHÂN VÙNG: ĐƯỢC CHIA SẺ
    if (isSharedSection) {
      if (currentFolderId === null) {
        return rawItems.filter((doc) => {
          if (isDocumentOwner(doc, currentUser, allMyCategoryIds)) return false;
          const sharedToMe = isDocumentSharedWithUser(doc, currentUser, allSharedCategoryIds);
          if (!sharedToMe) return false;
          if (doc.categoryId === null || doc.categoryId === undefined) return true;
          return !allSharedCategoryIds.has(doc.categoryId);
        });
      }
      return rawItems.filter((doc) => doc.categoryId === currentFolderId || doc.category?.id === currentFolderId);
    }

    // PHÂN VÙNG: TÀI LIỆU CỦA TÔI
    if (currentFolderId === null) {
      return rawItems.filter((doc) => {
        const isRoot = doc.categoryId === null || doc.categoryId === undefined;
        if (!isRoot) return false;
        if (RULE_DOC_TYPES.includes(doc.documentType)) return false;
        return isDocumentOwner(doc, currentUser, allMyCategoryIds);
      });
    }

    return rawItems.filter((doc) => {
      if (RULE_DOC_TYPES.includes(doc.documentType)) return false;

      // 1. Tài liệu gốc do chính mình tạo nằm trong thư mục này
      if (
        (doc.categoryId === currentFolderId || doc.category?.id === currentFolderId) &&
        isDocumentOwner(doc, currentUser, allMyCategoryIds)
      ) {
        return true;
      }

      // 2. Tài liệu lưu lối tắt (Shortcut) vào thư mục này
      const isExplicitShortcut =
        (doc as any).isShortcut === true ||
        (Array.isArray(doc.savedFolders) && doc.savedFolders.includes(currentFolderId));
      if (isExplicitShortcut) return true;

      // 3. Tài liệu được backend trả về khi query theo currentFolderId
      if (!isDocumentOwner(doc, currentUser, allMyCategoryIds)) {
        return true;
      }
      if (doc.categoryId !== currentFolderId && doc.category?.id !== currentFolderId) {
        return true;
      }

      return false;
    });
  }, [documentsData, currentFolderId, isSharedSection, allSharedCategoryIds, allMyCategoryIds, currentUser]);

  // Thống kê & Lọc Chưa đọc
  const unreadCount = useMemo(() => documents.filter((d) => d.isRead === false).length, [documents]);

  const displayedDocuments = useMemo(() => {
    if (filterUnreadOnly) {
      return documents.filter((d) => d.isRead === false);
    }
    return documents;
  }, [documents, filterUnreadOnly]);

  // Phân quyền trên thư mục hiện tại
  const canEditCurrentFolder = !isSharedSection || canManageDocuments;
  const canDeleteCurrentFolder = !isSharedSection || canManageDocuments;
  const canCreate =
    !isSharedSection ||
    canManageDocuments ||
    (Boolean(currentFolderId) && (currentFolderPermission === 'edit' || canManageDocuments));

  // Quay lại 1 cấp thư mục
  const handleGoBack = useCallback(() => {
    if (parentFolder) {
      setCurrentFolderId(parentFolder.id);
    } else {
      setCurrentFolderId(null);
    }
  }, [parentFolder]);

  // Gỡ lối tắt khỏi thư mục cá nhân
  const handleRemoveFromFolder = useCallback(
    async (doc: DocumentItem) => {
      if (!currentFolderId) return;
      try {
        await removeDocumentFromFolder(doc.id, currentFolderId);
        toast.success(`Đã gỡ tài liệu "${doc.title}" khỏi thư mục này`);
        invalidateDocumentQueries(queryClient);
      } catch (error: any) {
        showErrorToast(error, 'Không thể gỡ tài liệu khỏi thư mục');
      }
    },
    [currentFolderId, queryClient],
  );

  // Xóa tài liệu / thư mục (Delete Action)
  const handleConfirmDelete = useCallback(async () => {
    const { deleteModal } = modals.state;
    if (isSharedSection && !canManageDocuments) {
      toast.error('Bạn không có quyền xóa trong mục Được chia sẻ với tôi');
      modals.setters.setDeleteModal((prev) => ({ ...prev, isOpen: false }));
      return;
    }

    try {
      modals.setters.setDeleteModal((prev) => ({ ...prev, loading: true }));

      // Xóa nhiều mục liên tiếp bằng vòng lặp for
      if (deleteModal.type === 'multiple' && deleteModal.items && deleteModal.items.length > 0) {
        const toastId = toast.loading(`Đang xóa ${deleteModal.items.length} mục...`);
        let successCount = 0;
        let errorCount = 0;

        for (const item of deleteModal.items) {
          try {
            if (item.type === 'folder') {
              await deleteDocumentCategory(item.id);
            } else {
              await deleteDocument(item.id);
            }
            successCount++;
          } catch {
            errorCount++;
          }
        }

        if (successCount > 0) {
          const errorMsg = errorCount > 0 ? ` (${errorCount} mục thất bại)` : '';
          toast.success(`Đã xóa thành công ${successCount} mục!${errorMsg}`, { id: toastId });
          invalidateDocumentQueries(queryClient);
          clearSelection();
          if (currentFolderId && deleteModal.items.some((it) => it.type === 'folder' && it.id === currentFolderId)) {
            handleGoBack();
          }
        } else {
          toast.error('Không thể xóa các mục đã chọn', { id: toastId });
        }
        modals.setters.setDeleteModal((prev) => ({ ...prev, isOpen: false, loading: false }));
        return;
      }

      if (deleteModal.type === 'folder') {
        await deleteDocumentCategory(deleteModal.id);
        toast.success(`Đã xóa thư mục "${deleteModal.name}"`);
        if (currentFolderId === deleteModal.id) {
          handleGoBack();
        }
      } else {
        const doc = documents.find((d) => d.id === deleteModal.id);
        const perms = doc
          ? getDocumentPermissions(doc, currentUser, {
              isSharedSection,
              canManageDocuments,
            })
          : null;

        if (perms && !perms.canDelete && !canManageDocuments) {
          toast.error('Bạn không có quyền xóa tài liệu này');
          modals.setters.setDeleteModal((prev) => ({ ...prev, isOpen: false, loading: false }));
          return;
        }

        await deleteDocument(deleteModal.id);
        toast.success(`Đã xóa tài liệu "${deleteModal.name}"`);
      }

      invalidateDocumentQueries(queryClient);
      modals.setters.setDeleteModal((prev) => ({ ...prev, isOpen: false, loading: false }));
    } catch (error: any) {
      showErrorToast(error, 'Lỗi khi xóa');
      modals.setters.setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  }, [
    modals,
    isSharedSection,
    canManageDocuments,
    currentFolderId,
    documents,
    currentUser,
    queryClient,
    clearSelection,
    handleGoBack,
  ]);

  // Mở modal xóa các mục đang chọn
  const handleOpenDeleteSelected = useCallback(() => {
    if (selectedItemKeys.size === 0) return;
    if (isSharedSection && !canManageDocuments) {
      toast.error('Bạn không có quyền xóa trong mục Được chia sẻ với tôi');
      return;
    }

    const items: Array<{ type: 'folder' | 'document'; id: number; name: string }> = [];
    selectedItemKeys.forEach((key) => {
      const [type, idStr] = key.split('-');
      const id = Number(idStr);
      if (type === 'folder') {
        const f = foldersToDisplay.find((item) => item.id === id);
        items.push({ type: 'folder', id, name: f?.name || `Thư mục #${id}` });
      } else {
        const d = documents.find((item) => item.id === id);
        items.push({ type: 'document', id, name: d?.title || `Tài liệu #${id}` });
      }
    });

    if (items.length === 1) {
      const single = items[0];
      modals.actions.openDeleteModal(single.type, single.id, single.name);
    } else if (items.length > 1) {
      modals.actions.openDeleteMultiple(items);
    }
  }, [selectedItemKeys, isSharedSection, canManageDocuments, foldersToDisplay, documents, modals.actions]);

  // Tập hợp tất cả các key mục đang hiển thị trên giao diện
  const allDisplayKeys = useMemo(() => {
    const keys: string[] = [];
    foldersToDisplay.forEach((f) => keys.push(`folder-${f.id}`));
    displayedDocuments.forEach((d) => keys.push(`doc-${d.id}`));
    return keys;
  }, [foldersToDisplay, displayedDocuments]);

  const isAllSelected = useMemo(
    () => allDisplayKeys.length > 0 && allDisplayKeys.every((k) => selectedItemKeys.has(k)),
    [allDisplayKeys, selectedItemKeys],
  );

  const handleToggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAllItems(allDisplayKeys);
    }
  }, [isAllSelected, allDisplayKeys, selectAllItems, clearSelection]);

  // Lắng nghe phím Delete/Backspace để mở xác nhận xóa các mục đang chọn, Ctrl+A để chọn tất cả
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement as HTMLElement)?.isContentEditable;
      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A') && allDisplayKeys.length > 0) {
        e.preventDefault();
        selectAllItems(allDisplayKeys);
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Del') && selectedItemKeys.size > 0 && !modals.state.deleteModal.isOpen) {
        e.preventDefault();
        handleOpenDeleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemKeys, allDisplayKeys, modals.state.deleteModal.isOpen, handleOpenDeleteSelected, selectAllItems]);

  // Drag & Drop move item handler (hỗ trợ cả kéo 1 item và kéo nhiều item đã chọn)
  const handleDropItem = useCallback(
    async (
      sourceType: 'folder' | 'document',
      sourceId: number,
      targetFolderId: number,
      bulkItems?: Array<{ type: 'folder' | 'document'; id: number }>
    ) => {
      const itemsToMove =
        bulkItems && bulkItems.length > 0
          ? bulkItems
          : [{ type: sourceType, id: sourceId }];

      if (itemsToMove.length === 0) return;

      if (isSharedSection && !canManageDocuments) {
        toast.error('Bạn không có quyền di chuyển trong mục Được chia sẻ với tôi');
        return;
      }

      const toastId = toast.loading(
        itemsToMove.length > 1
          ? `Đang di chuyển ${itemsToMove.length} mục...`
          : 'Đang di chuyển...'
      );

      let successCount = 0;
      let errorCount = 0;

      for (const item of itemsToMove) {
        try {
          if (item.type === 'folder') {
            if (item.id === targetFolderId) {
              errorCount++;
              continue;
            }
            if (isDescendant(safeCategoryTree, item.id, targetFolderId)) {
              errorCount++;
              continue;
            }
            await updateDocumentCategory(item.id, { parentId: targetFolderId });
            successCount++;
          } else {
            let doc = documents.find((d) => d.id === item.id);
            if (!doc) {
              try {
                doc = await getDocumentById(item.id);
              } catch {
                // ignore
              }
            }

            if (doc) {
              const perms = getDocumentPermissions(doc, currentUser, {
                isSharedSection,
                canManageDocuments,
              });
              if (!perms.canMove && !canManageDocuments) {
                errorCount++;
                continue;
              }

              await updateDocument(item.id, {
                title: doc.title,
                documentType: doc.documentType || 'other',
                status: doc.status || 'draft',
                shareScope: doc.shareScope || 'private',
                categoryId: targetFolderId,
              });
              successCount++;
            } else {
              await updateDocument(item.id, { categoryId: targetFolderId } as any);
              successCount++;
            }
          }
        } catch {
          errorCount++;
        }
      }

      if (successCount > 0) {
        const errorMsg = errorCount > 0 ? ` (${errorCount} mục thất bại)` : '';
        toast.success(
          itemsToMove.length > 1
            ? `Đã di chuyển thành công ${successCount} mục!${errorMsg}`
            : 'Di chuyển thành công!',
          { id: toastId }
        );
        invalidateDocumentQueries(queryClient);
        clearSelection();
      } else {
        toast.error('Không thể di chuyển các mục đã chọn', { id: toastId });
      }
    },
    [
      documents,
      currentUser,
      isSharedSection,
      canManageDocuments,
      safeCategoryTree,
      isDescendant,
      queryClient,
      clearSelection,
    ],
  );

  // 10. Keyboard Clipboard Hook (Ctrl + X, Ctrl + C, Ctrl + V)
  const {
    cutItemKeys,
    clipboard,
    clearClipboard,
    executePaste,
    handleCutSelected,
    handleCopySelected,
  } = useDocumentClipboard({
    selectedItemKeys,
    currentFolderId,
    foldersToDisplay,
    documents,
    safeCategoryTree,
    isDescendant,
    clearSelection,
    isSharedSection,
  });

  return {
    // Navigation & View
    currentFolderId,
    setCurrentFolderId,
    viewMode,
    setViewMode,
    handleGoBack,

    // Search & Filter
    search,
    setSearch,
    documentType,
    setDocumentType,
    documentTypeOptions,
    status,
    setStatus,
    statusOptions,
    hasActiveFilters,
    handleResetFilters,

    // Unread
    filterUnreadOnly,
    setFilterUnreadOnly,
    unreadCount,

    // Selection & Clipboard
    selectedItemKeys,
    toggleSelectItem,
    selectSingleItem,
    selectAllItems,
    clearSelection,
    isAllSelected,
    handleToggleSelectAll,
    totalDisplayCount: allDisplayKeys.length,
    cutItemKeys,
    clipboard,
    clearClipboard,
    executePaste,
    handleCutSelected,
    handleCopySelected,

    // Modals
    modals,

    // Categories
    categoryTree,
    safeCategoryTree,
    isLoadingCategories,
    refetchCategories,
    currentFolder,
    currentFolderPermission,
    parentFolder,
    subFolders,
    foldersToDisplay,
    isSharedSection,
    allMyCategoryIds,
    allSharedCategoryIds,

    // Documents
    documents,
    displayedDocuments,
    isLoadingDocuments,
    refetchDocuments,

    // Permissions
    canEditCurrentFolder,
    canDeleteCurrentFolder,
    canCreate,

    // Actions
    handleConfirmDelete,
    handleOpenDeleteSelected,
    handleDropItem,
    handleRemoveFromFolder,
  };
}
