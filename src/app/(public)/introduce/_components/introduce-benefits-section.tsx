'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Gem } from 'lucide-react';
import { INTRODUCE_EASE_OUT, SOFTWARE_BENEFITS } from '../_constants/introduce.constants';

const UNIFIED_STEP_STYLE = {
  title: 'text-primary font-black tracking-tight leading-snug text-lg sm:text-xl lg:text-2xl',
  desc: 'mt-2 text-sm sm:text-base leading-relaxed text-slate-600',
  node: 'border-2 border-primary bg-white text-primary shadow-md shadow-primary/15',
};

export function IntroduceBenefitsSection() {
  return (
    <section className="border-b border-t border-slate-100 bg-white py-16 sm:py-24 overflow-hidden">
      <div className="mx-auto w-full max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1500px] px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Tiêu đề căn giữa thoáng đãng, lược bỏ cột dài bên trái */}
        <div className="mx-auto mb-14 max-w-3xl text-center sm:mb-18 lg:mb-22">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
            <Gem className="h-3.5 w-3.5" />
            <span>Giá trị cốt lõi</span>
          </span> 
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl lg:text-4xl">
            Giá trị cốt lõi khi <span className="text-primary">vận hành trên XT Tech</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Chuẩn hóa quy trình sản xuất, bóc tách và giám sát công trình giúp loại bỏ hao hụt và tối ưu hóa lợi nhuận.
          </p>
        </div>

        {/* Sơ đồ dạng xen kẽ: bên này (trái) -> xong bên kia (phải) */}
        <div className="relative mx-auto w-full max-w-6xl xl:max-w-[1320px] 2xl:max-w-[1400px]">
          {/* Trục dọc trung tâm (Desktop) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-4 bottom-4 hidden -translate-x-1/2 w-0.5 bg-linear-to-b from-primary/15 via-primary to-primary/15 lg:block"
          />

          {/* Trục dọc bên trái (Mobile & Tablet) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-4 bottom-4 w-0.5 bg-linear-to-b from-primary/20 via-primary to-primary/20 lg:hidden"
          />

          <div className="space-y-12 sm:space-y-16 lg:space-y-20">
            {SOFTWARE_BENEFITS.map((benefit, idx) => {
              const stepNumber = benefit.letter || String(idx + 1).padStart(2, '0');
              const isEven = idx % 2 === 0; // chẵn: bên trái (bên này), lẻ: bên phải (bên kia)

              return (
                <div key={benefit.title} className="relative flex items-center">
                  {/* Node tròn trung tâm (Desktop) */}
                  <div
                    aria-hidden="true"
                    className={`hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full font-mono text-sm font-black transition-transform duration-300 hover:scale-110 ${UNIFIED_STEP_STYLE.node}`}
                  >
                    {stepNumber}
                  </div>

                  {/* Node tròn bên trái (Mobile & Tablet) */}
                  <div
                    aria-hidden="true"
                    className={`flex lg:hidden absolute left-4 top-6 -translate-x-1/2 z-20 h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-black shadow-xs ${UNIFIED_STEP_STYLE.node}`}
                  >
                    {stepNumber}
                  </div>

                  {/* Nội dung text: Đẩy xa hẳn ra 2 bên, tạo khoảng đệm thoáng đãng với trục giữa */}
                  <div
                    className={`w-full pl-12 sm:pl-16 lg:pl-0 ${
                      isEven
                        ? 'lg:w-[calc(50%-5rem)] xl:w-[calc(50%-7rem)] 2xl:w-[calc(50%-8rem)] lg:mr-auto lg:text-right lg:pr-6 xl:lg:pr-10'
                        : 'lg:w-[calc(50%-5rem)] xl:w-[calc(50%-7rem)] 2xl:w-[calc(50%-8rem)] lg:ml-auto lg:text-left lg:pl-6 xl:lg:pl-10'
                    }`}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -24 : 24, y: 10 }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      viewport={{ once: true, amount: 0.25, margin: '0px 0px -40px 0px' }}
                      transition={{ duration: 0.5, delay: idx * 0.08, ease: INTRODUCE_EASE_OUT }}
                      className="py-2 lg:py-3"
                    >
                      <h3 className={UNIFIED_STEP_STYLE.title}>{benefit.title}</h3>
                      <p className={UNIFIED_STEP_STYLE.desc}>{benefit.desc}</p>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
