'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';
import {
  updateDocumentCategory,
  updateDocument,
  createDocumentCategory,
  createDocument,
  getDocuments,
  getDocumentById,
} from '@/actions/document';
import { getFileUrl } from '@/utils/string';
import { invalidateDocumentQueries } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-query-keys';
import type { DocumentCategory, DocumentItem } from '@/types';

export interface ClipboardItem {
  type: 'folder' | 'document';
  id: number;
  name?: string;
}

export interface ClipboardState {
  action: 'cut' | 'copy';
  items: ClipboardItem[];
}

interface UseDocumentClipboardProps {
  selectedItemKeys: Set<string>;
  currentFolderId: number | null;
  foldersToDisplay: DocumentCategory[];
  documents: DocumentItem[];
  safeCategoryTree: DocumentCategory[];
  isDescendant: (categories: DocumentCategory[], sourceId: number, targetId: number) => boolean;
  clearSelection: () => void;
  isSharedSection: boolean;
}

// Helper tìm thư mục trong cây phân cấp
function findCategoryInTree(tree: DocumentCategory[], id: number): DocumentCategory | null {
  for (const cat of tree) {
    if (cat.id === id) return cat;
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryInTree(cat.children, id);
      if (found) return found;
    }
  }
  return null;
}

// Helper tải file blob từ URL (hỗ trợ kèm Bearer token qua axios api)
async function fetchFileBlob(fileUrl: string): Promise<Blob | null> {
  try {
    const res = await api.get(fileUrl, { responseType: 'blob' });
    return res.data;
  } catch {
    try {
      const res = await fetch(fileUrl);
      if (res.ok) {
        return await res.blob();
      }
    } catch (e) {
      console.warn('Không thể fetch file qua fetch:', e);
    }
    return null;
  }
}

// Helper nhân bản tài liệu
async function duplicateDocument(
  doc: DocumentItem,
  targetFolderId: number | null,
  isSameFolder: boolean
): Promise<void> {
  const currentVersion = doc.currentVersion;
  const filePath = currentVersion?.filePath;
  const fileUrl = currentVersion?.downloadUrl || (filePath ? getFileUrl(filePath) : null);

  const title = isSameFolder ? `${doc.title} (Bản sao)` : doc.title;
  const code = doc.code ? `${doc.code}_COPY_${Date.now().toString().slice(-4)}` : undefined;

  let file: File | null = null;
  if (fileUrl) {
    const blob = await fetchFileBlob(fileUrl);
    if (blob) {
      const fileName = currentVersion?.fileName || `${title}.pdf`;
      file = new File([blob], fileName, { type: blob.type || 'application/octet-stream' });
    }
  }

  // Nếu không tải được file vật lý, tạo blob giữ chỗ để API multipart/form-data không báo lỗi
  if (!file) {
    const emptyBlob = new Blob([''], { type: 'application/octet-stream' });
    file = new File([emptyBlob], currentVersion?.fileName || `${title}.dat`, {
      type: 'application/octet-stream',
    });
  }

  const formData = new FormData();
  formData.append('file', file);

  const documentData: Record<string, any> = {
    title,
    documentType: doc.documentType || 'other',
    shareScope: doc.shareScope || 'private',
    status: 'draft',
    approvalStatus: 'draft',
  };

  if (doc.summary?.trim()) {
    documentData.summary = doc.summary.trim();
  }
  if (code) {
    documentData.code = code;
  }
  if (targetFolderId) {
    documentData.categoryId = targetFolderId;
  }

  formData.append('document_data', JSON.stringify(documentData));
  formData.append('title', title);
  formData.append('documentType', doc.documentType || 'other');
  formData.append('shareScope', doc.shareScope || 'private');
  formData.append('status', 'draft');
  formData.append('approvalStatus', 'draft');

  if (doc.summary?.trim()) {
    formData.append('summary', doc.summary.trim());
  }
  if (code) {
    formData.append('code', code);
  }
  if (targetFolderId) {
    formData.append('categoryId', String(targetFolderId));
  }

  await createDocument(formData);
}

