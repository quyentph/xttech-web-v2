'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit3,
  Trash2,
  Globe,
  Archive,
  Eye,
  MessageSquare,
  ExternalLink,
  Flame,
  Star,
  Newspaper,
} from 'lucide-react';
import { TableData, ITableColumn } from '@/components/table';
import { Badge, Button } from '@/components';
import {
  fetchAdminArticlesForTable,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
  useChangeArticleStatus,
} from '@/hooks/use-news-admin';
import { useCategories, useTags } from '@/hooks/use-news-public';
import { Article, ArticleStatus } from '@/types/news';

import NewsArticleModal from './_components/NewsArticleModal';
import NewsDeleteModal from './_components/NewsDeleteModal';

export default function AdminNewsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);

  // Fetch danh mục & tags
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();

  // Mutations
  const createArticleMutation = useCreateArticle();
  const updateArticleMutation = useUpdateArticle();
  const deleteArticleMutation = useDeleteArticle({
    q: search,
    status: (status as ArticleStatus) || 'all',
    category: category || 'all',
    page: 1,
    limit: 10,
  });
  const changeStatusMutation = useChangeArticleStatus({
    q: search,
    status: (status as ArticleStatus) || 'all',
    category: category || 'all',
    page: 1,
    limit: 10,
  });

  // Modal quản lý Thêm/Sửa & Xoá
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  const handleOpenCreate = () => {
    setArticleToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (article: Article) => {
    setArticleToEdit(article);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (article: Article) => {
    setArticleToDelete(article);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (dto: any) => {
    if (articleToEdit) {
      await updateArticleMutation.mutateAsync({ id: articleToEdit.id, dto });
    } else {
      await createArticleMutation.mutateAsync(dto);
    }
    setIsFormOpen(false);
  };

  const handleConfirmDelete = async (id: number) => {
    await deleteArticleMutation.mutateAsync(id);
    setIsDeleteOpen(false);
  };

  const handleChangeStatus = async (id: number, nextStatus: ArticleStatus) => {
    await changeStatusMutation.mutateAsync({ id, status: nextStatus });
  };

  // Helper Badge trạng thái
  const getStatusBadge = (st: ArticleStatus) => {
    switch (st) {
      case 'published':
        return <Badge variant="success" size="sm" pill>Đã xuất bản</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm" pill>Chờ duyệt</Badge>;
      case 'draft':
        return <Badge variant="default" size="sm" pill>Bản nháp</Badge>;
      case 'archived':
        return <Badge variant="danger" size="sm" pill>Đã lưu trữ</Badge>;
      default:
        return <Badge variant="default" size="sm">{st}</Badge>;
    }
  };

  // Khối màu theo chuyên mục
  const getCategoryColor = (slug?: string) => {
    switch (slug) {
      case 'cong-nghe':
      case 'cong-nghe-san-xuat':
        return 'from-sky-500 to-cyan-600';
      case 'kinh-doanh':
      case 'thi-truong':
        return 'from-amber-500 to-orange-500';
      case 'vat-lieu':
        return 'from-slate-500 to-slate-600';
      case 'du-an':
        return 'from-teal-600 to-emerald-700';
      default:
        return 'from-teal-600 to-cyan-700';
    }
  };

  // 1. Fetcher function truyền cho TableData
  const fetcher = useMemo(() => {
    return async ({ offset, limit }: { offset: number; limit: number }) => {
      return fetchAdminArticlesForTable({
        offset,
        limit,
        q: search,
        status,
        category,
      });
    };
  }, [search, status, category]);

  // 2. Cấu hình các cột (Desktop View)
  const columns: ITableColumn<Article>[] = useMemo(
    () => [
      {
        key: 'thumbnail',
        label: 'Ảnh bìa',
        minWidth: '70px',
        cell: (row) => (
          <div
            className={`w-11 h-11 rounded-lg bg-gradient-to-br ${getCategoryColor(
              row.category?.slug,
            )} flex items-center justify-center text-white text-[10px] font-bold uppercase shadow-2xs overflow-hidden`}
          >
            {row.thumbnailUrl ? (
              <img src={row.thumbnailUrl} alt={row.title} className="w-full h-full object-cover" />
            ) : (
              <span>XT</span>
            )}
          </div>
        ),
      },
      {
        key: 'title',
        label: 'Tiêu đề bài viết',
        minWidth: '280px',
        cell: (row) => (
          <div className="flex flex-col gap-1 max-w-lg py-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {row.isBreaking && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-100 text-orange-700">
                  <Flame size={10} /> Tin nóng
                </span>
              )}
              {row.isFeatured && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                  <Star size={10} /> Nổi bật
                </span>
              )}
              <span className="font-semibold text-slate-900 line-clamp-2 leading-snug">
                {row.title}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono line-clamp-1">
              /new/{row.slug}
            </span>
          </div>
        ),
      },
      {
        key: 'category',
        label: 'Chuyên mục',
        minWidth: '130px',
        cell: (row) => (
          <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
            {row.category?.name || 'Chung'}
          </span>
        ),
      },
      {
        key: 'author',
        label: 'Tác giả',
        minWidth: '110px',
        cell: (row) => (
          <span className="font-medium text-slate-800 text-xs">
            {row.author?.displayName || 'Ban biên tập'}
          </span>
        ),
      },
      {
        key: 'status',
        label: 'Trạng thái',
        minWidth: '110px',
        cell: (row) => getStatusBadge(row.status),
      },
      {
        key: 'viewCount',
        label: 'Lượt xem',
        minWidth: '100px',
        cell: (row) => (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Eye size={12} className="text-slate-400" />
              {Number(row.viewCount || 0).toLocaleString()}
            </span>
            {Number(row.commentCount || 0) > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                <MessageSquare size={10} />
                {row.commentCount}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'publishedAt',
        label: 'Ngày đăng',
        minWidth: '100px',
        cell: (row) => (
          <span className="text-xs text-slate-500">
            {row.publishedAt
              ? new Date(row.publishedAt).toLocaleDateString('vi-VN')
              : new Date(row.createdAt).toLocaleDateString('vi-VN')}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Thao tác',
        minWidth: '120px',
        cell: (row) => (
          <div className="flex items-center justify-end gap-1">
            {row.status === 'published' && (
              <Link
                href={`/new/${row.slug}`}
                target="_blank"
                title="Xem bài viết"
                className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
              >
                <ExternalLink size={15} />
              </Link>
            )}

            <button
              type="button"
              onClick={() => handleOpenEdit(row)}
              title="Chỉnh sửa bài viết"
              className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 size={15} />
            </button>

            {row.status === 'published' ? (
              <button
                type="button"
                onClick={() => handleChangeStatus(row.id, 'archived')}
                title="Gỡ bài viết (Lưu trữ)"
                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
              >
                <Archive size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleChangeStatus(row.id, 'published')}
                title="Xuất bản bài viết ngay"
                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              >
                <Globe size={15} />
              </button>
            )}

            <button
              type="button"
              onClick={() => handleOpenDelete(row)}
              title="Xoá bài viết"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  // 3. Render Card cho Mobile View
  const renderCard = (row: Article) => (
    <div
      key={row.id}
      className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col gap-2.5 shadow-2xs"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className={`w-9 h-9 rounded-lg bg-gradient-to-br ${getCategoryColor(
              row.category?.slug,
            )} flex items-center justify-center text-white text-[10px] font-bold shrink-0 overflow-hidden`}
          >
            {row.thumbnailUrl ? (
              <img src={row.thumbnailUrl} alt={row.title} className="w-full h-full object-cover" />
            ) : (
              <span>XT</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{row.title}</h4>
            <span className="text-[10px] text-slate-400 font-mono">/new/{row.slug}</span>
          </div>
        </div>
        {getStatusBadge(row.status)}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <span>{row.category?.name || 'Chung'}</span>
        <span>{row.author?.displayName || 'Ban biên tập'}</span>
        <span>
          {row.publishedAt
            ? new Date(row.publishedAt).toLocaleDateString('vi-VN')
            : new Date(row.createdAt).toLocaleDateString('vi-VN')}
        </span>
      </div>

      <div className="flex items-center justify-end gap-1.5 pt-1">
        <Button variant="outline" size="xs" onClick={() => handleOpenEdit(row)}>
          Sửa
        </Button>
        {row.status === 'published' ? (
          <Button
            variant="outline"
            size="xs"
            onClick={() => handleChangeStatus(row.id, 'archived')}
          >
            Gỡ bài
          </Button>
        ) : (
          <Button
            variant="primary"
            size="xs"
            onClick={() => handleChangeStatus(row.id, 'published')}
          >
            Xuất bản
          </Button>
        )}
        <Button variant="danger" size="xs" onClick={() => handleOpenDelete(row)}>
          Xoá
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-4 p-3 sm:p-5">
      {/* Tiêu đề trang quản lý */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Newspaper size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Quản lý tin tức</h1>
            <p className="text-xs text-slate-500">Quản trị các bài viết, chuyên mục và xuất bản tin</p>
          </div>
        </div>
      </div>

      {/* Shared TableData Component */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <TableData<Article>
          fetcher={fetcher}
          queryKey={['admin', 'news', search, status, category]}
          columns={columns}
          renderCard={renderCard}
          search={{
            placeholder: 'Tìm bài viết theo tiêu đề...',
            value: search,
            onChange: setSearch,
          }}
          filters={[
            {
              type: 'select',
              label: 'Trạng thái',
              value: status,
              options: [
                { value: undefined, label: 'Tất cả trạng thái' },
                { value: 'published', label: 'Đã xuất bản' },
                { value: 'pending', label: 'Chờ duyệt' },
                { value: 'draft', label: 'Bản nháp' },
                { value: 'archived', label: 'Đã lưu trữ' },
              ],
              onChange: (val) => setStatus(val),
            },
            {
              type: 'select',
              label: 'Chuyên mục',
              value: category,
              options: [
                { value: undefined, label: 'Tất cả chuyên mục' },
                ...categories.map((c) => ({
                  value: String(c.id),
                  label: c.name,
                })),
              ],
              onChange: (val) => setCategory(val),
            },
          ]}
          actions={
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              leftIcon={<Plus size={16} />}
              className="rounded-lg h-9 px-3.5 text-xs font-semibold shadow-xs"
            >
              Thêm bài viết
            </Button>
          }
        />
      </div>

      {/* Modal Thêm / Sửa bài viết */}
      <NewsArticleModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        articleToEdit={articleToEdit}
        categories={categories}
        tags={tags}
        onSubmit={handleFormSubmit}
        isLoading={createArticleMutation.isPending || updateArticleMutation.isPending}
      />

      {/* Modal Xác nhận xoá bài viết */}
      <NewsDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        article={articleToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteArticleMutation.isPending}
      />
    </div>
  );
}
