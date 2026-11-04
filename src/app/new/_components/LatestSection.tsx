'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components';
import { Article } from '@/types/news';

interface LatestSectionProps {
  articles: Article[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return 'Vừa xong';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `Cập nhật ${diffMins} phút trước`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Cập nhật ${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  return `Cập nhật ${diffDays} ngày trước`;
}

export const LatestSection: React.FC<LatestSectionProps> = ({
  articles,
  onLoadMore,
  hasMore = false,
}) => {
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
      default:
        return 'from-slate-600 to-zinc-700';
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
        <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
          <BookOpen size={16} />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Dòng tin tức mới nhất
        </h2>
      </div>

      <div className="flex flex-col divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs">
        {articles.map((article) => (
          <article
            key={article.id}
            className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row items-start gap-4 group"
          >
            {/* Ảnh nhỏ / Khối màu */}
            <Link
              href={`/new/${article.slug}`}
              className={`w-full sm:w-44 h-28 rounded-xl bg-gradient-to-br ${getCategoryColor(
                article.category?.slug || 'tin-tuc',
              )} shrink-0 p-3 flex flex-col justify-between overflow-hidden shadow-2xs group-hover:opacity-95 transition-opacity`}
            >
              <span className="inline-flex self-start px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white text-slate-800 shadow-xs">
                {article.category?.name || 'Tin tức'}
              </span>
              <span className="text-[10px] text-white/90 font-medium">
                {article.readingMinutes || 5} phút đọc
              </span>
            </Link>

            {/* Nội dung bài viết */}
            <div className="flex-1 flex flex-col justify-between h-full">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  <Link href={`/new/${article.slug}`}>{article.title}</Link>
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              {/* Relative time & Tác giả */}
              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-600">{article.author?.displayName || 'Tác giả'}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 text-teal-700 font-medium bg-teal-50 px-2 py-0.5 rounded-full">
                  <Clock size={11} />
                  {formatRelativeTime(article.publishedAt)}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Nút Xem thêm */}
      {hasMore && (
        <div className="flex justify-center mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            className="rounded-full px-6 h-9 font-semibold text-xs border-slate-300 bg-white hover:bg-slate-50 shadow-2xs hover:shadow-xs transition-all active:scale-95"
          >
            Xem thêm bài viết
          </Button>
        </div>
      )}
    </section>
  );
};

export default LatestSection;

