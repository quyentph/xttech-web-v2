import api from '@/utils/api';
import type {
  DocumentCategory,
  CreateDocumentCategoryPayload,
  UpdateDocumentCategoryPayload,
  DocumentItem,
  GetDocumentsParams,
  GetInboxDocumentsParams,
  GetDocumentsResponse,
  FolderShare,
  ShareFolderPayload,
} from '@/types';

// Helper trích xuất thông báo lỗi chi tiết từ backend FastAPI / validator
export const extractErrorMessage = (error: any, fallbackMessage: string): string => {
  const data = error?.response?.data;
  if (!data) return error?.message || fallbackMessage;

  const details = data.details;
  let detailMsg = '';
  if (Array.isArray(details) && details.length > 0) {
    detailMsg = details
      .map((d: any) => {
        if (typeof d === 'string') return d;
        return d.message || d.msg || JSON.stringify(d);
      })
      .filter(Boolean)
      .join(', ');
  } else if (typeof details === 'object' && details !== null) {
    detailMsg = details.message || details.msg || '';
  }

  if (detailMsg) {
    return detailMsg;
  }
  return data.message || fallbackMessage;
};

// ==========================================
// 1. Quản lý Thư mục (Document Categories)
// ==========================================

// Lấy toàn bộ cây thư mục người dùng có quyền truy cập
export const getDocumentCategoryTree = async (): Promise<DocumentCategory[]> => {
  try {
    const res = await api.get('/api/v1/document-categories/tree');
    const raw = res.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.items)) return raw.items;

    // Backend FastAPI có thể trả về camelCase ({ myFolders, sharedFolders })
    // hoặc snake_case ({ my_folders, shared_folders })
    const treeObj = raw?.data ?? raw;
    const my = Array.isArray(treeObj?.myFolders)
      ? treeObj.myFolders
      : Array.isArray(treeObj?.my_folders)
      ? treeObj.my_folders
      : [];
    const shared = Array.isArray(treeObj?.sharedFolders)
      ? treeObj.sharedFolders
      : Array.isArray(treeObj?.shared_folders)
      ? treeObj.shared_folders
      : [];

    const markedMy = my.map((item: DocumentCategory) => ({
      ...item,
      isOwner: item.isOwner ?? true,
      permission: item.permission || 'edit',
      isShared: false,
    }));

    const markedShared = shared.map((item: DocumentCategory) => ({
      ...item,
      isOwner: item.isOwner ?? false,
      permission: item.permission || 'view',
      isShared: true,
    }));

    return [...markedMy, ...markedShared];
  } catch (error: any) {
    console.warn('Lỗi getDocumentCategoryTree:', error);
    return [];
  }
};

// Tạo mới thư mục
export const createDocumentCategory = async (payload: CreateDocumentCategoryPayload): Promise<DocumentCategory> => {
  try {
    const cleanPayload: Record<string, any> = {
      name: payload.name.trim(),
      code: payload.code.trim().toUpperCase(),
    };
    if (payload.description) cleanPayload.description = payload.description.trim();
    if (payload.parentId) cleanPayload.parentId = payload.parentId;

    const res = await api.post('/api/v1/document-categories', cleanPayload);
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể tạo thư mục'));
  }
};

// Cập nhật thư mục
export const updateDocumentCategory = async (id: number, payload: UpdateDocumentCategoryPayload): Promise<DocumentCategory> => {
  try {
    const res = await api.put(`/api/v1/document-categories/${id}`, payload);
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể cập nhật thư mục'));
  }
};

// Xóa thư mục (Soft Delete)
export const deleteDocumentCategory = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/v1/document-categories/${id}`);
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể xóa thư mục. Hãy chắc chắn thư mục không còn tài liệu hoặc thư mục con.'));
  }
};

// ==========================================
// 2. Quản lý Tài liệu (Documents)
// ==========================================

// Lấy danh sách tài liệu với bộ lọc và phân trang
export const getDocuments = async (params?: GetDocumentsParams): Promise<GetDocumentsResponse> => {
  try {
    const res = await api.get('/api/v1/documents', { params });
    const rawData = res.data?.data ?? res.data;
    if (Array.isArray(rawData)) {
      return {
        items: rawData,
        total: rawData.length,
        offset: params?.offset || 0,
        limit: params?.limit || 10,
      };
    }
    return {
      items: rawData?.items || [],
      total: rawData?.total || 0,
      offset: rawData?.offset || 0,
      limit: rawData?.limit || 10,
    };
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể tải danh sách tài liệu'));
  }
};

// Lấy chi tiết một tài liệu
export const getDocumentById = async (id: number): Promise<DocumentItem> => {
  try {
    const res = await api.get(`/api/v1/documents/${id}`);
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể xem chi tiết tài liệu'));
  }
};

// Tạo mới tài liệu (Upload file multipart/form-data)
export const createDocument = async (formData: FormData): Promise<DocumentItem> => {
  try {
    const res = await api.post('/api/v1/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể tạo mới tài liệu'));
  }
};

// Cập nhật thông tin tài liệu
export const updateDocument = async (id: number, data: Partial<DocumentItem>): Promise<DocumentItem> => {
  try {
    const res = await api.put(`/api/v1/documents/${id}`, data);
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể cập nhật tài liệu'));
  }
};

// Xóa tài liệu
export const deleteDocument = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/v1/documents/${id}`);
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể xóa tài liệu'));
  }
};

