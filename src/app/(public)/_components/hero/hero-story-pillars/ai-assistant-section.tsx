'use client';

import React from 'react';
import type { HeroSectionDemoProps } from './hero-story-pillars.constants';
import { UserPlus } from 'lucide-react';
import { HeroAiAssistantVisual } from '../hero-ai-assistant-visual';

export function AiAssistantSection({ onOpenDemo }: HeroSectionDemoProps) {
  return (
    <section
      id="ai-technology"
      className="relative scroll-mt-16 overflow-hidden bg-white py-6 lg:py-8 border-b border-slate-200/80"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Tiêu đề đặc trưng theo Ảnh 5 */}
        <div className="mx-auto max-w-3xl space-y-2 mb-2">
        
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            <span className="text-primary">Công nghệ AI</span> giảm gánh nặng nhập liệu, tự động hóa mọi tác vụ tại công trường & xưởng
          </h2>
          <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-[#0097b2] to-[#4eb622]" />
        </div>

        {/* Toàn bộ hình ảnh Robot 3D, sóng âm Voice Note, Viewfinder AI Vision và 3 Card đều được CODE 100% */}
        <HeroAiAssistantVisual />

        {/* Nút ĐĂNG KÝ NHẬN DEMO: Tối ưu kích thước gọn đẹp trên mobile, không bị tràn/xuống dòng */}
        <div className="mt-3.5 sm:mt-4 flex justify-center px-4 sm:px-0">
          <button
            type="button"
            onClick={() => onOpenDemo()}
            aria-label="Đăng ký nhận demo phần mềm XTTech"
            className="group inline-flex max-w-full items-center justify-center gap-1.5 sm:gap-2.5 rounded-full border border-primary sm:border-2 bg-white px-4 py-2 sm:px-8 sm:py-3 md:px-10 md:py-3.5 text-[11px] xs:text-xs sm:text-sm md:text-base font-bold uppercase tracking-wide sm:tracking-wider text-primary shadow-xs sm:shadow-md shadow-primary/10 transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-white hover:border-primary hover:shadow-xl hover:shadow-primary/25 cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="h-3.5 w-3.5 sm:h-5 sm:w-5 shrink-0 text-primary transition-all duration-300 group-hover:text-white group-hover:rotate-12" />
            <span>ĐĂNG KÝ SỬ DỤNG MIỄN PHÍ</span>
          </button>
        </div>
      </div>
    </section>
  );
}
