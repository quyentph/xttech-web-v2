'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { RegisterInlineForm } from '@/components';
import { ECOSYSTEM_MODULES, PRECOMPUTED_SLOGAN_LINES } from '../_constants/introduce.constants';

export function IntroduceHeroSection() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);

  const handleOpenRegister = () => {
    setFormResetKey((prev) => prev + 1);
    setIsRegisterMode(true);
  };

  const handleCloseRegister = () => {
    setIsRegisterMode(false);
    setFormResetKey((prev) => prev + 1);
  };

  return (
    <section className="relative flex min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] items-center justify-center overflow-hidden bg-white py-10 sm:py-14 lg:py-18 xl:py-20">
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isRegisterMode ? 'opacity-100' : 'opacity-0'
        } bg-linear-to-br from-hero-bg-from via-primary to-hero-bg-to`}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-hero-accent/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-teal-300/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-80 w-80 -translate-y-1/2 rounded-full bg-hero-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div
            className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-12 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isRegisterMode ? 'opacity-100 pointer-events-auto relative z-20' : 'opacity-0 pointer-events-none absolute inset-0 z-0'
            }`}
          >
            <div
              className={`lg:col-span-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isRegisterMode
                  ? 'opacity-100 translate-x-0 pointer-events-auto relative z-20'
                  : 'opacity-0 translate-x-12 lg:-translate-x-12 pointer-events-none absolute top-0 left-0 w-full z-0'
              }`}
            >
              <RegisterInlineForm key={`intro-inline-${formResetKey}`} isOpen={isRegisterMode} onBack={handleCloseRegister} />
            </div>

            <div
              className={`hidden space-y-6 lg:col-span-6 lg:block transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isRegisterMode
                  ? 'opacity-100 translate-x-0 pointer-events-auto relative z-20'
                  : 'opacity-0 translate-x-12 pointer-events-none absolute top-0 right-0 w-full z-0'
              }`}
            >
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-hero-accent/30 bg-hero-accent/10 px-3.5 py-1 text-xs font-bold text-hero-accent backdrop-blur-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-hero-accent animate-pulse" />
                  Giải Pháp XT Tech
                </span>
                <h2 className="text-3xl font-black tracking-tight text-white uppercase xl:text-4xl xl:leading-[1.18]">
                  Phần mềm quản trị sản xuất cho <span className="text-hero-accent">Xưởng Nhôm Kính &amp; Nhà Thầu</span>
                </h2>
                <p className="text-sm leading-relaxed text-teal-50/95 sm:text-base">
                  <strong className="text-white">XT Tech</strong> đồng bộ toàn bộ quy trình từ khảo sát ô chờ, thiết kế cửa CAD 2D/3D, bóc tách vật tư
                  và xuất thẻ cắt A4 đến quản lý kho, chấm công tại công trình và báo cáo lãi/lỗ trên một hệ thống duy nhất.
                </p>
              </div>

              <ul className="space-y-3.5 border-t border-white/15 pt-5 text-sm leading-relaxed text-teal-50/95">
                {ECOSYSTEM_MODULES.map((mod) => (
                  <li key={mod.code} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-hero-accent" />
                    <span>
                      <strong className="font-bold text-white">
                        {mod.code} — {mod.name}:
                      </strong>{' '}
                      {mod.desc}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Link
                  href="/pricing"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-hero-accent px-6 py-3.5 text-sm font-bold text-hero-ink shadow-lg shadow-black/20 transition-all hover:bg-hero-accent-hover hover:shadow-xl"
                >
                  <span>Xem bảng giá chi tiết</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <button
                  type="button"
                  onClick={handleCloseRegister}
                  className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 px-5 py-3.5 text-sm font-bold text-white backdrop-blur-xs shadow-lg transition-all"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <span>Quay lại giới thiệu</span>
                </button>
              </div>
            </div>
          </div>

          <div
            className={`mx-auto max-w-5xl text-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isRegisterMode
                ? 'opacity-0 translate-x-12 pointer-events-none absolute top-1/2 left-0 right-0 -translate-y-1/2 w-full z-0'
                : 'opacity-100 translate-x-0 pointer-events-auto relative z-10'
            }`}
          >
            <div className="xttech-logo-enter inline-flex items-center justify-center gap-3 sm:gap-5 lg:gap-6">
              <Image
                src="/image-xttech/logo-xttech.svg"
                alt="XT TECH Logo"
                width={44}
                height={44}
                priority
                className="object-contain"
                style={{
                  width: 'clamp(24px, 3.4vw, 44px)',
                  height: 'clamp(24px, 3.4vw, 44px)',
                }}
              />
              <span
                className="font-sans font-semibold tracking-tight text-primary"
                style={{
                  fontSize: 'clamp(18px, 2.6vw, 34px)',
                  lineHeight: 1.1,
                }}
              >
                XT TECH
              </span>
            </div>

            <h1
              aria-label="KIẾN TẠO GIÁ TRỊ CHUYỂN HÓA TƯƠNG LAI"
              className="mt-4 sm:mt-6 font-sans font-semibold tracking-[-0.02em] uppercase"
              style={{
                fontSize: 'clamp(18px, 5.4vw, 68px)',
                lineHeight: 1.25,
              }}
            >
              {PRECOMPUTED_SLOGAN_LINES.map((line, lineIdx) => (
                <span
                  key={lineIdx}
                  aria-hidden="true"
                  className="flex flex-nowrap items-center justify-center gap-x-[0.2em] sm:gap-x-[0.26em] whitespace-nowrap"
                >
                  {line.words.map((word, wordIdx) => (
                    <span
                      key={`${lineIdx}-${wordIdx}`}
                      className="xttech-hero-word inline-flex whitespace-nowrap"
                      style={{ color: word.color }}
                    >
                      {word.chars.map((item, cIdx) => (
                        <span
                          key={`${lineIdx}-${wordIdx}-${cIdx}`}
                          aria-hidden="true"
                          className="xttech-hero-char"
                          style={{ '--d': item.delay } as React.CSSProperties}
                        >
                          {item.char}
                        </span>
                      ))}
                    </span>
                  ))}
                </span>
              ))}
            </h1>

            <div className="xttech-hero-reveal mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5">
              <button
                type="button"
                onClick={handleOpenRegister}
                className="group inline-flex w-full sm:w-auto max-w-xs sm:max-w-none cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary via-teal-600 to-emerald-500 px-5 py-3 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:brightness-105 hover:shadow-xl hover:shadow-primary/30"
              >
                <FileSpreadsheet className="h-4 w-4 shrink-0" />
                <span>Đăng ký sử dụng miễn phí</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <Link
                href="/pricing"
                className="inline-flex w-full sm:w-auto max-w-xs sm:max-w-none items-center justify-center rounded-xl border border-slate-300 bg-white/90 px-5 py-3 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs backdrop-blur-xs transition-colors hover:border-primary/50 hover:bg-slate-50 hover:text-primary"
              >
                Xem bảng giá dịch vụ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
