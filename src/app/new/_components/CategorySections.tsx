'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Layers } from 'lucide-react';
import { Article, Category } from '@/types/news';

interface CategorySectionsProps {
  sections: {
    category: Category;
    articles: Article[];
  }[];
  onSelectCategory?: (categoryId: string | number) => void;
}

export const CategorySections: React.FC<CategorySectionsProps> = ({ sections, onSelectCategory }) => {
  if (!sections || sections.length === 0) return null;

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

  return (
    <section className="flex flex-col gap-6 my-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
        <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
          <Layers size={16} />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-primary tracking-tight">
          Chuyên mục tiêu điểm
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map(({ category, articles }) => (
          <div
            key={category.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between"
          >
            {/* Header chuyên mục */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-4 rounded-full bg-primary" />
                {category.name}
              </h3>
              <button
                type="button"
                onClick={() => onSelectCategory?.(category.id)}
                className="text-xs text-slate-400 font-medium hover:text-primary transition-colors flex items-center gap-0.5 cursor-pointer group"
                title={`Xem thêm các bài viết về ${category.name}`}
              >
                <span>Xem thêm</span>
                <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* 2 bài viết trong chuyên mục */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              {articles.slice(0, 2).map((article) => (
                <article key={article.id} className="group flex flex-col justify-between">
                  <div>
                    <Link
                      href={`/new/${article.slug}`}
                      className={`block relative h-28 w-full rounded-xl bg-gradient-to-br ${getCategoryColor(
                        article.category?.slug || category.slug || 'tin-tuc',
                      )} overflow-hidden p-3 shadow-2xs group-hover:opacity-95 transition-opacity mb-2.5`}
                    >
                      <span className="text-[10px] text-white/90 font-medium">
                        {article.readingMinutes || 5} phút đọc
                      </span>
                    </Link>

                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      <Link href={`/new/${article.slug}`}>{article.title}</Link>
                    </h4>
                    <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-2 pt-1.5 border-t border-slate-100">
                    <span>{article.author?.displayName || 'Tác giả'}</span>
                    <span>·</span>
                    <span>
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString('vi-VN')
                        : ''}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategorySections;