// Đánh dấu đã đọc
export const markDocumentAsRead = async (id: number): Promise<void> => {
  try {
    await api.post(`/api/v1/documents/${id}/read`);
  } catch (error) {
    console.warn('Lỗi đánh dấu đã đọc:', error);
  }
};

// Lưu vào thư mục cá nhân (Lối tắt / Shortcut)
export const saveDocumentToFolder = async (documentId: number, categoryId: number): Promise<void> => {
  try {
    await api.post(`/api/v1/documents/${documentId}/save-to-folder`, { categoryId });
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể lưu vào thư mục'));
  }
};

// Gỡ tài liệu khỏi thư mục cá nhân (Gỡ lối tắt)
export const removeDocumentFromFolder = async (documentId: number, categoryId: number): Promise<void> => {
  try {
    await api.delete(`/api/v1/documents/${documentId}/remove-from-folder/${categoryId}`);
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể gỡ khỏi thư mục'));
  }
};

// ==========================================
// 3. Phân quyền chia sẻ thư mục (Folder Sharing)
// ==========================================

// 4.1. Phân quyền chia sẻ thư mục: POST /api/v1/document-categories/{id}/shares
export const shareDocumentCategory = async (categoryId: number, payload: ShareFolderPayload): Promise<FolderShare> => {
  try {
    const res = await api.post(`/api/v1/document-categories/${categoryId}/shares`, payload);
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể chia sẻ thư mục'));
  }
};

// 4.2. Xem danh sách những người đang được chia sẻ thư mục: GET /api/v1/document-categories/{id}/shares
export const getDocumentCategoryShares = async (categoryId: number): Promise<FolderShare[]> => {
  try {
    const res = await api.get(`/api/v1/document-categories/${categoryId}/shares`);
    const raw = res.data?.data ?? res.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  } catch (error: any) {
    console.warn('Lỗi getDocumentCategoryShares:', error);
    return [];
  }
};

// 4.3. Thu hồi quyền chia sẻ: DELETE /api/v1/document-categories/{id}/shares/{shareId}
export const revokeDocumentCategoryShare = async (categoryId: number, shareId: number | string): Promise<void> => {
  try {
    await api.delete(`/api/v1/document-categories/${categoryId}/shares/${shareId}`);
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể thu hồi quyền chia sẻ'));
  }
};

// ==========================================
// 4. Phê duyệt & Quy trình tài liệu (Approval Workflow)
// ==========================================

// Phê duyệt hoặc từ chối tài liệu
export const reviewDocument = async (
  documentId: number,
  payload: {
    approvalStatus: 'approved' | 'rejected';
    approvalNote?: string;
  },
): Promise<DocumentItem> => {
  try {
    const res = await api.post(`/api/v1/documents/${documentId}/approve`, payload);
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể xử lý phê duyệt tài liệu'));
  }
};

// Trình duyệt tài liệu (chuyển sang trạng thái chờ duyệt)
export const submitDocument = async (documentId: number): Promise<DocumentItem> => {
  try {
    const res = await api.post(`/api/v1/documents/${documentId}/submit`);
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể trình duyệt tài liệu'));
  }
};

// Ban hành tài liệu đã được duyệt
export const publishDocument = async (documentId: number): Promise<DocumentItem> => {
  try {
    const res = await api.post(`/api/v1/documents/${documentId}/publish`);
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể ban hành tài liệu'));
  }
};

// ==========================================
// 5. Hộp thư đến (Inbox) & Đánh dấu đã đọc
// ==========================================

// 6.1. Lấy danh sách văn bản trong Hộp thư đến (Inbox): GET /api/v1/documents/inbox
export const getInboxDocuments = async (
  params?: GetInboxDocumentsParams,
): Promise<GetDocumentsResponse> => {
  try {
    const res = await api.get('/api/v1/documents/inbox', { params });
    const rawData = res.data?.data ?? res.data;
    if (Array.isArray(rawData)) {
      return {
        items: rawData,
        total: rawData.length,
        offset: params?.offset || 0,
        limit: params?.limit || 10,
      };
    }
    return {
      items: rawData?.items || [],
      total: rawData?.total || 0,
      offset: rawData?.offset || 0,
      limit: rawData?.limit || 10,
    };
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể tải danh sách hộp thư đến'));
  }
};
