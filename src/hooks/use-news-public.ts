'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import homeDataJson from '@/app/new/mockup-data/home.json';
import articlesDataJson from '@/app/new/mockup-data/articles.json';
import {
  PublicArticleQueryParams,
  CreateCommentDto,
  SubscribeNewsletterDto,
  Article,
  NewsHomeData,
  Category,
  Tag,
  CommentItem,
} from '@/types/news';

export const NEWS_QUERY_KEYS = {
  home: ['news', 'home'] as const,
  list: (params: PublicArticleQueryParams) => ['news', 'list', params] as const,
  detail: (slug: string) => ['news', 'detail', slug] as const,
  related: (slug: string) => ['news', 'related', slug] as const,
  comments: (slug: string) => ['news', 'comments', slug] as const,
  suggest: (q: string) => ['news', 'suggest', q] as const,
  categories: ['categories'] as const,
  tags: ['tags'] as const,
};

// 1. Hook lấy dữ liệu trang chủ tin tức
export function useHomeNews() {
  return useQuery({
    queryKey: NEWS_QUERY_KEYS.home,
    queryFn: async (): Promise<NewsHomeData> => {
      return (homeDataJson as any).data as NewsHomeData;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// 2. Hook danh sách bài viết công khai có lọc & phân trang
export function useArticles(params: PublicArticleQueryParams) {
  return useQuery({
    queryKey: NEWS_QUERY_KEYS.list(params),
    queryFn: async () => {
      let list: Article[] = ((articlesDataJson as any).data || []) as Article[];

      // Lọc theo category
      if (params.category && params.category !== 'all') {
        list = list.filter(
          (a) =>
            a.category?.id === Number(params.category) ||
            a.category?.slug === params.category ||
            a.categoryId === Number(params.category),
        );
      }

      // Lọc theo từ khóa tìm kiếm
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
    staleTime: 1000 * 60 * 2,
  });
}

// 3. Hook chi tiết bài viết theo slug
export function useArticleDetail(slug: string) {
  return useQuery({
    queryKey: NEWS_QUERY_KEYS.detail(slug),
    queryFn: async (): Promise<Article> => {
      const list: Article[] = ((articlesDataJson as any).data || []) as Article[];
      const found = list.find((a) => a.slug === slug);
      if (!found) {
        throw new Error('Không tìm thấy bài viết');
      }
      return found;
    },
    enabled: !!slug,
  });
}

// 4. Hook lấy bài viết liên quan
export function useRelatedArticles(slug: string) {
  return useQuery({
    queryKey: NEWS_QUERY_KEYS.related(slug),
    queryFn: async (): Promise<Article[]> => {
      const list: Article[] = ((articlesDataJson as any).data || []) as Article[];
      const current = list.find((a) => a.slug === slug);
      return list
        .filter((a) => a.slug !== slug && (!current || a.category?.id === current.category?.id))
        .slice(0, 4);
    },
    enabled: !!slug,
  });
}

// 5. Hook lấy bình luận
export function useComments(slug: string) {
  return useQuery({
    queryKey: NEWS_QUERY_KEYS.comments(slug),
    queryFn: async (): Promise<CommentItem[]> => {
      return [
        {
          id: 1,
          articleId: 1,
          parentId: null,
          authorName: 'Trần Văn Minh',
          authorEmail: 'minh.tv@example.com',
          content: 'Bài viết rất hữu ích cho các xưởng nhôm kính đang tìm giải pháp tối ưu chi phí nguyên liệu.',
          status: 'approved',
          createdAt: '2026-11-03T10:15:00Z',
          replies: [
            {
              id: 2,
              articleId: 1,
              parentId: 1,
              authorName: 'XTTech Admin',
              content: 'Cảm ơn anh Minh đã quan tâm! Sắp tới XTTech sẽ có thêm bài phân tích chuyên sâu về hệ thống phôi nhôm.',
              status: 'approved',
              createdAt: '2026-11-03T11:00:00Z',
            },
          ],
        },
        {
          id: 3,
          articleId: 1,
          parentId: null,
          authorName: 'Lê Hoàng Long',
          authorEmail: 'longlh@example.com',
          content: 'Hệ thống ép đùn này có áp dụng được cho profile nhôm xingfa không tác giả?',
          status: 'approved',
          createdAt: '2026-11-02T15:30:00Z',
          replies: [],
        },
      ] as CommentItem[];
    },
    enabled: !!slug,
  });
}

// 6. Hook gửi bình luận
export function useAddComment(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateCommentDto) => dto,
    onSuccess: () => {
      toast.success('Bình luận của bạn đã được gửi thành công!');
      queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEYS.comments(slug) });
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi gửi bình luận.');
    },
  });
}

// 7. Hook ghi nhận lượt xem
export function useRecordView() {
  return useMutation({
    mutationFn: async (slug: string) => ({ success: true, slug }),
  });
}

// 8. Hook lấy chuyên mục
export function useCategories() {
  return useQuery({
    queryKey: NEWS_QUERY_KEYS.categories,
    queryFn: async (): Promise<Category[]> => {
      return [
        { id: 1, parentId: null, name: 'Công nghệ sản xuất', slug: 'cong-nghe-san-xuat', sortOrder: 1, isActive: true },
        { id: 2, parentId: null, name: 'Thị trường', slug: 'thi-truong', sortOrder: 2, isActive: true },
        { id: 3, parentId: null, name: 'Vật liệu', slug: 'vat-lieu', sortOrder: 3, isActive: true },
        { id: 4, parentId: null, name: 'Dự án', slug: 'du-an', sortOrder: 4, isActive: true },
        { id: 5, parentId: null, name: 'Hướng dẫn kỹ thuật', slug: 'huong-dan-ky-thuat', sortOrder: 5, isActive: true },
      ];
    },
    staleTime: 1000 * 60 * 10,
  });
}

// 9. Hook lấy danh sách tags
export function useTags() {
  return useQuery({
    queryKey: NEWS_QUERY_KEYS.tags,
    queryFn: async (): Promise<Tag[]> => {
      return [
        { id: 1, name: 'Ép đùn nhôm', slug: 'ep-dun-nhom' },
        { id: 2, name: 'Công nghệ sản xuất', slug: 'cong-nghe-san-xuat' },
        { id: 3, name: 'Thị trường', slug: 'thi-truong' },
        { id: 4, name: 'Mặt dựng kính', slug: 'mat-dung-kinh' },
        { id: 5, name: 'Cửa nhôm kính', slug: 'cua-nhom-kinh' },
      ];
    },
    staleTime: 1000 * 60 * 10,
  });
}

// 10. Hook tìm kiếm gợi ý nhanh
export function useSearchSuggest(query: string) {
  return useQuery({
    queryKey: NEWS_QUERY_KEYS.suggest(query),
    queryFn: async () => {
      if (!query || query.trim().length < 2) return [];
      const q = query.toLowerCase().trim();
      const list: Article[] = ((articlesDataJson as any).data || []) as Article[];
      return list
        .filter((a) => a.title.toLowerCase().includes(q))
        .slice(0, 6)
        .map((a) => ({ id: a.id, title: a.title, slug: a.slug }));
    },
    enabled: !!query && query.trim().length >= 2,
    staleTime: 1000 * 60,
  });
}

// 11. Hook đăng ký bản tin Email
export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: async (dto: SubscribeNewsletterDto) => dto,
    onSuccess: () => {
      toast.success('Đăng ký nhận bản tin thành công! Cảm ơn bạn.');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi đăng ký bản tin.');
    },
  });
}

