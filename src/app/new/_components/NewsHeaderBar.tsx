'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { PanelsTopLeft, Search, ArrowRight, BookOpen } from 'lucide-react';
import { Input } from '@/components/input';
import { useSearchSuggest } from '@/hooks/use-news-public';

interface NewsHeaderBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const NewsHeaderBar: React.FC<NewsHeaderBarProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const [showSuggest, setShowSuggest] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);

  // Hook tìm kiếm gợi ý khi gõ >= 2 ký tự (debounce ngầm qua React Query)
  const { data: suggestions = [] } = useSearchSuggest(searchQuery);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
        setShowSuggest(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full sm:w-80" ref={suggestRef}>
      <Input
        value={searchQuery}
        onChange={(e) => {
          onSearchChange(e.target.value);
          setShowSuggest(true);
        }}
        onFocus={() => setShowSuggest(true)}
        placeholder="Tìm bài viết, ví dụ: kính cường lực"
        fullWidth
        className="rounded-lg pl-3.5 pr-10 h-10 text-sm border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 shadow-none transition-all"
      />
      <Search
        size={18}
        strokeWidth={1.6}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />

      {/* Gợi ý tìm kiếm (Search Suggest Popover) */}
      {showSuggest && searchQuery.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
          <div className="px-3 py-2 bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Gợi ý bài viết
          </div>
          {suggestions.length > 0 ? (
            suggestions.map((item) => (
              <Link
                key={item.id}
                href={`/new/${item.slug}`}
                onClick={() => setShowSuggest(false)}
                className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <BookOpen size={14} className="text-slate-400 group-hover:text-primary shrink-0" />
                  <span className="text-xs font-medium text-slate-800 group-hover:text-primary truncate">
                    {item.title}
                  </span>
                </div>
                <ArrowRight size={12} className="text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            ))
          ) : (
            <div className="p-3 text-center text-xs text-slate-400">
              Không tìm thấy bài viết phù hợp.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsHeaderBar;
