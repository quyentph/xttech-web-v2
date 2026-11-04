'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/components';
import {
  Article,
  Category,
  Tag,
  CreateArticleDto,
  UpdateArticleDto,
  ArticleStatus,
} from '@/types/news';

// Hàm tự động sinh slug từ tiêu đề tiếng Việt
function generateSlug(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface NewsArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleToEdit: Article | null;
  categories: Category[];
  tags: Tag[];
  onSubmit: (dto: CreateArticleDto | UpdateArticleDto) => void;
  isLoading: boolean;
}

export const NewsArticleModal: React.FC<NewsArticleModalProps> = ({
  isOpen,
  onClose,
  articleToEdit,
  categories,
  tags,
  onSubmit,
  isLoading,
}) => {
  const isEditing = !!articleToEdit;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailAlt, setThumbnailAlt] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [status, setStatus] = useState<ArticleStatus>('draft');
  const [readingMinutes, setReadingMinutes] = useState(5);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset/populate form khi modal mở hoặc thay đổi articleToEdit
  useEffect(() => {
    if (isOpen) {
      if (articleToEdit) {
        setTitle(articleToEdit.title);
        setSlug(articleToEdit.slug);
        setIsSlugManuallyEdited(true);
        setCategoryId(articleToEdit.categoryId);
        setSelectedTagIds(articleToEdit.tags ? articleToEdit.tags.map((t) => t.id) : []);
        setSummary(articleToEdit.summary || '');
        setContent(articleToEdit.content || '');
        setThumbnailUrl(articleToEdit.thumbnailUrl || '');
        setThumbnailAlt(articleToEdit.thumbnailAlt || '');
        setIsFeatured(articleToEdit.isFeatured);
        setIsBreaking(articleToEdit.isBreaking);
        setStatus(articleToEdit.status);
        setReadingMinutes(articleToEdit.readingMinutes || 5);
        setSeoTitle(articleToEdit.seoTitle || '');
        setSeoDescription(articleToEdit.seoDescription || '');
      } else {
        setTitle('');
        setSlug('');
        setIsSlugManuallyEdited(false);
        setCategoryId(categories[0]?.id || 1);
        setSelectedTagIds([]);
        setSummary('');
        setContent('');
        setThumbnailUrl('');
        setThumbnailAlt('');
        setIsFeatured(false);
        setIsBreaking(false);
        setStatus('draft');
        setReadingMinutes(5);
        setSeoTitle('');
        setSeoDescription('');
      }
      setErrors({});
    }
  }, [isOpen, articleToEdit, categories]);

  // Tự sinh slug khi người dùng gõ tiêu đề (nếu chưa tự sửa slug)
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManuallyEdited) {
      setSlug(generateSlug(val));
    }
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: '' }));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setIsSlugManuallyEdited(true);
  };

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Tiêu đề bài viết không được để trống.';
    } else if (title.trim().length > 300) {
      newErrors.title = 'Tiêu đề không được vượt quá 300 ký tự.';
    }

    if (!categoryId) {
      newErrors.categoryId = 'Vui lòng chọn chuyên mục.';
    }

    if (!content.trim()) {
      newErrors.content = 'Nội dung bài viết không được để trống.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: CreateArticleDto | UpdateArticleDto = {
      ...(isEditing ? { id: articleToEdit.id } : {}),
      title: title.trim(),
      slug: slug.trim() || generateSlug(title),
      categoryId: Number(categoryId),
      tagIds: selectedTagIds,
      summary: summary.trim(),
      content: content.trim(),
      thumbnailUrl: thumbnailUrl.trim() || null,
      thumbnailAlt: thumbnailAlt.trim() || title.trim(),
      isFeatured,
      isBreaking,
      status,
      readingMinutes: Number(readingMinutes) || 5,
      seoTitle: seoTitle.trim() || title.trim(),
      seoDescription: seoDescription.trim() || summary.trim(),
    };

    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      size="xl"
      title={
        <span className="font-bold text-slate-800 text-lg">
          {isEditing ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
        </span>
      }
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg h-9 px-4"
          >
            Hủy
          </Button>

          {/* Nút lưu nhanh theo trạng thái */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            className="rounded-lg h-9 px-5 font-semibold"
          >
            {isEditing
              ? 'Lưu thay đổi'
              : status === 'published'
              ? 'Xuất bản bài'
              : status === 'pending'
              ? 'Gửi duyệt'
              : 'Lưu bản nháp'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2 max-h-[72vh] overflow-y-auto pr-1">
        {/* Tiêu đề bài viết */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700">
            Tiêu đề bài viết <span className="text-red-500">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Nhập tiêu đề bài viết (tối đa 300 ký tự)..."
            error={errors.title}
            maxLength={300}
            className="text-sm font-medium"
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>{errors.title && <span className="text-red-500">{errors.title}</span>}</span>
            <span>{title.length}/300 ký tự</span>
          </div>
        </div>

        {/* Slug URL */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700">
            Đường dẫn Slug <span className="text-slate-400 font-normal">(tự sinh theo tiêu đề hoặc chỉnh sửa)</span>
          </label>
          <div className="flex items-center">
            <span className="h-9 px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-xs text-slate-500 flex items-center font-mono">
              /new/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="duong-dan-bai-viet"
              className="flex-1 h-9 px-3 text-xs bg-white border border-slate-200 rounded-r-lg outline-none focus:border-primary font-mono text-slate-700"
            />
          </div>
        </div>

        {/* Chuyên mục & Trạng thái & Thời gian đọc */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Chuyên mục */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700">
              Chuyên mục <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(Number(e.target.value));
                if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: '' }));
              }}
              className="h-9 px-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 outline-none focus:border-primary cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <span className="text-[11px] text-red-500">{errors.categoryId}</span>}
          </div>

          {/* Trạng thái bài viết */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700">
              Trạng thái xuất bản
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ArticleStatus)}
              className="h-9 px-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 outline-none focus:border-primary cursor-pointer font-medium"
            >
              <option value="draft">Bản nháp (Draft)</option>
              <option value="pending">Chờ duyệt (Pending)</option>
              <option value="published">Xuất bản ngay (Published)</option>
              <option value="archived">Lưu trữ / Gỡ bài (Archived)</option>
            </select>
          </div>

          {/* Thời gian đọc */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700">
              Thời gian đọc (phút)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={readingMinutes}
              onChange={(e) => setReadingMinutes(Number(e.target.value))}
              className="h-9 px-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Cờ Nổi bật & Tin nóng */}
        <div className="flex items-center gap-6 p-3 bg-slate-50/80 rounded-lg border border-slate-200/80">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-800">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary cursor-pointer"
            />
            <span>Đánh dấu bài viết nổi bật (Hero / Tin hot)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-800">
            <input
              type="checkbox"
              checked={isBreaking}
              onChange={(e) => setIsBreaking(e.target.checked)}
              className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500/20 accent-orange-500 cursor-pointer"
            />
            <span className="text-orange-600 font-semibold">Tin nóng khẩn cấp (Breaking Bar)</span>
          </label>
        </div>

        {/* Danh sách Tags (Checklist / Multi-select) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Gắn thẻ bài viết (Tags)
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-white">
            {tags.map((tag) => {
              const selected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer border ${
                    selected
                      ? 'bg-primary text-white border-primary shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  #{tag.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tóm tắt (Sapo) */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700">
            Đoạn tóm tắt (Sapo)
          </label>
          <textarea
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Tóm tắt ngắn gọn nội dung bài viết..."
            className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-primary resize-none text-slate-800"
          />
        </div>

        {/* Nội dung bài viết */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700">
            Nội dung bài viết (HTML) <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={6}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errors.content) setErrors((prev) => ({ ...prev, content: '' }));
            }}
            placeholder="<p>Nhập nội dung bài viết định dạng văn bản hoặc HTML...</p>"
            className="w-full p-2.5 text-xs sm:text-sm font-mono rounded-lg border border-slate-200 bg-white outline-none focus:border-primary text-slate-800"
          />
          {errors.content && <span className="text-[11px] text-red-500">{errors.content}</span>}
        </div>

        {/* Tùy chỉnh SEO (Collapse / Fieldset) */}
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 flex flex-col gap-2.5">
          <span className="text-xs font-bold text-slate-700">Tối ưu hóa SEO (Tùy chọn)</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="SEO Title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Mặc định lấy theo tiêu đề"
              className="text-xs h-8"
            />
            <Input
              label="Ảnh bìa URL (Thumbnail)"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="Để trống sẽ tự hiển thị khối màu chuyên mục"
              className="text-xs h-8"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-600">SEO Description</label>
            <input
              type="text"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Mặc định lấy theo đoạn tóm tắt"
              className="h-8 px-2.5 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-primary text-slate-700"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default NewsArticleModal;

