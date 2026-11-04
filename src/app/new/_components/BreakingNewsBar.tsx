'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, ChevronRight } from 'lucide-react';
import { Article } from '@/types/news';

interface BreakingNewsBarProps {
  breakingArticles: Article[];
}

export const BreakingNewsBar: React.FC<BreakingNewsBarProps> = ({ breakingArticles }) => {
  if (!breakingArticles || breakingArticles.length === 0) return null;

  const topBreaking = breakingArticles[0];

  return (
    <div className="w-full bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-red-500/10 border border-orange-200/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-2.5 overflow-hidden">
        {/* Nhãn Tin Nóng */}
        <span className="inline-flex items-center gap-1 bg-orange-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 tracking-wide uppercase animate-pulse">
          <Flame size={12} />
          Tin nóng
        </span>

        {/* Tiêu đề tin nóng */}
        <Link
          href={`/new/${topBreaking.slug}`}
          className="text-xs sm:text-sm font-semibold text-slate-800 hover:text-orange-600 transition-colors truncate"
        >
          {topBreaking.title}
        </Link>
      </div>

      <Link
        href={`/new/${topBreaking.slug}`}
        className="hidden sm:inline-flex items-center gap-0.5 text-xs font-semibold text-orange-600 hover:text-orange-700 shrink-0"
      >
        <span>Xem ngay</span>
        <ChevronRight size={14} />
      </Link>
    </div>
  );
};

export default BreakingNewsBar;

