'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Eye, Sparkles } from 'lucide-react';
import { Article } from '@/types/news';

interface HotSectionProps {
  hotArticles: Article[];
}

export const HotSection: React.FC<HotSectionProps> = ({ hotArticles }) => {
  if (!hotArticles || hotArticles.length === 0) return null;

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
        return 'from-rose-500 to-pink-600';
    }
  };

  return (
    <section className="flex flex-col gap-3.5 my-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles size={16} />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Tin tức nổi bật &amp; Xu hướng
          </h2>
        </div>
      </div>

      {/* 4 bài: Mobile vuốt ngang (flex overflow-x-auto), Desktop grid 4 cột */}
      <div className="flex lg:grid lg:grid-cols-4 gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        {hotArticles.slice(0, 4).map((article) => (
          <article
            key={article.id}
            className="group min-w-[260px] sm:min-w-[280px] lg:min-w-0 flex-1 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Graphic Banner */}
              <Link
                href={`/new/${article.slug}`}
                className={`block relative h-32 w-full bg-gradient-to-br ${getCategoryColor(
                  article.category?.slug || 'tin-tuc',
                )} p-3 flex flex-col justify-between overflow-hidden`}
              >
                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                    <Flame size={10} />
                    HOT
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-white/90 bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    <Eye size={11} />
                    {Number(article.viewCount || 0).toLocaleString()}
                  </span>
                </div>

                <span className="relative z-10 text-[11px] font-semibold text-white drop-shadow-xs">
                  {article.category?.name || 'Tin tức'}
                </span>
              </Link>

              {/* Body */}
              <div className="p-3.5">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  <Link href={`/new/${article.slug}`}>{article.title}</Link>
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>
              </div>
            </div>

            <div className="px-3.5 pb-3.5 pt-0 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 mt-2 pt-2">
              <span className="truncate max-w-[130px] font-medium text-slate-600">{article.author?.displayName || 'Tác giả'}</span>
              <span>{article.readingMinutes || 5} phút đọc</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default HotSection;

