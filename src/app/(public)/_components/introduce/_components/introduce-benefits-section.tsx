'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { INTRODUCE_EASE_OUT, SOFTWARE_BENEFITS } from './introduce.constants';

const STEP_STYLES = [
  {
    card: 'bg-white text-slate-900 border-slate-200/90 shadow-md shadow-slate-200/40 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10',
    badge: 'bg-primary/10 text-primary border-primary/20',
    title: 'text-slate-900 group-hover:text-primary',
    desc: 'text-slate-600',
    icon: 'text-primary',
    node: 'border-primary bg-white text-primary shadow-primary/20',
  },
  {
    card: 'bg-[#eef8f5] text-slate-900 border-[#d2eee5] shadow-sm hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10',
    badge: 'bg-[#007a6e]/15 text-[#007a6e] border-[#007a6e]/25',
    title: 'text-slate-900 group-hover:text-primary',
    desc: 'text-slate-600',
    icon: 'text-[#007a6e]',
    node: 'border-[#007a6e] bg-[#eef8f5] text-[#007a6e] shadow-[#007a6e]/20',
  },
  {
    card: 'bg-[#d6f0e7] text-slate-900 border-[#b9e5d8] shadow-sm hover:border-primary/60 hover:shadow-xl hover:shadow-primary/15',
    badge: 'bg-[#005b52]/15 text-[#005b52] border-[#005b52]/25',
    title: 'text-slate-900 group-hover:text-primary',
    desc: 'text-slate-700',
    icon: 'text-[#005b52]',
    node: 'border-[#005b52] bg-[#d6f0e7] text-[#005b52] shadow-[#005b52]/20',
  },
  {
    card: 'bg-[#044e54] text-white border-[#033c41] shadow-xl shadow-[#044e54]/25 hover:shadow-2xl hover:shadow-[#044e54]/40 hover:border-teal-400/50',
    badge: 'bg-white/20 text-white border-white/30',
    title: 'text-white',
    desc: 'text-teal-50/90',
    icon: 'text-teal-200',
    node: 'border-teal-300 bg-[#044e54] text-white shadow-teal-500/30',
  },
];

export function IntroduceBenefitsSection() {
  return (
    <section className="border-b border-t border-slate-100 bg-white py-16 sm:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề căn giữa thoáng đãng, lược bỏ cột dài bên trái */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: INTRODUCE_EASE_OUT }}
          className="mx-auto mb-14 max-w-3xl text-center sm:mb-18 lg:mb-22"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Lợi ích vận hành thực tế</span>
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl lg:text-4xl">
            Giá trị thực tế khi <span className="text-primary">vận hành trên XTTECH</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Chuẩn hóa quy trình sản xuất, bóc tách và giám sát công trình giúp loại bỏ hao hụt và tối ưu hóa lợi nhuận.
          </p>
        </motion.div>

        {/* Sơ đồ dạng xen kẽ: bên này (trái) -> xong bên kia (phải) */}
        <div className="relative mx-auto max-w-5xl">
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

          <div className="space-y-8 sm:space-y-10 lg:space-y-12">
            {SOFTWARE_BENEFITS.map((benefit, idx) => {
              const Icon = benefit.icon;
              const stepNumber = String(idx + 1).padStart(2, '0');
              const style = STEP_STYLES[idx] || STEP_STYLES[0];
              const isEven = idx % 2 === 0; // chẵn: bên trái (bên này), lẻ: bên phải (bên kia)

              return (
                <div key={benefit.title} className="relative flex items-center">
                  {/* Node tròn trung tâm (Desktop) */}
                  <div
                    aria-hidden="true"
                    className={`hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full border-2 font-mono text-xs font-black shadow-md transition-transform duration-300 hover:scale-110 ${style.node}`}
                  >
                    {stepNumber}
                  </div>

                  {/* Node tròn bên trái (Mobile & Tablet) */}
                  <div
                    aria-hidden="true"
                    className={`flex lg:hidden absolute left-4 top-6 -translate-x-1/2 z-20 h-7 w-7 items-center justify-center rounded-full border-2 font-mono text-[11px] font-black shadow-xs ${style.node}`}
                  >
                    {stepNumber}
                  </div>

                  {/* Thẻ Card: So le bên trái (isEven) hoặc bên phải (isOdd) */}
                  <div
                    className={`w-full pl-9 sm:pl-10 lg:pl-0 ${
                      isEven ? 'lg:w-[calc(50%-2.5rem)] lg:mr-auto' : 'lg:w-[calc(50%-2.5rem)] lg:ml-auto'
                    }`}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -36 : 36, y: 14 }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      viewport={{ once: true, amount: 0.25, margin: '0px 0px -40px 0px' }}
                      transition={{ duration: 0.52, delay: idx * 0.1, ease: INTRODUCE_EASE_OUT }}
                      className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border p-5 sm:p-6 transition-all duration-300 ease-out hover:-translate-y-1 ${style.card}`}
                    >
                      {/* Đường connector nhánh ngang nối vào trục giữa (Desktop) */}
                      {isEven ? (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-10 -mr-10 border-t-2 border-dashed border-primary/40 z-10"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-10 -ml-10 border-t-2 border-dashed border-primary/40 z-10"
                        />
                      )}

                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl border shadow-2xs transition-transform duration-300 group-hover:scale-110 ${style.badge}`}
                        >
                          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 stroke-[1.8] ${style.icon}`} />
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                          <h3
                            className={`text-base sm:text-lg font-extrabold tracking-tight transition-colors duration-200 ${style.title}`}
                          >
                            {benefit.title}
                          </h3>
                          <p className={`mt-1.5 text-xs sm:text-sm leading-relaxed ${style.desc}`}>
                            {benefit.desc}
                          </p>
                        </div>
                      </div>
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
