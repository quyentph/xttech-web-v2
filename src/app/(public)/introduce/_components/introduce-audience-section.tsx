'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Check, Users } from 'lucide-react';
import { INTRODUCE_EASE_OUT, TARGET_AUDIENCES } from '../_constants/introduce.constants';

const STAIRCASE_STEPS = [
  {
    step: '01',
    roleTag: 'Sản xuất & Gia công',
    offsetClass: 'ml-0',
  },
  {
    step: '02',
    roleTag: 'Dự án & Xây lắp',
    offsetClass: 'sm:ml-9 lg:ml-12 xl:ml-14',
  },
  {
    step: '03',
    roleTag: 'Hiện trường & Đo đạc',
    offsetClass: 'sm:ml-18 lg:ml-24 xl:ml-28',
  },
  {
    step: '04',
    roleTag: 'Tài chính & Dòng tiền',
    offsetClass: 'sm:ml-27 lg:ml-36 xl:ml-42',
  },
];

export function IntroduceAudienceSection() {
  return (
    <section className="border-b border-slate-100 bg-white py-14 sm:py-20 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header tiêu đề */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            <Users className="h-3.5 w-3.5" />
            <span>Đối tượng sử dụng</span>
          </span>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl lg:text-4xl">
            XT Tech phù hợp với <span className="text-primary">những ai?</span>
          </h1>

          <p className="mt-2.5 text-sm text-slate-500 sm:text-base">
            Mô hình kết nối liền mạch từ xưởng gia công, nhà thầu thi công đến đội thợ và kế toán điều hành.
          </p>
        </div>

        {/* Sơ đồ tư duy dạng bậc thang cắm sát khít vào các khối */}
        <div className="mt-10 sm:mt-14 mx-auto max-w-5xl lg:max-w-6xl">
          {TARGET_AUDIENCES.map((aud, idx) => {
            const Icon = aud.icon;
            const config = STAIRCASE_STEPS[idx] || STAIRCASE_STEPS[0];
            const isLast = idx === TARGET_AUDIENCES.length - 1;
            const isFromLeft = idx % 2 === 0;

            return (
              <div key={aud.title} className="relative mb-7 last:mb-0">
                {/* Thẻ Card bậc thang */}
                <motion.div
                  initial={{ opacity: 0, x: isFromLeft ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.55,
                    delay: idx * 0.1,
                    ease: INTRODUCE_EASE_OUT,
                  }}
                  className={`relative ${config.offsetClass}`}
                >
                  <div className="relative w-full max-w-4xl rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 lg:p-6.5 shadow-xs hover:border-primary/55 hover:shadow-xl hover:shadow-slate-200/80 transition-all duration-300">
                    {/* Header thẻ: Node số bậc + Tên vai trò + Tag phân hệ */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 font-mono text-sm font-black text-primary">
                          {config.step}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900">{aud.title}</h3>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500 font-medium">{aud.subtitle}</p>
                        </div>
                      </div>

                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {config.roleTag}
                      </span>
                    </div>

                    {/* Lưới 4 tính năng then chốt (2 cột) */}
                    <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {aud.points.map((point) => (
                        <div key={point} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-snug">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Đường dẫn bậc thang khép khít tuyệt đối: Chạm đáy tầng trên và cắm thẳng vào đỉnh tầng dưới */}
                {!isLast && (
                  <div aria-hidden="true" className={`pointer-events-none absolute top-full left-0 w-full h-7 z-10 ${config.offsetClass}`}>
                    <svg className="w-full h-full overflow-visible" fill="none">
                      {/* Mobile: Thẳng đứng nối khít từ đáy tầng trên sang tầng dưới */}
                      <path d="M 28 0 V 28" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" className="text-primary/40 sm:hidden" />

                      {/* Tablet (sm:): Bước bậc thang khép khít từ (32, 0) sang (68, 28) */}
                      <path
                        d="M 32 0 V 14 Q 32 20 38 20 H 62 Q 68 20 68 26 V 28"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="text-primary/45 hidden sm:block lg:hidden"
                      />

                      {/* Laptop (lg:): Bước bậc thang khép khít từ (32, 0) sang (80, 28) */}
                      <path
                        d="M 32 0 V 14 Q 32 20 38 20 H 74 Q 80 20 80 26 V 28"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="text-primary/45 hidden lg:block xl:hidden"
                      />

                      {/* Màn hình lớn (xl:): Bước bậc thang khép khít từ (32, 0) sang (88, 28) */}
                      <path
                        d="M 32 0 V 14 Q 32 20 38 20 H 82 Q 88 20 88 26 V 28"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="text-primary/45 hidden xl:block"
                      />

                      {/* Nốt chốt gắn sát khít vào mép đáy tầng trên */}
                      <circle cx="32" cy="0" r="2.5" className="fill-primary hidden sm:block" />

                      {/* Nốt chốt gắn sát khít vào mép đỉnh tầng dưới */}
                      <circle cx="68" cy="28" r="2.5" className="fill-primary hidden sm:block lg:hidden" />
                      <circle cx="80" cy="28" r="2.5" className="fill-primary hidden lg:block xl:hidden" />
                      <circle cx="88" cy="28" r="2.5" className="fill-primary hidden xl:block" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
