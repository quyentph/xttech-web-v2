'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  Clock,
  Eye,
  Bookmark,
  BookmarkCheck,
  Share2,
  ChevronRight,
  MessageSquare,
  Send,
  CornerDownRight,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Header } from '@/app/_components';
import { Button } from '@/components';
import {
  useArticleDetail,
  useRelatedArticles,
  useComments,
  useAddComment,
  useRecordView,
} from '@/hooks/use-news-public';
import { sanitizeRichHtml } from '@/utils';
import { CommentItem } from '@/types/news';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ArticleDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  // 1. Fetch chi tiết bài viết
  const { data: article, isLoading, isError } = useArticleDetail(slug);

  // 2. Fetch bài viết liên quan
  const { data: relatedArticles = [] } = useRelatedArticles(slug);

  // 3. Fetch danh sách bình luận
  const { data: comments = [] } = useComments(slug);

  // 4. Mutations
  const addCommentMutation = useAddComment(slug);
  const recordViewMutation = useRecordView();

  // 5. Ghi nhận lượt xem sau 4 giây
  useEffect(() => {
    if (!article) return;
    const timer = setTimeout(() => {
      recordViewMutation.mutate(slug);
    }, 4000);
    return () => clearTimeout(timer);
  }, [article, slug]);

  // 6. Quản lý trạng thái Lưu bài viết (Bookmark lưu localStorage)
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && article) {
      try {
        const savedList: number[] = JSON.parse(
          localStorage.getItem('xt_saved_articles_ids') || '[]',
        );
        setIsSaved(savedList.includes(article.id));
      } catch (e) {
        console.warn(e);
      }
    }
  }, [article]);

  const handleToggleSave = () => {
    if (!article) return;
    try {
      const savedList: number[] = JSON.parse(
        localStorage.getItem('xt_saved_articles_ids') || '[]',
      );
      if (isSaved) {
        const next = savedList.filter((id) => id !== article.id);
        localStorage.setItem('xt_saved_articles_ids', JSON.stringify(next));
        setIsSaved(false);
        toast.success('Đã bỏ lưu bài viết.');
      } else {
        savedList.push(article.id);
        localStorage.setItem('xt_saved_articles_ids', JSON.stringify(savedList));
        setIsSaved(true);
        toast.success('Đã lưu bài viết vào danh sách đọc sau!');
      }
    } catch {
      toast.error('Không thể thao tác lưu bài viết.');
    }
  };

  // 7. Form gửi bình luận
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitComment = (e: React.FormEvent, parentId: number | null = null) => {
    e.preventDefault();
    const content = parentId ? replyContent : commentContent;
    if (!content.trim()) return;

    addCommentMutation.mutate(
      {
        articleSlug: slug,
        authorName: commentName.trim() || 'Độc giả',
        authorEmail: commentEmail.trim() || undefined,
        content: content.trim(),
        parentId,
      },
      {
        onSuccess: () => {
          if (parentId) {
            setReplyContent('');
            setReplyingToId(null);
          } else {
            setCommentContent('');
          }
        },
      },
    );
  };

  const getCategoryColor = (categorySlug?: string) => {
    switch (categorySlug) {
      case 'cong-nghe':
      case 'cong-nghe-san-xuat':
        return 'from-sky-500 to-cyan-600';
      case 'kinh-doanh':
        return 'from-amber-500 to-orange-500';
      case 'vat-lieu':
        return 'from-slate-500 to-slate-600';
      case 'the-thao':
        return 'from-emerald-500 to-teal-600';
      default:
        return 'from-teal-600 to-cyan-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Header />
        <main className="w-full max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-10 py-8 flex-1 animate-pulse flex flex-col gap-6">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-10 bg-slate-200 rounded w-full" />
          <div className="h-6 bg-slate-100 rounded w-3/4" />
          <div className="h-72 bg-slate-200 rounded-2xl w-full" />
        </main>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-16 max-w-md flex-1 text-center flex flex-col items-center justify-center gap-4">
          <AlertCircle size={48} className="text-rose-500" />
          <h2 className="text-xl font-bold text-slate-900">Không tìm thấy bài viết</h2>
          <p className="text-xs text-slate-500">
            Bài viết này có thể chưa được xuất bản hoặc đường dẫn không còn tồn tại.
          </p>
          <Link href="/new">
            <Button variant="primary" size="sm" leftIcon={<ArrowLeft size={16} />} className="rounded-lg">
              Quay về trang tin tức
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      <Header />

      <main className="w-full max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-10 py-6 flex-1 flex flex-col gap-6">
        {/* 1. Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={13} />
          <Link href="/new" className="hover:text-primary transition-colors">
            Tin tức
          </Link>
          <ChevronRight size={13} />
          <span className="text-primary font-medium">{article.category?.name || 'Tin tức'}</span>
        </nav>

        {/* 2. Tiêu đề bài viết */}
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/80">
              {article.category?.name || 'Tin tức'}
            </span>
            {article.isBreaking && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500 text-white">
                Tin nóng
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Sapo ngắn */}
          {article.summary && (
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed mt-1">
              {article.summary}
            </p>
          )}

          {/* Metadata & Nút Lưu bài */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 pb-4 border-b border-slate-200 text-xs text-slate-500">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-semibold text-slate-800">
                {article.author?.displayName || 'Tác giả'}
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Clock size={13} />
                {article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString('vi-VN')
                  : 'Vừa xong'}
              </span>
              <span>·</span>
              <span>{article.readingMinutes || 5} phút đọc</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Eye size={13} />
                {Number(article.viewCount || 0).toLocaleString()} lượt xem
              </span>
            </div>

            {/* Nút thao tác tương tác */}
            <div className="flex items-center gap-2">
              <Button
                variant={isSaved ? 'primary' : 'outline'}
                size="xs"
                onClick={handleToggleSave}
                leftIcon={isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                className="rounded-full px-3 h-8 text-xs font-semibold"
              >
                {isSaved ? 'Đã lưu' : 'Lưu bài'}
              </Button>

              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Đã sao chép liên kết bài viết!');
                  }
                }}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 cursor-pointer shadow-2xs"
                title="Chia sẻ liên kết"
              >
                <Share2 size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* 3. Ảnh bìa / Khối màu chuyên mục */}
        <div
          className={`w-full h-56 sm:h-80 lg:h-96 rounded-2xl bg-gradient-to-br ${getCategoryColor(
            article.category?.slug || 'tin-tuc',
          )} overflow-hidden shadow-2xs flex items-center justify-center text-white relative`}
        >
          {article.thumbnailUrl ? (
            <img
              src={article.thumbnailUrl}
              alt={article.thumbnailAlt || article.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-center p-6">
              <span className="text-xl sm:text-2xl font-bold tracking-wider uppercase opacity-90">
                {article.category?.name || 'Tin tức'}
              </span>
              <span className="text-xs sm:text-sm text-white/80 max-w-md">
                Phân hệ tin tức &amp; giải pháp kỹ thuật nhôm kính XTTech
              </span>
            </div>
          )}
        </div>

        {/* 4. Nội dung bài viết (Sanitize an toàn) */}
        <article
          className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-800 space-y-4"
          dangerouslySetInnerHTML={{
            __html: sanitizeRichHtml(article.content),
          }}
        />

        {/* 5. Thẻ Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-4 pb-2 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Từ khóa:</span>
            {article.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/new?tag=${tag.slug}`}
                className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-primary/10 hover:text-primary px-3 py-1 rounded-full transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* 6. Bình luận bài viết */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-2xs mt-4 flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MessageSquare size={18} className="text-primary" />
            <h3 className="text-base font-bold text-slate-900">
              Bình luận ({comments.length})
            </h3>
          </div>

          {/* Form gửi bình luận mới */}
          <form onSubmit={(e) => handleSubmitComment(e)} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Tên của bạn..."
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 text-xs sm:text-sm bg-slate-50/50 outline-none focus:border-primary"
              />
              <input
                type="email"
                placeholder="Email của bạn (không bắt buộc)..."
                value={commentEmail}
                onChange={(e) => setCommentEmail(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 text-xs sm:text-sm bg-slate-50/50 outline-none focus:border-primary"
              />
            </div>
            <textarea
              rows={3}
              placeholder="Chia sẻ ý kiến của bạn về bài viết..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              required
              className="w-full p-3 rounded-lg border border-slate-200 text-xs sm:text-sm bg-slate-50/50 outline-none focus:border-primary resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={addCommentMutation.isPending && replyingToId === null}
                rightIcon={<Send size={13} />}
                className="rounded-lg px-5 h-9 font-semibold text-xs"
              >
                Gửi bình luận
              </Button>
            </div>
          </form>

          {/* Danh sách bình luận lồng nhau */}
          <div className="flex flex-col divide-y divide-slate-100 mt-2">
            {comments.length > 0 ? (
              comments.map((item: CommentItem) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">
                      {item.authorName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.content}
                  </p>

                  <div className="flex items-center gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setReplyingToId(replyingToId === item.id ? null : item.id)}
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <CornerDownRight size={12} />
                      Trả lời
                    </button>
                  </div>

                  {/* Form trả lời lồng */}
                  {replyingToId === item.id && (
                    <form
                      onSubmit={(e) => handleSubmitComment(e, item.id)}
                      className="mt-2 pl-4 border-l-2 border-primary/30 flex flex-col gap-2"
                    >
                      <textarea
                        rows={2}
                        placeholder={`Trả lời @${item.authorName}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        required
                        className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-slate-50 outline-none focus:border-primary resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setReplyingToId(null)}
                          className="h-7 px-2.5 text-xs"
                        >
                          Hủy
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          size="xs"
                          loading={addCommentMutation.isPending}
                          className="h-7 px-3 text-xs"
                        >
                          Gửi trả lời
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Các bình luận con (nested replies) */}
                  {item.replies && item.replies.length > 0 && (
                    <div className="mt-2 pl-4 sm:pl-6 border-l-2 border-slate-100 flex flex-col gap-3">
                      {item.replies.map((reply: CommentItem) => (
                        <div key={reply.id} className="bg-slate-50/70 p-3 rounded-xl flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 text-xs">
                              {reply.authorName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-slate-400 py-4">
                Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến!
              </p>
            )}
          </div>
        </section>

        {/* 7. Bài viết liên quan */}
        {relatedArticles.length > 0 && (
          <section className="flex flex-col gap-4 mt-6">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
              Bài viết cùng chuyên mục
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/new/${rel.slug}`}
                  className="group bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div
                    className={`h-24 w-full rounded-lg bg-gradient-to-br ${getCategoryColor(
                      rel.category?.slug || 'tin-tuc',
                    )} mb-2.5 p-2 flex items-end`}
                  >
                    <span className="text-[10px] text-white/90 font-medium">
                      {rel.readingMinutes || 5} phút đọc
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                  <div className="mt-2 text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span>{rel.author?.displayName || 'Tác giả'}</span>
                    <span>{rel.publishedAt ? new Date(rel.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

