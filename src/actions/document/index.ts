import type { DocumentListResponse } from '@/types/document';
import api from '@/utils/api';

// --- CATEGORIES (THƯ MỤC TÀI LIỆU) ---
export const getDocumentCategoriesTree = async () => {
  try {
    const res = await api.get(`/api/v1/document-categories/tree`);
    return res.data;
  } catch (error) {
    throw new Error('Lỗi khi lấy danh sách thư mục');
  }
};

export const createDocumentCategory = async (data: {
  name: string;
  code: string;
  description?: string;
  parentId?: number | null;
}) => {
  try {
    const res = await api.post(`/api/v1/document-categories`, data);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi tạo thư mục mới');
  }
};

// --- DOCUMENTS (TÀI LIỆU/VĂN BẢN) ---

export const getDocuments = async (params?: {
  categoryId?: number;
  search?: string;
  documentType?: string;
  status?: string;
  approvalStatus?: string;
  createdById?: string;
  approverId?: string;
  startEffectiveDate?: string;
  endEffectiveDate?: string;
  offset?: number;
  limit?: number;
}) => {
  try {
    const res = await api.get(`/api/v1/documents`, { params });
    return res.data as DocumentListResponse;
  } catch (error) {
    throw new Error('Lỗi khi lấy danh sách tài liệu');
  }
};

 export const createDocument = async (formData: FormData) => {
  try {
    const res = await api.post(`/api/v1/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi tạo tài liệu mới');
  }
};

export const updateDocumentCategory = async (id: number, data: { name?: string; parentId?: number | null }) => {
  try {
    const res = await api.put(`/api/v1/document-categories/${id}`, data);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật thư mục');
  }
};

export const deleteDocumentCategory = async (id: number) => {
  try {
    const res = await api.delete(`/api/v1/document-categories/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi xóa thư mục');
  }
};

export const getDocumentCategoryShares = async (id: number) => {
  try {
    const res = await api.get(`/api/v1/document-categories/${id}/shares`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách chia sẻ');
  }
};

export const addDocumentCategoryShare = async (id: number, data: any) => {
  try {
    const res = await api.post(`/api/v1/document-categories/${id}/shares`, data);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi chia sẻ thư mục');
  }
};

export const removeDocumentCategoryShare = async (id: number, shareId: number) => {
  try {
    const res = await api.delete(`/api/v1/document-categories/${id}/shares/${shareId}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi thu hồi chia sẻ');
  }
};

export const getInboxDocuments = async (params?: { isRead?: boolean; offset?: number; limit?: number }) => {
  try {
    const res = await api.get(`/api/v1/documents/inbox`, { params });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi tải hộp thư đến');
  }
};

export const readDocument = async (id: number) => {
  try {
    const res = await api.post(`/api/v1/documents/${id}/read`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi đánh dấu đã đọc');
  }
};

export const saveToFolder = async (id: number, categoryId: number) => {
  try {
    const res = await api.post(`/api/v1/documents/${id}/save-to-folder`, { categoryId });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi lưu lối tắt');
  }
};

export const removeFromFolder = async (id: number, categoryId: number) => {
  try {
    const res = await api.delete(`/api/v1/documents/${id}/remove-from-folder/${categoryId}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi xóa lối tắt');
  }
};

export const deleteDocument = async (id: number) => {
  try {
    const res = await api.delete(`/api/v1/documents/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi xóa tài liệu');
  }
};

export const getDocumentDetails = async (id: number) => {
  try {
    const res = await api.get(`/api/v1/documents/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi tải chi tiết tài liệu');
  }
};

export const submitDocument = async (id: number) => {
  try {
    const res = await api.post(`/api/v1/documents/${id}/submit`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi gửi trình duyệt');
  }
};

export const approveDocument = async (id: number, data: { status: 'approved' | 'rejected'; note?: string }) => {
  try {
    const res = await api.post(`/api/v1/documents/${id}/approve`, data);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi duyệt tài liệu');
  }
};

export const publishDocument = async (id: number) => {
  try {
    const res = await api.post(`/api/v1/documents/${id}/publish`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi ban hành tài liệu');
  }
};

export const uploadDocumentVersion = async (id: number, formData: FormData) => {
  try {
    const res = await api.post(`/api/v1/documents/${id}/versions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi tải lên phiên bản mới');
  }
};