// Helper nhân bản thư mục đệ quy (bao gồm các tài liệu và thư mục con)
async function duplicateFolder(
  sourceCategory: DocumentCategory,
  targetFolderId: number | null,
  isSameParent: boolean
): Promise<void> {
  const newName = isSameParent ? `${sourceCategory.name} (Bản sao)` : sourceCategory.name;

  // 1. Tạo thư mục mới tại vị trí đích
  const createdFolder = await createDocumentCategory({
    name: newName,
    parentId: targetFolderId,
    description: sourceCategory.description || undefined,
  });

  const newFolderId = createdFolder?.id;
  if (!newFolderId) return;

  // 2. Tải và sao chép các tài liệu trực thuộc thư mục cũ
  try {
    const docsRes = await getDocuments({ categoryId: sourceCategory.id, limit: 100 });
    const childDocs = docsRes.items || [];
    for (const childDoc of childDocs) {
      await duplicateDocument(childDoc, newFolderId, false);
    }
  } catch (err) {
    console.warn(`Lỗi khi sao chép tài liệu con của thư mục ${sourceCategory.name}:`, err);
  }

  // 3. Đệ quy sao chép các thư mục con (nếu có)
  if (sourceCategory.children && sourceCategory.children.length > 0) {
    for (const childCat of sourceCategory.children) {
      await duplicateFolder(childCat, newFolderId, false);
    }
  }
}

/**
 * Hook quản lý phím tắt Cắt (Ctrl + X), Sao chép (Ctrl + C), Dán (Ctrl + V)
 * cho tệp tin và thư mục chuẩn như File Explorer / Google Drive
 */
