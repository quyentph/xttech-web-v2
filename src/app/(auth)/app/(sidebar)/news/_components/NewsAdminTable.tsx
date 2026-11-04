'use client';

import React from 'react';
import Link from 'next/link';
import {
  Edit3,
  Trash2,
  Globe,
  Archive,
  Eye,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
} from 'lucide-react';
import { Badge, Button } from '@/components';
import { Article, ArticleStatus, PaginationMeta, UserRole } from '@/types/news';

interface NewsAdminTableProps {
  articles: Article[];
  meta?: PaginationMeta;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
  onChangeStatus: (id: number, status: ArticleStatus) => void;
  currentRole: UserRole;
  onPageChange: (page: number) => void;
}

export const NewsAdminTable: React.FC<NewsAdminTableProps> = ({
  articles,
  meta,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onDelete,
  onChangeStatus,
  currentRole,
  onPageChange,
}) => {
  // Trạng thái Badge
  const getStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case 'published':
        return <Badge variant="success" size="sm" pill>Đã xuất bản</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm" pill>Chờ duyệt</Badge>;
      case 'draft':
        return <Badge variant="default" size="sm" pill>Bản nháp</Badge>;
      case 'archived':
        return <Badge variant="danger" size="sm" pill>Đã lưu trữ</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  // Khối màu theo chuyên mục
  const getCategoryColor = (slug: string) => {
    switch (slug) {
      case 'cong-nghe':
      case 'cong-nghe-san-xuat':
        return 'from-sky-500 to-cyan-600';
      case 'kinh-doanh':
        return 'from-amber-500 to-orange-500';
      case 'vat-lieu':
        return 'from-slate-500 to-slate-600';
      case 'the-thao':
        return 'from-emerald-500 to-teal-600';
      case 'giai-tri':
        return 'from-violet-500 to-purple-600';
      default:
        return 'from-teal-600 to-cyan-700';
    }
  };

  // 1. Trạng thái Đang tải (Skeleton)
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-4 flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-b-0">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-slate-200 rounded-lg shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
            <div className="w-20 h-6 bg-slate-200 rounded-full" />
            <div className="w-24 h-8 bg-slate-200 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  // 2. Trạng thái Lỗi (Error with Retry)
  if (isError) {
    return (
      <div className="bg-white rounded-xl border border-rose-200 p-8 flex flex-col items-center justify-center text-center gap-3">
        <AlertCircle size={36} className="text-rose-500" />
        <h3 className="font-semibold text-slate-800 text-base">Không thể tải danh sách bài viết</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Đã xảy ra lỗi trong quá trình kết nối dữ liệu. Vui lòng nhấn nút thử lại.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw size={14} />}
          className="rounded-lg mt-2 h-9"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  // 3. Trạng thái Trống (Empty State)
  if (!articles || articles.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <Globe size={24} />
        </div>
        <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Chưa có bài viết nào</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại. Bạn có thể thêm bài viết mới hoặc thay đổi tiêu chí tìm kiếm.
        </p>
      </div>
    );
  }

  const isEditorOrAdmin = currentRole === 'admin' || currentRole === 'editor';

  return (
    <div className="flex flex-col gap-3">
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4 w-14">Khối ảnh</th>
              <th className="py-3.5 px-4">Tiêu đề bài viết</th>
              <th className="py-3.5 px-4 w-36">Chuyên mục</th>
              <th className="py-3.5 px-4 w-32">Tác giả</th>
              <th className="py-3.5 px-4 w-28 text-center">Trạng thái</th>
              <th className="py-3.5 px-4 w-24 text-center">Lượt xem</th>
              <th className="py-3.5 px-4 w-28">Ngày tạo</th>
              <th className="py-3.5 px-4 w-40 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {articles.map((article) => {
              return (
                <tr key={article.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Khối ảnh / Thumbnail */}
                  <td className="py-3 px-4">
                    <div
                      className={`w-11 h-11 rounded-lg bg-gradient-to-br ${getCategoryColor(
                        article.category.slug,
                      )} flex items-center justify-center text-white text-[10px] font-bold uppercase shadow-2xs overflow-hidden`}
                    >
                      {article.thumbnailUrl ? (
                        <img
                          src={article.thumbnailUrl}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>XT</span>
                      )}
                    </div>
                  </td>

                  {/* Tiêu đề & Cờ Breaking / Featured */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1 max-w-md">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {article.isBreaking && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">
                            <Flame size={10} /> Tin nóng
                          </span>
                        )}
                        {article.isFeatured && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            <Star size={10} /> Nổi bật
                          </span>
                        )}
                        <span className="font-semibold text-slate-900 line-clamp-2 leading-snug">
                          {article.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono line-clamp-1">
                        /new/{article.slug}
                      </span>
                    </div>
                  </td>

                  {/* Chuyên mục */}
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {article.category.name}
                    </span>
                  </td>

                  {/* Tác giả */}
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800">
                      {article.author.displayName || article.author.fullName || 'Tác giả'}
                    </span>
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(article.status)}
                  </td>

                  {/* Lượt xem & Bình luận */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Eye size={12} className="text-slate-400" />
                        {article.viewCount.toLocaleString()}
                      </span>
                      {article.commentCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                          <MessageSquare size={10} />
                          {article.commentCount}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Ngày tạo */}
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString('vi-VN')
                      : new Date(article.createdAt).toLocaleDateString('vi-VN')}
                  </td>

                  {/* Thao tác */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Xem bài viết công khai nếu đã xuất bản */}
                      {article.status === 'published' && (
                        <Link
                          href={`/new/${article.slug}`}
                          target="_blank"
                          title="Xem trang công khai"
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <ExternalLink size={15} />
                        </Link>
                      )}

                      {/* Sửa bài */}
                      <button
                        type="button"
                        onClick={() => onEdit(article)}
                        title="Chỉnh sửa bài viết"
                        className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 size={15} />
                      </button>

                      {/* Nút Xuất bản / Gỡ bài (Chỉ Editor & Admin) */}
                      {isEditorOrAdmin && (
                        article.status === 'published' ? (
                          <button
                            type="button"
                            onClick={() => onChangeStatus(article.id, 'archived')}
                            title="Gỡ bài viết (Lưu trữ)"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Archive size={15} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onChangeStatus(article.id, 'published')}
                            title="Xuất bản bài viết ngay"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Globe size={15} />
                          </button>
                        )
                      )}

                      {/* Nút Xoá bài (Chỉ Editor & Admin) */}
                      {isEditorOrAdmin && (
                        <button
                          type="button"
                          onClick={() => onDelete(article)}
                          title="Xoá bài viết"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (< 1024px) */}
      <div className="flex lg:hidden flex-col gap-3">
        {articles.map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3 shadow-2xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getCategoryColor(
                  article.category.slug,
                )} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs`}
              >
                XT
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  {getStatusBadge(article.status)}
                  <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                    {article.category.name}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">
                  {article.title}
                </h4>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
              <span>{article.author.displayName}</span>
              <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('vi-VN') : 'Bản nháp'}</span>
            </div>

            {/* Thao tác Mobile */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              <Button
                variant="outline"
                size="xs"
                onClick={() => onEdit(article)}
                leftIcon={<Edit3 size={13} />}
                className="h-8 rounded-lg px-2.5"
              >
                Sửa
              </Button>
              {isEditorOrAdmin && (
                <>
                  {article.status === 'published' ? (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onChangeStatus(article.id, 'archived')}
                      className="h-8 rounded-lg px-2.5 text-amber-700 border-amber-200 hover:bg-amber-50"
                    >
                      Gỡ bài
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onChangeStatus(article.id, 'published')}
                      className="h-8 rounded-lg px-2.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    >
                      Xuất bản
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="xs"
                    onClick={() => onDelete(article)}
                    className="h-8 rounded-lg px-2.5"
                  >
                    Xoá
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Phân trang (Pagination) */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-600">
          <span>
            Hiển thị trang <strong className="text-slate-900">{meta.page}</strong> / {meta.totalPages} (Tổng số {meta.total} bài viết)
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              disabled={meta.page <= 1}
              onClick={() => onPageChange(meta.page - 1)}
              leftIcon={<ChevronLeft size={14} />}
              className="h-8 px-2.5 rounded-lg"
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="xs"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPageChange(meta.page + 1)}
              rightIcon={<ChevronRight size={14} />}
              className="h-8 px-2.5 rounded-lg"
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsAdminTable;

