'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Eye } from 'lucide-react';
import { Article } from '@/types/news';

interface HeroSectionProps {
  hero: Article;
  featured: Article[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ hero, featured }) => {
  if (!hero) return null;

  const getCategoryColor = (slug: string) => {
    switch (slug) {
      case 'cong-nghe':
      case 'cong-nghe-san-xuat':
        return 'from-sky-500 to-cyan-600';
      case 'kinh-doanh':
        return 'from-amber-500 to-orange-500';
      case 'vat-lieu':
        return 'from-slate-500 to-slate-600';
      default:
        return 'from-teal-600 to-cyan-700';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* 1 Bài nổi bật lớn (8 Cột) */}
      <div className="lg:col-span-8 flex flex-col">
        <article className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
          <Link
            href={`/new/${hero.slug}`}
            className={`block relative h-56 sm:h-72 w-full bg-gradient-to-br ${getCategoryColor(
              hero.category?.slug || 'tin-tuc',
            )} overflow-hidden p-6 flex flex-col justify-between`}
          >
            {/* Pattern trang trí */}
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:28px_28px]" />

            <div className="relative z-10 flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white text-slate-800 shadow-sm">
                {hero.category?.name || 'Tin tức'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500 text-white shadow-xs">
                Nổi bật
              </span>
            </div>

            <div className="relative z-10 text-white/80 text-xs flex items-center gap-3">
              <span className="font-semibold text-white">{hero.author?.displayName || 'Tác giả'}</span>
              <span>·</span>
              <span>{hero.readingMinutes || 5} phút đọc</span>
            </div>
          </Link>

          <div className="p-6 flex flex-col flex-1 justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors">
                <Link href={`/new/${hero.slug}`}>{hero.title}</Link>
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3">
                {hero.summary}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Clock size={13} />
                {hero.publishedAt
                  ? new Date(hero.publishedAt).toLocaleDateString('vi-VN')
                  : 'Vừa đăng'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye size={13} />
                {hero.viewCount.toLocaleString()} lượt xem
              </span>
            </div>
          </div>
        </article>
      </div>

      {/* 3 Bài nổi bật phụ bên phải (4 Cột) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {featured.slice(0, 3).map((item, index) => (
          <article
            key={item.id || index}
            className="group bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between flex-1"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-semibold text-primary">
                  {item.category?.name || 'Tin tức'}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] text-slate-400">{item.readingMinutes || 5} phút đọc</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                <Link href={`/new/${item.slug}`}>{item.title}</Link>
              </h3>
              <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>{item.author?.displayName || 'Tác giả'}</span>
              <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;