export function useDocumentClipboard({
  selectedItemKeys,
  currentFolderId,
  foldersToDisplay,
  documents,
  safeCategoryTree,
  isDescendant,
  clearSelection,
  isSharedSection,
}: UseDocumentClipboardProps) {
  const queryClient = useQueryClient();
  const [clipboard, setClipboard] = useState<ClipboardState | null>(null);
  const [isPasting, setIsPasting] = useState(false);

  // Tập hợp các ID đang ở trạng thái CẮT để render hiệu ứng mờ (opacity-50)
  const cutItemKeys = useMemo<Set<string>>(() => {
    if (!clipboard || clipboard.action !== 'cut') return new Set();
    return new Set(clipboard.items.map((it) => `${it.type === 'folder' ? 'folder' : 'doc'}-${it.id}`));
  }, [clipboard]);

  // Thực hiện Dán (Paste) các mục trong clipboard vào thư mục hiện tại
  const executePaste = useCallback(async () => {
    if (!clipboard || clipboard.items.length === 0 || isPasting) return;

    if (isSharedSection) {
      toast.error('Không thể dán vào mục Được chia sẻ với tôi');
      return;
    }

    const { action, items } = clipboard;
    const targetFolderId = currentFolderId ? Number(currentFolderId) : null;

    setIsPasting(true);

    if (action === 'cut') {
      const toastId = toast.loading(`Đang di chuyển ${items.length} mục...`);
      let successCount = 0;
      let errorCount = 0;

      for (const item of items) {
        try {
          if (item.type === 'folder') {
            // Kiểm tra không di chuyển vào chính nó
            if (item.id === targetFolderId) {
              toast.error(`Không thể di chuyển thư mục "${item.name || item.id}" vào chính nó.`);
              errorCount++;
              continue;
            }
            // Kiểm tra không di chuyển vào thư mục con cháu của nó
            if (targetFolderId && isDescendant(safeCategoryTree, item.id, targetFolderId)) {
              toast.error(`Không thể di chuyển thư mục "${item.name || item.id}" vào thư mục con của nó.`);
              errorCount++;
              continue;
            }
            await updateDocumentCategory(item.id, { parentId: targetFolderId });
            successCount++;
          } else {
            await updateDocument(item.id, { categoryId: targetFolderId });
            successCount++;
          }
        } catch (err: any) {
          errorCount++;
          console.error('Lỗi khi di chuyển:', err);
        }
      }

      if (successCount > 0) {
        toast.success(`Đã di chuyển thành công ${successCount} mục!`, { id: toastId });
        invalidateDocumentQueries(queryClient);
        setClipboard(null);
        clearSelection();
      } else if (errorCount > 0) {
        toast.error('Không thể hoàn tất di chuyển', { id: toastId });
      }
    } else if (action === 'copy') {
      const toastId = toast.loading(`Đang sao chép ${items.length} mục...`);
      let successCount = 0;
      let errorCount = 0;

      for (const item of items) {
        try {
          if (item.type === 'folder') {
            const sourceFolder =
              foldersToDisplay.find((f) => f.id === item.id) ||
              findCategoryInTree(safeCategoryTree, item.id);

            if (!sourceFolder) {
              errorCount++;
              continue;
            }

            const isSameParent =
              sourceFolder.parentId === null || sourceFolder.parentId === undefined
                ? targetFolderId === null
                : sourceFolder.parentId === targetFolderId;

            await duplicateFolder(sourceFolder, targetFolderId, isSameParent);
            successCount++;
          } else {
            let sourceDoc = documents.find((d) => d.id === item.id);
            if (!sourceDoc) {
              try {
                sourceDoc = await getDocumentById(item.id);
              } catch {
                // ignore
              }
            }

            if (!sourceDoc) {
              errorCount++;
              continue;
            }

            const isSameFolder =
              sourceDoc.categoryId === null || sourceDoc.categoryId === undefined
                ? targetFolderId === null
                : sourceDoc.categoryId === targetFolderId;

            await duplicateDocument(sourceDoc, targetFolderId, isSameFolder);
            successCount++;
          }
        } catch (err: any) {
          errorCount++;
          console.error('Lỗi khi sao chép:', err);
        }
      }

      if (successCount > 0) {
        toast.success(`Đã sao chép thành công ${successCount} mục!`, { id: toastId });
        invalidateDocumentQueries(queryClient);
        clearSelection();
        // Không xóa clipboard khi copy để người dùng có thể dán nhiều lần (chuẩn OS)
      } else {
        toast.error('Không thể hoàn tất sao chép', { id: toastId });
      }
    }

    setIsPasting(false);
  }, [
    clipboard,
    isPasting,
    currentFolderId,
    isSharedSection,
    foldersToDisplay,
    documents,
    safeCategoryTree,
    isDescendant,
    queryClient,
    clearSelection,
  ]);

  // Lắng nghe sự kiện bàn phím toàn cục cho Ctrl+X, Ctrl+C, Ctrl+V, Escape
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Bỏ qua nếu người dùng đang nhập văn bản trong input / textarea / editable element
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement as HTMLElement)?.isContentEditable;

      if (isInput) return;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // 1. Phím Escape: Hủy trạng thái Cắt / Sao chép
      if (e.key === 'Escape' && clipboard) {
        setClipboard(null);
        toast('Đã hủy thao tác di chuyển', { icon: '↩️' });
        return;
      }

      // 2. Ctrl + X (Cut - Cắt)
      if (isCtrlOrCmd && (e.key === 'x' || e.key === 'X')) {
        if (selectedItemKeys.size === 0) return;
        e.preventDefault();

        const items: ClipboardItem[] = [];
        selectedItemKeys.forEach((key) => {
          const [type, idStr] = key.split('-');
          const id = Number(idStr);
          if (type === 'folder') {
            const f = foldersToDisplay.find((item) => item.id === id);
            items.push({ type: 'folder', id, name: f?.name });
          } else if (type === 'doc') {
            const d = documents.find((item) => item.id === id);
            items.push({ type: 'document', id, name: d?.title });
          }
        });

        if (items.length > 0) {
          setClipboard({ action: 'cut', items });
          toast.success(`Đã cắt ${items.length} mục. Mở thư mục đích rồi nhấn Ctrl + V để di chuyển.`);
        }
        return;
      }

      // 3. Ctrl + C (Copy - Sao chép)
      if (isCtrlOrCmd && (e.key === 'c' || e.key === 'C')) {
        if (selectedItemKeys.size === 0) return;
        e.preventDefault();

        const items: ClipboardItem[] = [];
        selectedItemKeys.forEach((key) => {
          const [type, idStr] = key.split('-');
          const id = Number(idStr);
          if (type === 'folder') {
            const f = foldersToDisplay.find((item) => item.id === id);
            items.push({ type: 'folder', id, name: f?.name });
          } else if (type === 'doc') {
            const d = documents.find((item) => item.id === id);
            items.push({ type: 'document', id, name: d?.title });
          }
        });

        if (items.length > 0) {
          setClipboard({ action: 'copy', items });
          toast.success(`Đã sao chép ${items.length} mục. Mở thư mục đích rồi nhấn Ctrl + V để dán.`);
        }
        return;
      }

      // 4. Ctrl + V (Paste - Dán)
      if (isCtrlOrCmd && (e.key === 'v' || e.key === 'V')) {
        if (!clipboard || clipboard.items.length === 0) return;
        e.preventDefault();

        await executePaste();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clipboard, selectedItemKeys, foldersToDisplay, documents, executePaste]);

  return {
    clipboard,
    cutItemKeys,
    clearClipboard: () => setClipboard(null),
    executePaste,
  };
}
