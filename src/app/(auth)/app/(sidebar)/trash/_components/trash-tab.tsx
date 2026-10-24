'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Search,
  RotateCcw,
  LayoutGrid,
  List,
  AlertCircle,
  SearchX,
  Trash2,
} from 'lucide-react';
import { Select, Button } from '@/components';
import { getTrashItems, restoreTrashItem, purgeTrashItem } from '@/actions/trash';
import type { TrashItem, TrashItemType } from '@/types';
import { TrashHeader } from './trash-header';
import { TrashCard } from './trash-card';
import { TrashListItem } from './trash-list-item';
import { RestoreConfirmModal } from './restore-confirm-modal';
import { PurgeConfirmModal } from './purge-confirm-modal';
import { DOC_QUERY_KEYS, invalidateDocumentQueries } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-query-keys';

const ITEM_TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả loại mục' },
  { value: 'folder', label: 'Chỉ thư mục' },
  { value: 'document', label: 'Chỉ tài liệu' },
];

/** Lấy tên hiển thị an toàn của mục trong thùng rác */
const getItemDisplayName = (item: TrashItem): string => {
  return item.title || (item as any).name || (item as any).folder_name || (item as any).fileName || 'mục';
};

export const TrashTab: React.FC = () => {
  const queryClient = useQueryClient();

  // Toolbar & View state
  const [search, setSearch] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<'all' | TrashItemType>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Multi-Selection State
  const [selectedTrashKeys, setSelectedTrashKeys] = useState<Set<string>>(new Set());

  // Modal states
  const [restoreItem, setRestoreItem] = useState<TrashItem | null>(null);
  const [itemsToRestore, setItemsToRestore] = useState<TrashItem[]>([]);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [isBulkRestoring, setIsBulkRestoring] = useState(false);

  const [purgeItem, setPurgeItem] = useState<TrashItem | null>(null);
  const [itemsToPurge, setItemsToPurge] = useState<TrashItem[]>([]);
  const [isPurgeOpen, setIsPurgeOpen] = useState(false);
  const [isBulkPurging, setIsBulkPurging] = useState(false);

  const [activeRestoringId, setActiveRestoringId] = useState<number | null>(null);
  const [activePurgingId, setActivePurgingId] = useState<number | null>(null);

  // 1. Fetch Trash Items
  const {
    data: rawTrashItems = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<TrashItem[]>({
    queryKey: DOC_QUERY_KEYS.trash.root,
    queryFn: getTrashItems,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const trashItems: TrashItem[] = useMemo(() => {
    if (Array.isArray(rawTrashItems)) return rawTrashItems;
    if (Array.isArray((rawTrashItems as any)?.items)) return (rawTrashItems as any).items;
    if (Array.isArray((rawTrashItems as any)?.data)) return (rawTrashItems as any).data;
    return [];
  }, [rawTrashItems]);

  // 2. Mutations
  const restoreMutation = useMutation({
    mutationFn: async (item: TrashItem) => {
      setActiveRestoringId(item.id);
      return restoreTrashItem({
        itemType: item.itemType,
        itemId: item.id,
      });
    },
    onSuccess: (_, item) => {
      const name = getItemDisplayName(item);
      toast.success(`Đã khôi phục ${item.itemType === 'folder' ? 'thư mục' : 'tài liệu'} "${name}" thành công!`);

      // Cập nhật trực tiếp cache Thùng rác để xóa item khỏi giao diện ngay lập tức mà KHÔNG gọi lại API trash
      queryClient.setQueryData(DOC_QUERY_KEYS.trash.root, (old: any) => {
        if (Array.isArray(old)) {
          return old.filter((t: TrashItem) => t.id !== item.id);
        }
        if (old && Array.isArray(old.items)) {
          return { ...old, items: old.items.filter((t: TrashItem) => t.id !== item.id) };
        }
        if (old && Array.isArray(old.data)) {
          return { ...old, data: old.data.filter((t: TrashItem) => t.id !== item.id) };
        }
        return [];
      });

      // Đánh dấu các query tài liệu/thư mục cần cập nhật khi người dùng chuyển sang trang khác mà không kích hoạt gọi mạng lúc này
      invalidateDocumentQueries(queryClient, { refetchType: 'none' });

      setIsRestoreOpen(false);
      setRestoreItem(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Không thể khôi phục mục đã chọn');
    },
    onSettled: () => {
      setActiveRestoringId(null);
    },
  });

  const purgeMutation = useMutation({
    mutationFn: async (item: TrashItem) => {
      setActivePurgingId(item.id);
      return purgeTrashItem({
        itemType: item.itemType,
        itemId: item.id,
      });
    },
    onSuccess: (_, item) => {
      const name = getItemDisplayName(item);
      toast.success(`Đã xóa vĩnh viễn ${item.itemType === 'folder' ? 'thư mục' : 'tài liệu'} "${name}"!`);

      // Cập nhật trực tiếp cache Thùng rác để xóa item khỏi giao diện ngay lập tức mà KHÔNG gọi lại API trash
      queryClient.setQueryData(DOC_QUERY_KEYS.trash.root, (old: any) => {
        if (Array.isArray(old)) {
          return old.filter((t: TrashItem) => t.id !== item.id);
        }
        if (old && Array.isArray(old.items)) {
          return { ...old, items: old.items.filter((t: TrashItem) => t.id !== item.id) };
        }
        if (old && Array.isArray(old.data)) {
          return { ...old, data: old.data.filter((t: TrashItem) => t.id !== item.id) };
        }
        return [];
      });

      setIsPurgeOpen(false);
      setPurgeItem(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Không thể xóa vĩnh viễn mục đã chọn');
    },
    onSettled: () => {
      setActivePurgingId(null);
    },
  });

  // Filter items
  const filteredItems = useMemo(() => {
    return trashItems.filter((item) => {
      if (itemTypeFilter !== 'all' && item.itemType !== itemTypeFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const title = (item.title || (item as any).name || (item as any).folder_name || '').toLowerCase();
        const code = (item.code || '').toLowerCase();
        const fileName = (item.fileName || '').toLowerCase();
        const category = (item.categoryName || '').toLowerCase();
        const deletedBy = (item.deletedByName || '').toLowerCase();

        if (!title.includes(q) && !code.includes(q) && !fileName.includes(q) && !category.includes(q) && !deletedBy.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [trashItems, search, itemTypeFilter]);

  const folderCount = useMemo(
    () => filteredItems.filter((i) => i.itemType === 'folder').length,
    [filteredItems]
  );
  const docCount = useMemo(
    () => filteredItems.filter((i) => i.itemType === 'document').length,
    [filteredItems]
  );

  const hasActiveFilters = Boolean(search.trim() || itemTypeFilter !== 'all');

  const handleResetFilters = useCallback(() => {
    setSearch('');
    setItemTypeFilter('all');
  }, []);

  // Multi-selection helpers
  const toggleSelectItem = useCallback((item: TrashItem) => {
    const key = `${item.itemType}-${item.id}`;
    setSelectedTrashKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const selectSingleItem = useCallback((item: TrashItem) => {
    const key = `${item.itemType}-${item.id}`;
    setSelectedTrashKeys(new Set([key]));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTrashKeys(new Set());
  }, []);

  const isAllSelected = useMemo(
    () => filteredItems.length > 0 && filteredItems.every((it) => selectedTrashKeys.has(`${it.itemType}-${it.id}`)),
    [filteredItems, selectedTrashKeys],
  );

  const handleToggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      clearSelection();
    } else {
      const allKeys = new Set(filteredItems.map((it) => `${it.itemType}-${it.id}`));
      setSelectedTrashKeys(allKeys);
    }
  }, [isAllSelected, filteredItems, clearSelection]);

  const selectedItems = useMemo(() => {
    if (selectedTrashKeys.size === 0) return [];
    return trashItems.filter((it) => selectedTrashKeys.has(`${it.itemType}-${it.id}`));
  }, [trashItems, selectedTrashKeys]);

  // Restore handlers
  const handleOpenRestore = useCallback((item: TrashItem) => {
    setRestoreItem(item);
    setItemsToRestore([item]);
    setIsRestoreOpen(true);
  }, []);

  const handleOpenRestoreSelected = useCallback(() => {
    if (selectedItems.length === 0) return;
    setRestoreItem(null);
    setItemsToRestore(selectedItems);
    setIsRestoreOpen(true);
  }, [selectedItems]);

  const handleCloseRestore = useCallback(() => {
    if (!restoreMutation.isPending && !isBulkRestoring) {
      setIsRestoreOpen(false);
      setRestoreItem(null);
      setItemsToRestore([]);
    }
  }, [restoreMutation.isPending, isBulkRestoring]);

  const handleConfirmRestore = useCallback(async () => {
    const targets = itemsToRestore.length > 0 ? itemsToRestore : restoreItem ? [restoreItem] : [];
    if (targets.length === 0) return;

    if (targets.length === 1) {
      restoreMutation.mutate(targets[0]);
      return;
    }

    setIsBulkRestoring(true);
    const toastId = toast.loading(`Đang khôi phục ${targets.length} mục...`);
    let successCount = 0;
    let errorCount = 0;
    const restoredKeys = new Set<string>();

    // Vòng lặp for gọi liên tiếp API khôi phục
    for (const it of targets) {
      try {
        await restoreTrashItem({
          itemType: it.itemType,
          itemId: it.id,
        });
        successCount++;
        restoredKeys.add(`${it.itemType}-${it.id}`);
      } catch {
        errorCount++;
      }
    }

    if (successCount > 0) {
      const errText = errorCount > 0 ? ` (${errorCount} mục thất bại)` : '';
      toast.success(`Đã khôi phục thành công ${successCount} mục!${errText}`, { id: toastId });

      // Cập nhật cache Thùng rác
      queryClient.setQueryData(DOC_QUERY_KEYS.trash.root, (old: any) => {
        if (Array.isArray(old)) {
          return old.filter((t: TrashItem) => !restoredKeys.has(`${t.itemType}-${t.id}`));
        }
        if (old && Array.isArray(old.items)) {
          return { ...old, items: old.items.filter((t: TrashItem) => !restoredKeys.has(`${t.itemType}-${t.id}`)) };
        }
        if (old && Array.isArray(old.data)) {
          return { ...old, data: old.data.filter((t: TrashItem) => !restoredKeys.has(`${t.itemType}-${t.id}`)) };
        }
        return [];
      });

      invalidateDocumentQueries(queryClient, { refetchType: 'none' });
      clearSelection();
    } else {
      toast.error('Không thể khôi phục các mục đã chọn', { id: toastId });
    }

    setIsBulkRestoring(false);
    setIsRestoreOpen(false);
    setItemsToRestore([]);
    setRestoreItem(null);
  }, [itemsToRestore, restoreItem, restoreMutation, queryClient, clearSelection]);

  // Purge handlers
  const handleOpenPurge = useCallback((item: TrashItem) => {
    setPurgeItem(item);
    setItemsToPurge([item]);
    setIsPurgeOpen(true);
  }, []);

  const handleOpenPurgeSelected = useCallback(() => {
    if (selectedItems.length === 0) return;
    setPurgeItem(null);
    setItemsToPurge(selectedItems);
    setIsPurgeOpen(true);
  }, [selectedItems]);

  const handleClosePurge = useCallback(() => {
    if (!purgeMutation.isPending && !isBulkPurging) {
      setIsPurgeOpen(false);
      setPurgeItem(null);
      setItemsToPurge([]);
    }
  }, [purgeMutation.isPending, isBulkPurging]);

  const handleConfirmPurge = useCallback(async () => {
    const targets = itemsToPurge.length > 0 ? itemsToPurge : purgeItem ? [purgeItem] : [];
    if (targets.length === 0) return;

    if (targets.length === 1) {
      purgeMutation.mutate(targets[0]);
      return;
    }

    setIsBulkPurging(true);
    const toastId = toast.loading(`Đang xóa vĩnh viễn ${targets.length} mục...`);
    let successCount = 0;
    let errorCount = 0;
    const deletedKeys = new Set<string>();

    // Vòng lặp for gọi liên tiếp API xóa vĩnh viễn
    for (const it of targets) {
      try {
        await purgeTrashItem({
          itemType: it.itemType,
          itemId: it.id,
        });
        successCount++;
        deletedKeys.add(`${it.itemType}-${it.id}`);
      } catch {
        errorCount++;
      }
    }

    if (successCount > 0) {
      const errText = errorCount > 0 ? ` (${errorCount} mục thất bại)` : '';
      toast.success(`Đã xóa vĩnh viễn thành công ${successCount} mục!${errText}`, { id: toastId });

      // Cập nhật trực tiếp cache Thùng rác
      queryClient.setQueryData(DOC_QUERY_KEYS.trash.root, (old: any) => {
        if (Array.isArray(old)) {
          return old.filter((t: TrashItem) => !deletedKeys.has(`${t.itemType}-${t.id}`));
        }
        if (old && Array.isArray(old.items)) {
          return { ...old, items: old.items.filter((t: TrashItem) => !deletedKeys.has(`${t.itemType}-${t.id}`)) };
        }
        if (old && Array.isArray(old.data)) {
          return { ...old, data: old.data.filter((t: TrashItem) => !deletedKeys.has(`${t.itemType}-${t.id}`)) };
        }
        return [];
      });

      clearSelection();
    } else {
      toast.error('Không thể xóa vĩnh viễn các mục đã chọn', { id: toastId });
    }

    setIsBulkPurging(false);
    setIsPurgeOpen(false);
    setItemsToPurge([]);
    setPurgeItem(null);
  }, [itemsToPurge, purgeItem, purgeMutation, queryClient, clearSelection]);

  // Phím tắt bàn phím: Escape hủy chọn, Delete xóa vĩnh viễn các mục đang chọn
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement as HTMLElement)?.isContentEditable;
      if (isInput) return;

      if (e.key === 'Escape' && selectedTrashKeys.size > 0) {
        clearSelection();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A') && filteredItems.length > 0) {
        e.preventDefault();
        const allKeys = new Set(filteredItems.map((it) => `${it.itemType}-${it.id}`));
        setSelectedTrashKeys(allKeys);
      } else if ((e.key === 'Delete' || e.key === 'Del') && selectedTrashKeys.size > 0 && !isPurgeOpen && !isRestoreOpen) {
        e.preventDefault();
        handleOpenPurgeSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTrashKeys.size, filteredItems, isPurgeOpen, isRestoreOpen, clearSelection, handleOpenPurgeSelected]);

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white select-none">
      {/* 1. Thanh công cụ Tìm kiếm, Bộ lọc & Nút chuyển chế độ xem (Lưới / Danh sách) */}
      <div className="bg-white border-b border-slate-200/80 p-4 shrink-0 shadow-2xs">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Trái: Tìm kiếm & Lọc loại mục */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap flex-1 min-w-0">
            {/* Input tìm kiếm */}
            <div className="relative w-full sm:w-60 md:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã, tiêu đề..."
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Bộ lọc loại mục */}
            <div className="w-44 sm:w-48 shrink-0">
              <Select
                value={itemTypeFilter}
                onChange={(e) => setItemTypeFilter(e.target.value as 'all' | TrashItemType)}
                options={ITEM_TYPE_OPTIONS}
                placeholder="Tất cả loại mục"
                className="h-9 text-xs"
              />
            </div>

            {/* Nút đặt lại bộ lọc */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 px-2.5 rounded-lg border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw size={14} />
              </Button>
            )}
          </div>

          {/* Phải: Thao tác hàng loạt + Chuyển chế độ xem [ ⊞ Lưới | ☰ Danh sách ] */}
          <div className="flex items-center gap-3">
            {selectedTrashKeys.size > 0 && (
              <div className="flex items-center gap-2 animate-in fade-in duration-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenRestoreSelected}
                  className="h-9 px-3 rounded-lg text-xs"
                  leftIcon={<RotateCcw size={13} className="text-primary" />}
                >
                  Khôi phục ({selectedTrashKeys.size})
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleOpenPurgeSelected}
                  className="h-9 px-3 rounded-lg text-xs"
                  leftIcon={<Trash2 size={13} />}
                >
                  Xóa vĩnh viễn ({selectedTrashKeys.size})
                </Button>
              </div>
            )}

            <div className="flex items-center p-0.5 rounded-xl border border-slate-200 bg-slate-100/80 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Dạng lưới"
              >
                <LayoutGrid size={15} />
                <span className="text-xs">Lưới</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-primary shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Dạng danh sách"
              >
                <List size={15} />
                <span className="text-xs">Danh sách</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Nội dung chính toàn chiều rộng */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onClick={() => {
          clearSelection();
        }}
      >
        {/* Header đếm số lượng thư mục & tài liệu */}
        <div onClick={(e) => e.stopPropagation()}>
          <TrashHeader
            folderCount={folderCount}
            docCount={docCount}
            isLoading={isLoading}
            totalCount={filteredItems.length}
            isAllSelected={isAllSelected}
            onToggleSelectAll={handleToggleSelectAll}
          />
        </div>

        {/* Nội dung danh sách / lưới */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-slate-200/60 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-14 text-center">
            <div className="flex flex-col items-center justify-center max-w-sm mx-auto gap-3 text-slate-500">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
              <p className="font-semibold text-slate-800 text-sm">Không thể tải thùng rác</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RotateCcw size={14} />}>
                Thử lại
              </Button>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center">
            <div className="flex flex-col items-center justify-center max-w-sm mx-auto gap-2.5 text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                {hasActiveFilters ? <SearchX size={22} /> : <Trash2 size={24} />}
              </div>
              <p className="font-semibold text-slate-800 text-sm">
                {hasActiveFilters ? 'Không tìm thấy kết quả phù hợp' : 'Thùng rác trống'}
              </p>
              <p className="text-xs text-slate-400">
                {hasActiveFilters
                  ? 'Thử thay đổi từ khóa hoặc xóa bộ lọc tìm kiếm.'
                  : 'Không có tài liệu hoặc thư mục nào trong thùng rác.'}
              </p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* 1. HIỂN THỊ DẠNG LƯỚI THẺ (GRID) */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map((item) => (
              <TrashCard
                key={`${item.itemType}-${item.id}`}
                item={item}
                isSelected={selectedTrashKeys.has(`${item.itemType}-${item.id}`)}
                onToggleSelect={toggleSelectItem}
                onSelect={selectSingleItem}
                onRestore={handleOpenRestore}
                onPurge={handleOpenPurge}
                isRestoring={activeRestoringId === item.id}
                isPurging={activePurgingId === item.id}
              />
            ))}
          </div>
        ) : (
          /* 2. HIỂN THỊ DẠNG DANH SÁCH (GOOGLE DRIVE STYLE LIST) */
          <div className="flex flex-col gap-0 border-t border-slate-200/80">
            {/* Table Header kiểu Google Drive */}
            <div className="flex items-center justify-between py-2.5 px-3.5 border-b border-slate-200 text-xs font-medium text-slate-600 select-none">
              <div className="flex-1 min-w-[260px] pr-3">Tên</div>
              <div className="w-56 hidden sm:block">Lần sửa đổi gần đây nhất</div>
              <div className="w-44 hidden md:block">Chủ sở hữu</div>
              <div className="w-48 hidden lg:block">Vị trí</div>
              <div className="w-20 text-right"></div>
            </div>

            {/* Rows */}
            {filteredItems.map((item) => (
              <TrashListItem
                key={`${item.itemType}-${item.id}`}
                item={item}
                isSelected={selectedTrashKeys.has(`${item.itemType}-${item.id}`)}
                onToggleSelect={toggleSelectItem}
                onSelect={selectSingleItem}
                onRestore={handleOpenRestore}
                onPurge={handleOpenPurge}
                isRestoring={activeRestoringId === item.id}
                isPurging={activePurgingId === item.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* 3. Floating Selection Bar for Trash */}
      {selectedTrashKeys.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700/80 animate-in fade-in slide-in-from-bottom-3 duration-150 text-xs">
          <span className="font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Đã chọn <strong>{selectedTrashKeys.size}</strong> mục
          </span>
          <div className="h-3 w-px bg-slate-700" />
          <button
            type="button"
            onClick={handleOpenRestoreSelected}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-all cursor-pointer border border-slate-600/60 shadow-xs hover:shadow active:scale-95"
            title="Khôi phục các mục đã chọn"
          >
            <RotateCcw size={13} className="text-primary" />
            <span>Khôi phục ({selectedTrashKeys.size})</span>
          </button>
          <button
            type="button"
            onClick={handleOpenPurgeSelected}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-all cursor-pointer shadow-xs hover:shadow active:scale-95"
            title="Xóa vĩnh viễn các mục đã chọn (Delete)"
          >
            <Trash2 size={13} />
            <span>Xóa vĩnh viễn ({selectedTrashKeys.size})</span>
          </button>
          <div className="h-3 w-px bg-slate-700" />
          <button
            type="button"
            onClick={clearSelection}
            className="text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
          >
            Bỏ chọn (Esc)
          </button>
        </div>
      )}

      {/* Restore Confirm Modal */}
      <RestoreConfirmModal
        isOpen={isRestoreOpen}
        onClose={handleCloseRestore}
        item={restoreItem}
        items={itemsToRestore}
        onConfirm={handleConfirmRestore}
        loading={restoreMutation.isPending || isBulkRestoring}
      />

      {/* Purge Confirm Modal */}
      <PurgeConfirmModal
        isOpen={isPurgeOpen}
        onClose={handleClosePurge}
        item={purgeItem}
        items={itemsToPurge}
        onConfirm={handleConfirmPurge}
        loading={purgeMutation.isPending || isBulkPurging}
      />
    </div>
  );
};
