'use client';

import React, { useState } from 'react';
import { Header } from '../_components';
import { useHomeNews, useArticles, useCategories } from '@/hooks/use-news-public';

import { NewsHeaderBar } from './_components/NewsHeaderBar';
import { CategoryFilter } from './_components/CategoryFilter';
import { BreakingNewsBar } from './_components/BreakingNewsBar';
import { HeroSection } from './_components/HeroSection';
import { HotSection } from './_components/HotSection';
import { LatestSection } from './_components/LatestSection';
import { TrendingNewsletterSidebar } from './_components/TrendingNewsletterSidebar';
import { CategorySections } from './_components/CategorySections';
import { ArticleGrid } from './_components/ArticleGrid';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components';

export default function PublicNewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | number>('all');
  const [displayCount, setDisplayCount] = useState(6);

  // 1. Fetch dữ liệu chuyên mục
  const { data: categories = [] } = useCategories();

  // 2. Fetch dữ liệu Trang chủ từ React Query
  const {
    data: homeData,
    isLoading: isHomeLoading,
    isError: isHomeError,
    refetch: refetchHome,
  } = useHomeNews();

  // 3. Fetch dữ liệu lọc khi chọn danh mục hoặc tìm kiếm
  const isFiltering = activeCategoryId !== 'all' || !!searchQuery.trim();
  const {
    data: filteredResult,
    isLoading: isFilterLoading,
    isError: isFilterError,
    refetch: refetchFiltered,
  } = useArticles({
    category: activeCategoryId !== 'all' ? activeCategoryId : undefined,
    q: searchQuery.trim() || undefined,
    page: 1,
    limit: 20,
  });

  const categoryFilterList = [
    { id: 'all', name: 'Tất cả', slug: 'tat-ca' },
    ...categories.map((c) => ({
      id: String(c.id),
      name: c.name,
      slug: c.slug,
    })),
  ];

  const currentCategory = categories.find(
    (c) => String(c.id) === String(activeCategoryId) || c.slug === activeCategoryId,
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* Header trang chủ hệ thống (Không có chân trang theo yêu cầu) */}
      <Header />

      <main className="w-full max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-10 py-4 sm:py-6 flex-1 flex flex-col gap-5">
        {/* Thanh điều hướng: Chuyên mục (Trái) & Ô tìm kiếm (Phải) - flex justify-between */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 pb-1 border-b border-slate-100">
          <div className="flex-1 min-w-0">
            <CategoryFilter
              categories={categoryFilterList}
              activeCategoryId={String(activeCategoryId)}
              onSelectCategory={(catId) => {
                setActiveCategoryId(catId === 'all' ? 'all' : catId);
                setDisplayCount(6);
              }}
            />
          </div>

          <div className="shrink-0">
            <NewsHeaderBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        </div>

        {/* Chế độ 1: Đang lọc theo chuyên mục hoặc đang tìm kiếm */}
        {isFiltering ? (
          <section className="flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                  {searchQuery.trim()
                    ? `Kết quả tìm kiếm cho: "${searchQuery}"`
                    : `Chuyên mục: ${currentCategory?.name || 'Bài viết'}`}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hiển thị {filteredResult?.data?.length || 0} bài viết phù hợp
                </p>
              </div>

              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  setActiveCategoryId('all');
                  setSearchQuery('');
                }}
                className="rounded-full text-xs"
              >
                Xem tất cả tin tức
              </Button>
            </div>

            {isFilterLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl h-64 border border-slate-200" />
                ))}
              </div>
            ) : isFilterError ? (
              <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center flex flex-col items-center gap-3">
                <AlertCircle size={32} className="text-rose-500" />
                <p className="text-sm font-semibold text-slate-800">Không thể tải bài viết lọc</p>
                <Button variant="outline" size="sm" onClick={() => refetchFiltered()}>
                  Thử lại
                </Button>
              </div>
            ) : filteredResult?.data && filteredResult.data.length > 0 ? (
              <ArticleGrid
                articles={filteredResult.data.slice(0, displayCount)}
                onLoadMore={() => setDisplayCount((prev) => prev + 6)}
                hasMore={displayCount < filteredResult.data.length}
              />
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 my-4 shadow-2xs">
                <p className="text-slate-500 text-sm font-medium">
                  Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại.
                </p>
              </div>
            )}
          </section>
        ) : (
          /* Chế độ 2: Trang chủ tin tức đầy đủ (chuẩn bố cục từ trên xuống) */
          <>
            {isHomeLoading ? (
              <div className="flex flex-col gap-6 py-4 animate-pulse">
                <div className="h-10 bg-slate-200 rounded-xl w-full" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 h-96 bg-slate-200 rounded-2xl" />
                  <div className="lg:col-span-4 h-96 bg-slate-200 rounded-2xl" />
                </div>
              </div>
            ) : isHomeError ? (
              <div className="bg-white rounded-2xl border border-rose-200 p-12 text-center flex flex-col items-center gap-3 my-8">
                <AlertCircle size={36} className="text-rose-500" />
                <h3 className="font-semibold text-slate-800 text-base">Không thể tải trang chủ tin tức</h3>
                <p className="text-xs text-slate-500">Đã xảy ra lỗi khi lấy dữ liệu tin tức. Vui lòng bấm thử lại.</p>
                <Button variant="outline" size="sm" onClick={() => refetchHome()} leftIcon={<RefreshCw size={14} />}>
                  Thử lại
                </Button>
              </div>
            ) : homeData ? (
              <div className="flex flex-col gap-7">
                {/* a. Thanh Tin nóng (1 dòng tiêu đề bài is_breaking mới nhất) */}
                <BreakingNewsBar breakingArticles={homeData.breaking} />

                {/* b. Hero: 1 bài nổi bật lớn + 3 bài phụ */}
                <HeroSection hero={homeData.hero} featured={homeData.featured} />

                {/* c. Khu Tin hot: 4 bài (is_featured hoặc view cao), nhãn Hot + lượt xem, mobile vuốt ngang */}
                <HotSection hotArticles={homeData.hot} />

                {/* d & e. Dòng Tin mới (có Cập nhật X phút trước) kết hợp Sidebar Đọc nhiều + Đăng ký bản tin */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-2">
                  {/* Khu Tin mới (8 Cột) */}
                  <div className="lg:col-span-8">
                    <LatestSection
                      articles={homeData.latest.slice(0, displayCount)}
                      onLoadMore={() => setDisplayCount((prev) => prev + 4)}
                      hasMore={displayCount < homeData.latest.length}
                    />
                  </div>

                  {/* Sidebar (4 Cột): Đọc nhiều top 5 theo view_count & Form đăng ký bản tin */}
                  <div className="lg:col-span-4 sticky top-20">
                    <TrendingNewsletterSidebar trendingArticles={homeData.trending} />
                  </div>
                </div>

                {/* f. Khối theo chuyên mục (Công nghệ, Kinh doanh, Thể thao, Đời sống), mỗi khối 2 bài */}
                <CategorySections
                  sections={homeData.sections}
                  onSelectCategory={(catId) => {
                    setActiveCategoryId(catId);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
