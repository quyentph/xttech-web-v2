'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Mail, Send, CheckCircle2 } from 'lucide-react';
import { Button, Input } from '@/components';
import { Article } from '@/types/news';
import { useSubscribeNewsletter } from '@/hooks/use-news-public';

interface TrendingNewsletterSidebarProps {
  trendingArticles: any[];
}

export const TrendingNewsletterSidebar: React.FC<TrendingNewsletterSidebarProps> = ({
  trendingArticles,
}) => {
  const [email, setEmail] = useState('');
  const subscribeMutation = useSubscribeNewsletter();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    subscribeMutation.mutate(
      { email },
      {
        onSuccess: () => setEmail(''),
      },
    );
  };

  return (
    <aside className="flex flex-col gap-6 w-full">
      {/* 1. Khối Đọc nhiều nhất (Top 5 theo view_count) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center gap-2 pb-3 mb-2 border-b border-slate-100">
          <div className="w-6 h-6 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center">
            <TrendingUp size={15} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Đọc nhiều nhất
          </h3>
        </div>

        <div className="flex flex-col divide-y divide-slate-100">
          {trendingArticles.slice(0, 5).map((article, index) => {
            const rank = index + 1;
            const rankColor =
              rank === 1
                ? 'text-orange-600 font-extrabold text-base'
                : rank === 2
                ? 'text-teal-700 font-bold text-sm'
                : rank === 3
                ? 'text-sky-600 font-bold text-sm'
                : 'text-slate-400 font-bold text-sm';

            return (
              <div key={article.id} className="py-3 first:pt-1 last:pb-1 flex items-start gap-3 group">
                <span className={`w-5 shrink-0 pt-0.5 ${rankColor}`}>
                  0{rank}
                </span>
                <div className="flex-1">
                  <Link
                    href={`/new/${article.slug}`}
                    className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors leading-snug line-clamp-2"
                  >
                    {article.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    {article.category?.name ? (
                      <>
                        <span>{article.category.name}</span>
                        <span>·</span>
                      </>
                    ) : null}
                    <span>{Number(article.viewCount || 0).toLocaleString()} lượt đọc</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Khối Đăng ký nhận bản tin */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 text-teal-300 flex items-center justify-center shrink-0">
            <Mail size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight text-white">
              Bản tin Nhôm Kính
            </h4>
            <p className="text-[11px] text-slate-300">
              Cập nhật giá vật liệu &amp; công nghệ hàng tuần
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Nhận ngay các báo cáo chuyên sâu, bảng báo giá phôi nhôm LME và tài liệu kỹ thuật mới nhất từ XTTech.
        </p>

        <form onSubmit={handleSubscribe} className="flex flex-col gap-2 mt-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập địa chỉ email của bạn..."
            required
            className="w-full h-9 px-3 text-xs bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-400 outline-none focus:border-teal-400 focus:bg-white/15 transition-all"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={subscribeMutation.isPending}
            disabled={subscribeMutation.isPending}
            rightIcon={<Send size={13} />}
            className="w-full h-9 rounded-lg font-semibold text-xs bg-teal-600 hover:bg-teal-500 shadow-sm"
          >
            Đăng ký nhận tin
          </Button>
        </form>

        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1">
          <CheckCircle2 size={12} className="text-teal-400 shrink-0" />
          <span>Cam kết bảo mật thông tin, không spam.</span>
        </div>
      </div>
    </aside>
  );
};

export default TrendingNewsletterSidebar;

