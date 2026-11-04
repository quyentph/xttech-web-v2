'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import articlesDataJson from '@/app/new/mockup-data/articles.json';
import {
  AdminArticleQueryParams,
  CreateArticleDto,
  UpdateArticleDto,
  ArticleStatus,
  Article,
} from '@/types/news';

export const ADMIN_NEWS_QUERY_KEYS = {
  all: ['news', 'admin'] as const,
  list: (params: AdminArticleQueryParams) => ['news', 'admin', 'list', params] as const,
};

// Khởi tạo danh sách bài viết quản trị từ mockup-data/articles.json
let adminArticlesStore: Article[] = [
  ...(((articlesDataJson as any).data || []) as Article[]),
];

// Hàm fetcher chuẩn dành cho TableData component
export async function fetchAdminArticlesForTable({
  offset = 0,
  limit = 10,
  q,
  status,
  category,
}: {
  offset: number;
  limit: number;
  q?: string;
  status?: string;
  category?: string;
}) {
  let list = [...adminArticlesStore];

  if (status && status !== 'all') {
    list = list.filter((a) => a.status === status);
  }

  if (category && category !== 'all') {
    list = list.filter(
      (a) =>
        a.category?.id === Number(category) ||
        a.category?.slug === category ||
        a.categoryId === Number(category),
    );
  }

  if (q && q.trim()) {
    const query = q.toLowerCase().trim();
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.summary.toLowerCase().includes(query),
    );
  }

  return {
    items: list.slice(offset, offset + limit),
    meta: {
      total: list.length,
      offset,
      limit,
      next: offset + limit < list.length,
    },
  };
}

// 1. Hook lấy danh sách bài viết quản trị
export function useAdminArticles(params: AdminArticleQueryParams) {
  return useQuery({
    queryKey: ADMIN_NEWS_QUERY_KEYS.list(params),
    queryFn: async () => {
      let list = [...adminArticlesStore];

      // Lọc trạng thái
      if (params.status && params.status !== 'all') {
        list = list.filter((a) => a.status === params.status);
      }

      // Lọc chuyên mục
      if (params.category && params.category !== 'all') {
        list = list.filter(
          (a) =>
            a.category?.id === Number(params.category) ||
            a.category?.slug === params.category ||
            a.categoryId === Number(params.category),
        );
      }

      // Tìm kiếm
      if (params.q && params.q.trim()) {
        const query = params.q.toLowerCase().trim();
        list = list.filter(
          (a) =>
            a.title.toLowerCase().includes(query) ||
            a.summary.toLowerCase().includes(query),
        );
      }

      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;

      return {
        data: list.slice(startIndex, startIndex + limit),
        meta: {
          total: list.length,
          page,
          limit,
          totalPages: Math.ceil(list.length / limit) || 1,
        },
      };
    },
    staleTime: 1000 * 30,
  });
}

// 2. Hook tạo bài viết mới
export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateArticleDto): Promise<Article> => {
      const newArticle: Article = {
        id: Date.now(),
        categoryId: dto.categoryId,
        authorId: 1,
        title: dto.title,
        slug: dto.slug || `bai-viet-${Date.now()}`,
        summary: dto.summary,
        content: dto.content,
        thumbnailUrl: dto.thumbnailUrl || null,
        thumbnailAlt: dto.thumbnailAlt || dto.title,
        status: dto.status || 'draft',
        isFeatured: dto.isFeatured || false,
        isBreaking: dto.isBreaking || false,
        viewCount: 0,
        commentCount: 0,
        readingMinutes: Math.max(1, Math.ceil(dto.content.length / 500)),
        seoTitle: dto.seoTitle || dto.title,
        seoDescription: dto.seoDescription || dto.summary,
        publishedAt: dto.status === 'published' ? new Date().toISOString() : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: {
          id: dto.categoryId,
          parentId: null,
          name: dto.categoryId === 1 ? 'Công nghệ sản xuất' : 'Vật liệu',
          slug: dto.categoryId === 1 ? 'cong-nghe-san-xuat' : 'vat-lieu',
          sortOrder: 1,
          isActive: true,
        },
        author: {
          id: 1,
          displayName: 'Ban Biên Tập',
          role: 'admin',
        },
        tags: [],
      };

      adminArticlesStore = [newArticle, ...adminArticlesStore];
      return newArticle;
    },
    onSuccess: (newArticle) => {
      toast.success(`Đã tạo bài viết "${newArticle.title}" thành công!`);
      queryClient.invalidateQueries({ queryKey: ADMIN_NEWS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['admin', 'news'] });
      queryClient.invalidateQueries({ queryKey: ['news', 'home'] });
      queryClient.invalidateQueries({ queryKey: ['news', 'list'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Có lỗi xảy ra khi tạo bài viết.');
    },
  });
}

// 3. Hook cập nhật bài viết
export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: number; dto: UpdateArticleDto }): Promise<Article> => {
      const idx = adminArticlesStore.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error('Không tìm thấy bài viết');

      const existing = adminArticlesStore[idx];
      const updated: Article = {
        ...existing,
        ...dto,
        updatedAt: new Date().toISOString(),
        publishedAt:
          dto.status === 'published' && !existing.publishedAt
            ? new Date().toISOString()
            : existing.publishedAt,
      };

      adminArticlesStore[idx] = updated;
      return updated;
    },
    onSuccess: (updated) => {
      toast.success(`Đã cập nhật "${updated.title}" thành công!`);
      queryClient.invalidateQueries({ queryKey: ADMIN_NEWS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['admin', 'news'] });
      queryClient.invalidateQueries({ queryKey: ['news', 'home'] });
      queryClient.invalidateQueries({ queryKey: ['news', 'list'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Có lỗi xảy ra khi cập nhật.');
    },
  });
}

// 4. Hook xoá bài viết
export function useDeleteArticle(queryParams: AdminArticleQueryParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      adminArticlesStore = adminArticlesStore.filter((a) => a.id !== id);
      return id;
    },
    onSuccess: () => {
      toast.success('Đã xoá bài viết thành công.');
      queryClient.invalidateQueries({ queryKey: ADMIN_NEWS_QUERY_KEYS.list(queryParams) });
      queryClient.invalidateQueries({ queryKey: ['admin', 'news'] });
      queryClient.invalidateQueries({ queryKey: ['news', 'home'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Không thể xoá bài viết.');
    },
  });
}

// 5. Hook thay đổi nhanh trạng thái
export function useChangeArticleStatus(queryParams: AdminArticleQueryParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: ArticleStatus }) => {
      const idx = adminArticlesStore.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error('Không tìm thấy bài viết');

      adminArticlesStore[idx] = {
        ...adminArticlesStore[idx],
        status,
        publishedAt:
          status === 'published' ? new Date().toISOString() : adminArticlesStore[idx].publishedAt,
        updatedAt: new Date().toISOString(),
      };
      return adminArticlesStore[idx];
    },
    onSuccess: (updated) => {
      toast.success(`Đã cập nhật trạng thái sang "${updated.status}"`);
      queryClient.invalidateQueries({ queryKey: ADMIN_NEWS_QUERY_KEYS.list(queryParams) });
      queryClient.invalidateQueries({ queryKey: ['admin', 'news'] });
      queryClient.invalidateQueries({ queryKey: ['news', 'home'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Không thể cập nhật trạng thái.');
    },
  });
}

