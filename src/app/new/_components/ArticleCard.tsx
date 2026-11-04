'use client';

import React from 'react';
import Link from 'next/link';
import { Article } from '@/types/news';

interface ArticleCardProps {
  article: Article;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  'cong-nghe-san-xuat': 'bg-gradient-to-br from-sky-500 to-cyan-600',
  'thi-truong': 'bg-gradient-to-br from-amber-500 to-orange-500',
  'vat-lieu': 'bg-gradient-to-br from-slate-500 to-slate-600',
  'du-an': 'bg-gradient-to-br from-teal-600 to-emerald-700',
  'huong-dan-ky-thuat': 'bg-gradient-to-br from-indigo-600 to-violet-600',
};

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const gradientClass =
    (article as any).bannerGradient ||
    (article.category?.slug ? CATEGORY_GRADIENTS[article.category.slug] : undefined) ||
    'bg-gradient-to-br from-slate-600 to-slate-700';

  const authorName =
    article.author?.displayName ||
    article.author?.fullName ||
    (article.author as any)?.name ||
    'XTTech';

  const formattedDate = React.useMemo(() => {
    if ((article as any).date) return (article as any).date;
    if (!article.publishedAt) return 'Mới đăng';
    try {
      const d = new Date(article.publishedAt);
      return isNaN(d.getTime()) ? 'Mới đăng' : d.toLocaleDateString('vi-VN');
    } catch {
      return 'Mới đăng';
    }
  }, [article.publishedAt, (article as any).date]);

  const readingTime = article.readingMinutes
    ? `${article.readingMinutes} phút đọc`
    : (article as any)?.readingTime || '5 phút đọc';

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Top Graphic Banner */}
        <Link
          href={`/new/${article.slug}`}
          className={`block relative h-40 w-full overflow-hidden ${gradientClass} transition-opacity duration-300 group-hover:opacity-95 p-4 flex items-end`}
        >
          {/* Category Badge overlay on banner */}
          <span className="relative z-10 inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-white text-slate-800 shadow-sm">
            {article.category?.name || 'Tin tức'}
          </span>

          {/* Decorative subtle pattern */}
          <div className="absolute inset-0 bg-black/5 opacity-50 mix-blend-overlay" />
        </Link>

        {/* Card Body */}
        <div className="p-5">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-teal-700 transition-colors">
            <Link href={`/new/${article.slug}`}>
              {article.title}
            </Link>
          </h3>

          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {article.summary}
          </p>
        </div>
      </div>

      {/* Card Footer / Meta */}
      <div className="px-5 pb-5 pt-0 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-100/80 mt-1 pt-3">
        <span className="font-medium text-slate-600">
          {authorName}
        </span>
        <span>·</span>
        <span>
          {formattedDate}
        </span>
        <span>·</span>
        <span>
          {readingTime}
        </span>
      </div>
    </article>
  );
};

export default ArticleCard;

