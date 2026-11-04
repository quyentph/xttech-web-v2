/**
 * TYPES DEFINITION: PHÂN HỆ TIN TỨC & QUẢN TRỊ CMS
 * Suy diễn từ database/schema.sql và docs/api.md
 */

export type ArticleStatus = 'draft' | 'pending' | 'published' | 'archived';
export type UserRole = 'admin' | 'editor' | 'author' | 'reader';
export type CommentStatus = 'pending' | 'approved' | 'spam' | 'rejected';

// ==========================================
// 1. CÁC THỰC THỂ KHỚP VỚI DATABASE (SNAKE_CASE)
// ==========================================
export interface RoleDb {
  id: number;
  name: UserRole;
  display_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserDb {
  id: number;
  role_id: number;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryDb {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TagDb {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleDb {
  id: number;
  category_id: number;
  author_id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  thumbnail_url: string | null;
  thumbnail_alt: string | null;
  status: ArticleStatus;
  is_featured: boolean;
  is_breaking: boolean;
  view_count: number;
  comment_count: number;
  reading_minutes: number;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleTagDb {
  article_id: number;
  tag_id: number;
  created_at: string;
}

export interface CommentDb {
  id: number;
  article_id: number;
  user_id: number | null;
  parent_id: number | null;
  author_name: string;
  author_email: string | null;
  content: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
}

// ==========================================
// 2. CÁC THỰC THỂ GIAO DIỆN (CAMELCASE)
// ==========================================
export interface Category {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  children?: Category[];
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

export interface Author {
  id: number;
  username?: string;
  displayName: string;
  fullName?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  role?: UserRole;
}

export interface Article {
  id: number;
  categoryId: number;
  authorId: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  thumbnailUrl: string | null;
  thumbnailAlt: string | null;
  status: ArticleStatus;
  isFeatured: boolean;
  isBreaking: boolean;
  viewCount: number;
  commentCount: number;
  readingMinutes: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Liên kết kèm theo sau khi join/transform
  category: Category;
  author: Author;
  tags?: Tag[];
}

export interface CommentItem {
  id: number;
  articleId: number;
  userId: number | null;
  parentId: number | null;
  authorName: string;
  authorEmail?: string | null;
  content: string;
  status: CommentStatus;
  createdAt: string;
  replies?: CommentItem[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface NewsHomeData {
  hero: Article;
  featured: Article[];
  hot: Article[];
  latest: Article[];
  trending: Article[];
  breaking: Article[];
  sections: {
    category: Category;
    articles: Article[];
  }[];
}

// ==========================================
// 3. CÁC DTO THAM SỐ TRUY VẤN & MUTATION
// ==========================================
export interface PublicArticleQueryParams {
  category?: string | number;
  tag?: string | number;
  q?: string;
  sort?: 'latest' | 'views' | 'popular';
  page?: number;
  limit?: number;
}

export interface AdminArticleQueryParams {
  status?: ArticleStatus | 'all';
  category?: string | number;
  q?: string;
  authorId?: number;
  page?: number;
  limit?: number;
  sort?: 'latest' | 'views' | 'title';
}

export interface CreateArticleDto {
  title: string;
  slug?: string;
  categoryId: number;
  summary: string;
  content: string;
  thumbnailUrl?: string | null;
  thumbnailAlt?: string | null;
  tagIds?: number[];
  isFeatured?: boolean;
  isBreaking?: boolean;
  status?: ArticleStatus;
  readingMinutes?: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateArticleDto extends Partial<CreateArticleDto> {
  id: number;
}

export interface CreateCommentDto {
  articleSlug: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  parentId?: number | null;
}

export interface SubscribeNewsletterDto {
  email: string;
}

