import type { DocumentListResponse } from '@/types/document';
import api from '@/utils/api';

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

export const getDocument = async (id: number) => {
  try {
    const res = await api.get(`/api/v1/documents/${id}`);
    return res.data;
  } catch (error) {
    throw new Error('Lỗi khi lấy thông tin tài liệu');
  }
};
