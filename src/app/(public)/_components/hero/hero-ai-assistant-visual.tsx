'use client';

import React from 'react';
import {
  Camera,
  Check,
  CheckCircle2,
  FileCheck2,
  Mic,
  Scan,
  Sparkles,
} from 'lucide-react';

export const HeroAiAssistantVisual = () => {
  return (
    <div className="relative mx-auto w-full max-w-5xl select-none pt-2 pb-2">
      {/* ================= BACKGROUND GLOWS ================= */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-80 w-80 sm:h-96 sm:w-96 rounded-full bg-teal-500/15 blur-3xl" />
      <div className="pointer-events-none absolute top-20 left-1/4 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-20 right-1/4 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />

      {/* ================= SÂN KHẤU CÔNG NGHỆ CHÍNH: ROBOT AI + 2 FLOATING WIDGETS ================= */}
      <div className="relative mx-auto flex flex-col items-center justify-center">
        {/* Lớp hiển thị 3 cột trên Desktop: Widget Trái - Robot Giữa - Widget Phải */}
        <div className="grid w-full grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-4">
          {/* ================= WIDGET TRÁI: GHI CHÚ GIỌNG NÓI HIỆN TRƯỜNG ================= */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="group relative w-full max-w-xs rounded-2xl border border-teal-200/90 bg-white/95 p-4 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-teal-400 hover:shadow-2xl animate-float-slow">
              {/* Badge góc trên */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-teal-600 to-teal-400 text-white shadow-xs">
                    <Mic className="h-4 w-4 animate-pulse" />
                  </span>
                  <span className="text-xs font-bold text-slate-900">Ghi chú giọng nói hiện trường</span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-200/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Đang ghi âm
                </span>
              </div>

              {/* Sóng âm thanh nhảy động (CSS Soundwave Animation) */}
              <div className="flex items-center justify-center gap-1.5 py-4">
                <span className="h-3 w-1 rounded-full bg-teal-400 animate-pulse" />
                <span className="h-6 w-1 rounded-full bg-teal-500 animate-pulse delay-75" />
                <span className="h-8 w-1 rounded-full bg-primary animate-pulse delay-150" />
                <span className="h-5 w-1 rounded-full bg-teal-400 animate-pulse delay-100" />
                <span className="h-9 w-1 rounded-full bg-primary animate-pulse delay-200" />
                <span className="h-4 w-1 rounded-full bg-teal-500 animate-pulse delay-75" />
                <span className="h-7 w-1 rounded-full bg-teal-400 animate-pulse delay-150" />
                <span className="h-3 w-1 rounded-full bg-teal-300 animate-pulse" />
              </div>

              {/* Nội dung giọng nói nhận diện thực tế của thợ hiện trường */}
              <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700 border border-slate-200/60">
                <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Nội dung ghi chú:</span>
                <p className="font-semibold text-slate-900 leading-snug">
                  &ldquo;Tầng 3 đã lắp xong 4 bộ cửa lùa Xingfa, đo chuẩn khớp ô chờ, mai cho thợ bắn keo hoàn thiện nhé.&rdquo;
                </p>
              </div>

              {/* Tag trạng thái thực tế */}
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-medium text-emerald-600 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Đã lưu vào Công trình Biệt thự Gamuda
                </span>
                <span className="text-[10px] font-medium text-slate-400">Vừa xong</span>
              </div>
            </div>
          </div>

          {/* ================= TRUNG TÂM: ROBOT KỸ SƯ CÔNG TRÌNH 3D FUTURISTIC AI ================= */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <div className="relative flex flex-col items-center">
              {/* Vòng hào quang công nghệ đa tầng xoay quanh robot */}
              <div className="pointer-events-none absolute -inset-6 rounded-full border border-teal-300/30 animate-spin-slow opacity-60" />
              <div className="pointer-events-none absolute -inset-10 rounded-full border border-dashed border-teal-400/25 opacity-40" />
              <div className="pointer-events-none absolute -inset-14 rounded-full border border-teal-500/15 opacity-30" />

              {/* KHUNG ROBOT KỸ SƯ CÔNG NGHỆ BẰNG SVG CHUẨN 3D CAO CẤP */}
              <div className="relative z-10 flex h-48 w-48 sm:h-56 sm:w-56 items-center justify-center animate-float-slow">
                <svg
                  viewBox="0 0 240 240"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-full w-full drop-shadow-[0_20px_35px_rgba(4,88,99,0.38)]"
                >
                  <defs>
                    {/* Filter hào quang neon phát sáng */}
                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    {/* Filter hào quang nhẹ */}
                    <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    {/* Mũ bảo hộ kỹ sư công trình: Deep Petrol Teal & Cyan-Emerald sang trọng theo nhận diện thương hiệu */}
                    <linearGradient id="helmShellGrad" x1="60" y1="20" x2="180" y2="80" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#0d9488" />
                      <stop offset="0.3" stopColor="#045863" />
                      <stop offset="0.75" stopColor="#02333a" />
                      <stop offset="1" stopColor="#021c20" />
                    </linearGradient>

                    {/* Vành mũ & dải kim loại kỹ thuật: Gradient Cyan sang Emerald */}
                    <linearGradient id="helmBrimGrad" x1="50" y1="65" x2="190" y2="78" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#2dd4bf" />
                      <stop offset="0.45" stopColor="#0d9488" />
                      <stop offset="1" stopColor="#045863" />
                    </linearGradient>

                    {/* Vỏ đầu Robot: Gốm sứ Titan trắng ngọc sang trọng */}
                    <linearGradient id="robotHeadGrad" x1="70" y1="50" x2="170" y2="135" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ffffff" />
                      <stop offset="0.55" stopColor="#f8fafc" />
                      <stop offset="0.85" stopColor="#e2e8f0" />
                      <stop offset="1" stopColor="#cbd5e1" />
                    </linearGradient>

                    {/* Viền kim loại bóng bẩy */}
                    <linearGradient id="chromeBevel" x1="70" y1="60" x2="170" y2="130" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#f1f5f9" />
                      <stop offset="0.5" stopColor="#94a3b8" />
                      <stop offset="1" stopColor="#475569" />
                    </linearGradient>

                    {/* Kính Visor đen bóng Obsidian với phản quang công nghệ */}
                    <linearGradient id="visorObsidian" x1="75" y1="70" x2="165" y2="120" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#0a1826" />
                      <stop offset="0.45" stopColor="#04202c" />
                      <stop offset="0.85" stopColor="#03151e" />
                      <stop offset="1" stopColor="#02080d" />
                    </linearGradient>

                    {/* Đèn mắt LED AI Neon Cyan-Emerald */}
                    <linearGradient id="aiEyeGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop stopColor="#67e8f9" />
                      <stop offset="0.4" stopColor="#22d3ee" />
                      <stop offset="0.8" stopColor="#2dd4bf" />
                      <stop offset="1" stopColor="#10b981" />
                    </linearGradient>

                    {/* Vỏ thân Robot: Segmented Armor Plate */}
                    <linearGradient id="robotBodyGrad" x1="75" y1="140" x2="165" y2="205" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ffffff" />
                      <stop offset="0.5" stopColor="#f1f5f9" />
                      <stop offset="0.85" stopColor="#e2e8f0" />
                      <stop offset="1" stopColor="#94a3b8" />
                    </linearGradient>

                    {/* Đĩa đệm phát sáng Hologram 3D dưới đáy */}
                    <radialGradient id="holoDiscGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.85" />
                      <stop offset="45%" stopColor="#0d9488" stopOpacity="0.5" />
                      <stop offset="75%" stopColor="#045863" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#045863" stopOpacity="0" />
                    </radialGradient>

                    {/* Lõi năng lượng AI Arc Reactor */}
                    <radialGradient id="arcReactorGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="30%" stopColor="#67e8f9" />
                      <stop offset="70%" stopColor="#0d9488" />
                      <stop offset="100%" stopColor="#045863" />
                    </radialGradient>
                  </defs>

                  {/* ================= BỆ ĐĨA HOLOGRAPHIC 3D & BÓNG ĐỔ ================= */}
                  {/* Bóng đổ đa tầng mềm mại */}
                  <ellipse cx="120" cy="226" rx="46" ry="8" fill="rgba(4, 88, 99, 0.28)" className="blur-xs" />
                  <ellipse cx="120" cy="224" rx="28" ry="4" fill="rgba(2, 38, 44, 0.45)" />

                  {/* Vành đĩa Hologram ngoài cùng (dạng dashed xoay) */}
                  <ellipse
                    cx="120"
                    cy="216"
                    rx="68"
                    ry="14"
                    stroke="#2dd4bf"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                    opacity="0.6"
                  />
                  {/* Đĩa phát sáng trung tâm */}
                  <ellipse cx="120" cy="216" rx="52" ry="10" fill="url(#holoDiscGrad)" />
                  <ellipse cx="120" cy="216" rx="34" ry="6" stroke="#5eead4" strokeWidth="1.5" opacity="0.85" />

                  {/* Tia quét Hologram dọc chiếu lên robot */}
                  <path d="M 85 214 L 102 188" stroke="#2dd4bf" strokeWidth="1" strokeDasharray="3 3" opacity="0.45" />
                  <path d="M 155 214 L 138 188" stroke="#2dd4bf" strokeWidth="1" strokeDasharray="3 3" opacity="0.45" />

                  {/* ================= TAY THÂN & VAI ROBOT BAY LƠ LỬNG ================= */}
                  {/* Cụm vai/tay trái bay từ trường */}
                  <g className="transition-transform duration-300">
                    <rect x="58" y="152" width="16" height="26" rx="8" fill="url(#robotBodyGrad)" stroke="#94a3b8" strokeWidth="1.5" />
                    <circle cx="66" cy="165" r="3.5" fill="#045863" stroke="#2dd4bf" strokeWidth="1" />
                    <circle cx="66" cy="165" r="1.5" fill="#2dd4bf" filter="url(#softGlow)" />
                  </g>

                  {/* Cụm vai/tay phải bay từ trường */}
                  <g className="transition-transform duration-300">
                    <rect x="166" y="152" width="16" height="26" rx="8" fill="url(#robotBodyGrad)" stroke="#94a3b8" strokeWidth="1.5" />
                    <circle cx="174" cy="165" r="3.5" fill="#045863" stroke="#2dd4bf" strokeWidth="1" />
                    <circle cx="174" cy="165" r="1.5" fill="#2dd4bf" filter="url(#softGlow)" />
                  </g>

                  {/* ================= THÂN ROBOT KHÍ ĐỘNG HỌC (TORSO) ================= */}
                  {/* Khung thân chính */}
                  <path
                    d="M 88 144 C 88 138, 152 138, 152 144 L 146 195 C 146 203, 94 203, 94 195 Z"
                    fill="url(#robotBodyGrad)"
                    stroke="url(#chromeBevel)"
                    strokeWidth="2"
                  />

                  {/* Tấm ốp bảo vệ carbon 2 bên sườn */}
                  <path d="M 90 156 L 98 156 L 100 188 L 95 188 Z" fill="#045863" opacity="0.6" />
                  <path d="M 150 156 L 142 156 L 140 188 L 145 188 Z" fill="#045863" opacity="0.6" />

                  {/* Lõi năng lượng AI Arc Reactor ở ngực */}
                  <g>
                    {/* Vòng bezel ngoài */}
                    <circle cx="120" cy="170" r="15" fill="#032b30" stroke="#0d9488" strokeWidth="2" />
                    {/* Vòng khía kỹ thuật */}
                    <circle
                      cx="120"
                      cy="170"
                      r="12"
                      fill="#021c20"
                      stroke="#2dd4bf"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                      opacity="0.8"
                    />
                    {/* Tinh thể plasma trung tâm */}
                    <circle cx="120" cy="170" r="8" fill="url(#arcReactorGrad)" filter="url(#neonGlow)" />
                    {/* Điểm sáng phản chiếu Specular */}
                    <circle cx="118" cy="168" r="2.5" fill="#ffffff" opacity="0.9" />
                  </g>

                  {/* Khớp nối từ trường cổ (Magnetic Neck Gap) */}
                  <ellipse cx="120" cy="138" rx="20" ry="4.5" fill="#045863" stroke="#2dd4bf" strokeWidth="1.5" />
                  <ellipse cx="120" cy="138" rx="12" ry="2.5" fill="#2dd4bf" filter="url(#softGlow)" opacity="0.8" />

                  {/* ================= TAI NGHE CẢM BIẾN ÂM THANH 2 BÊN (VOICE AI PODS) ================= */}
                  {/* Cảm biến tai trái */}
                  <g>
                    <rect x="52" y="78" width="12" height="30" rx="6" fill="#045863" stroke="#0d9488" strokeWidth="1.5" />
                    <circle cx="58" cy="93" r="4" fill="#02262c" stroke="#2dd4bf" strokeWidth="1" />
                    <circle cx="58" cy="93" r="2" fill="#2dd4bf" filter="url(#softGlow)" />
                    {/* Cột ăng-ten siêu nhỏ bắt tín hiệu công trường */}
                    <path d="M 58 78 L 52 64" stroke="#045863" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="52" cy="64" r="3" fill="#2dd4bf" filter="url(#neonGlow)" />
                  </g>

                  {/* Cảm biến tai phải */}
                  <g>
                    <rect x="176" y="78" width="12" height="30" rx="6" fill="#045863" stroke="#0d9488" strokeWidth="1.5" />
                    <circle cx="182" cy="93" r="4" fill="#02262c" stroke="#2dd4bf" strokeWidth="1" />
                    <circle cx="182" cy="93" r="2" fill="#2dd4bf" filter="url(#softGlow)" />
                    {/* Cột ăng-ten siêu nhỏ */}
                    <path d="M 182 78 L 188 64" stroke="#045863" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="188" cy="64" r="3" fill="#2dd4bf" filter="url(#neonGlow)" />
                  </g>

                  {/* ================= ĐẦU ROBOT: VỎ TITAN TRẮNG BO TRÒN TINH TẾ ================= */}
                  <rect
                    x="62"
                    y="54"
                    width="116"
                    height="84"
                    rx="42"
                    fill="url(#robotHeadGrad)"
                    stroke="url(#chromeBevel)"
                    strokeWidth="2.5"
                  />

                  {/* ================= KÍNH MẮT VISOR ĐEN BÓNG OBSIDIAN ================= */}
                  <rect
                    x="74"
                    y="72"
                    width="92"
                    height="48"
                    rx="24"
                    fill="url(#visorObsidian)"
                    stroke="#1e293b"
                    strokeWidth="2"
                  />

                  {/* Lớp phản chiếu ánh sáng trên mặt kính cong (Glass Specular Reflection) */}
                  <path
                    d="M 82 82 C 100 75, 140 75, 158 82 C 142 79, 98 79, 82 82 Z"
                    fill="#ffffff"
                    opacity="0.3"
                  />

                  {/* ================= ĐÔI MẮT LED AI CYBERNETIC BIỂU CẢM THÔNG MINH ================= */}
                  {/* Mắt trái: Viên nang LED rực rỡ với ánh sáng đồng tử */}
                  <g filter="url(#neonGlow)">
                    {/* Mắt LED bo góc mềm mại */}
                    <rect x="90" y="85" width="20" height="22" rx="10" fill="url(#aiEyeGrad)" />
                    {/* Ánh hào quang đồng tử */}
                    <ellipse cx="98" cy="93" rx="4.5" ry="5.5" fill="#ffffff" opacity="0.95" />
                    {/* Điểm phản xạ nhỏ dưới */}
                    <circle cx="102" cy="100" r="1.5" fill="#ffffff" opacity="0.8" />
                  </g>

                  {/* Mắt phải: Viên nang LED rực rỡ đối xứng */}
                  <g filter="url(#neonGlow)">
                    {/* Mắt LED bo góc mềm mại */}
                    <rect x="130" y="85" width="20" height="22" rx="10" fill="url(#aiEyeGrad)" />
                    {/* Ánh hào quang đồng tử */}
                    <ellipse cx="138" cy="93" rx="4.5" ry="5.5" fill="#ffffff" opacity="0.95" />
                    {/* Điểm phản xạ nhỏ dưới */}
                    <circle cx="142" cy="100" r="1.5" fill="#ffffff" opacity="0.8" />
                  </g>

                  {/* Chỉ số quét dữ liệu vi mô (Micro Telemetry Dots) */}
                  <circle cx="83" cy="96" r="1.2" fill="#2dd4bf" opacity="0.75" />
                  <circle cx="83" cy="100" r="1.2" fill="#2dd4bf" opacity="0.45" />
                  <circle cx="157" cy="96" r="1.2" fill="#2dd4bf" opacity="0.75" />
                  <circle cx="157" cy="100" r="1.2" fill="#2dd4bf" opacity="0.45" />

                  {/* ================= MŨ BẢO HỘ KỸ SƯ CÔNG TRÌNH VÀNG CAO CẤP ================= */}
                  {/* Vỏ chóp mũ bo mượt theo cấu trúc đầu */}
                  <path
                    d="M 68 58 C 68 25, 172 25, 172 58 C 172 61, 155 64, 120 64 C 85 64, 68 61, 68 58 Z"
                    fill="url(#helmShellGrad)"
                    stroke="#b45309"
                    strokeWidth="2"
                  />

                  {/* Gờ sống mũ kỹ sư chịu lực ở giữa */}
                  <path
                    d="M 120 25 L 120 58"
                    stroke="#fef08a"
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                  <path
                    d="M 120 27 L 120 56"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.8"
                  />

                  {/* Dải vành mũ khí động học nhô phía trước */}
                  <path
                    d="M 60 58 C 60 53, 180 53, 180 58 C 180 65, 155 69, 120 69 C 85 69, 60 65, 60 58 Z"
                    fill="url(#helmBrimGrad)"
                    stroke="#92400e"
                    strokeWidth="1.8"
                  />

                  {/* Dải LED phát sáng an toàn công trường trên vành mũ */}
                  <path
                    d="M 88 61 Q 120 64 152 61"
                    stroke="#2dd4bf"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    filter="url(#neonGlow)"
                  />

                  {/* Huy hiệu công nghệ XT TECH trên trán mũ */}
                  <g>
                    <polygon
                      points="120,38 127,42 127,51 120,55 113,51 113,42"
                      fill="#045863"
                      stroke="#fef08a"
                      strokeWidth="1.5"
                    />
                    <circle cx="120" cy="46.5" r="2.5" fill="#2dd4bf" filter="url(#softGlow)" />
                  </g>
                </svg>
              </div>

              {/* ================= BỆ ĐĨA BADGE: TÍCH HỢP CÔNG NGHỆ XTTECH AI ================= */}
              <div className="relative -mt-4 z-20 flex flex-col items-center">
                {/* Đĩa đệm phát quang */}
                <div className="h-5 w-48 sm:w-60 rounded-full bg-linear-to-r from-teal-500/10 via-teal-400/40 to-teal-500/10 blur-xs" />
                <div className="relative -mt-3.5 flex items-center gap-2 rounded-full border border-teal-300/80 bg-gradient-to-r from-primary via-[#0d9488] to-primary px-4 sm:px-5 py-1.5 shadow-xl shadow-teal-950/20 backdrop-blur-md transition-transform duration-300 hover:scale-105">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-xs font-black tracking-wide text-white flex items-center gap-1.5">
                    <span>Tích hợp công nghệ XTTech AI</span>
                    <Sparkles className="h-3 w-3 text-emerald-300" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= WIDGET PHẢI: AI VISION NHẬN DIỆN BẢN VẼ & TEM MÁC ================= */}
          <div className="lg:col-span-4 flex justify-center lg:justify-start">
            <div className="group relative w-full max-w-xs rounded-2xl border border-teal-200/90 bg-white/95 p-4 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-teal-400 hover:shadow-2xl animate-float-delayed">
              {/* Badge góc trên */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-teal-600 to-teal-400 text-white shadow-xs">
                    <Camera className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold text-slate-900">AI Vision quét bản vẽ</span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-200/60">
                  <Scan className="h-3 w-3" />
                  Auto Scan
                </span>
              </div>

              {/* Khung quét mô phỏng Viewfinder AI chuẩn HUD */}
              <div className="relative my-3 overflow-hidden rounded-xl bg-slate-950 p-3 text-white border border-slate-800 shadow-inner">
                {/* Tia laser quét ngang chuyển động mượt mà */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_12px_#2dd4bf] animate-scan-laser" />

                {/* Góc ngắm HUD công nghệ */}
                <div className="absolute top-1.5 left-1.5 h-2 w-2 border-t-2 border-l-2 border-teal-400" />
                <div className="absolute top-1.5 right-1.5 h-2 w-2 border-t-2 border-r-2 border-teal-400" />
                <div className="absolute bottom-1.5 left-1.5 h-2 w-2 border-b-2 border-l-2 border-teal-400" />
                <div className="absolute bottom-1.5 right-1.5 h-2 w-2 border-b-2 border-r-2 border-teal-400" />

                <div className="flex items-center justify-between text-[11px] font-mono text-teal-300">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                    BẢN VẼ CỬA TẦNG 1
                  </span>
                  <span className="rounded bg-teal-950/80 px-1.5 py-0.2 text-[10px] font-semibold text-teal-300 border border-teal-700/50">
                    KHỚP MẪU 99%
                  </span>
                </div>

                <div className="mt-2 space-y-1 text-xs">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>Hệ nhôm Xingfa 55</span>
                    <span className="text-emerald-400 text-[10px] font-semibold tracking-wide bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      ĐÃ NHẬN DIỆN
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">Cửa đi 4 cánh mở quay • 2400 × 2800 mm</div>
                </div>
              </div>

              {/* Tag trạng thái */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Bóc tách kích thước tự động
                </span>
                <span className="text-[10px] font-semibold text-slate-400">100% khớp</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CÁC ĐƯỜNG DÂY DẪN CÔNG NGHỆ NỐI TỪ ĐĨA XUỐNG 3 THẺ ================= */}
        <div className="hidden lg:flex w-full max-w-3xl items-center justify-between h-8 -mt-1 px-16 pointer-events-none opacity-70">
          <svg className="w-full h-full" viewBox="0 0 600 32" fill="none">
            <path d="M 300 0 L 300 16 L 100 16 L 100 32" stroke="#0d9488" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M 300 0 L 300 32" stroke="#0d9488" strokeWidth="2" />
            <path d="M 300 0 L 300 16 L 500 16 L 500 32" stroke="#0d9488" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Hạt photon năng lượng di chuyển */}
            <circle cx="100" cy="24" r="2.5" fill="#2dd4bf" className="animate-ping" />
            <circle cx="300" cy="20" r="2.5" fill="#2dd4bf" className="animate-ping" />
            <circle cx="500" cy="24" r="2.5" fill="#2dd4bf" className="animate-ping" />
          </svg>
        </div>

        {/* ================= 3 THẺ CARD TÍNH NĂNG CÔNG NGHỆ (ICON NỔI 3D CHUẨN ĐỒ HỌA GỐC) ================= */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-4xl w-full">
          {/* Card 1: Voice AI */}
          <div className="group relative rounded-2xl bg-gradient-to-b from-primary via-[#05434b] to-hero-bg-to p-6 pt-9 text-center text-white shadow-xl shadow-primary/25 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-teal-400 border border-teal-500/30">
            {/* Icon tròn nổi đè lên mép trên */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-teal-500 via-teal-400 to-emerald-400 text-white shadow-lg shadow-teal-500/40 border-2 border-white transition-transform group-hover:scale-110">
              <Mic className="h-6 w-6 text-white" />
            </div>

            <h4 className="text-sm sm:text-base font-bold text-white">
              Voice AI, tạo ghi chú hiện trường bằng giọng nói
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-teal-100/80">
              Nói kích thước ô chờ, lỗi kính; AI tự nhận diện và lập tức gán vào hồ sơ dự án.
            </p>
          </div>

          {/* Card 2: AI Vision */}
          <div className="group relative rounded-2xl bg-gradient-to-b from-primary via-[#05434b] to-hero-bg-to p-6 pt-9 text-center text-white shadow-xl shadow-primary/25 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-teal-400 border border-teal-500/30">
            {/* Icon tròn nổi đè lên mép trên */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-teal-500 via-teal-400 to-emerald-400 text-white shadow-lg shadow-teal-500/40 border-2 border-white transition-transform group-hover:scale-110">
              <Camera className="h-6 w-6 text-white" />
            </div>

            <h4 className="text-sm sm:text-base font-bold text-white">
              AI nhận diện dữ liệu ảnh & tem mác
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-teal-100/80">
              Chụp ảnh bản vẽ tay hoặc tem nhôm, phụ kiện; AI tự động trích xuất thông số kỹ thuật.
            </p>
          </div>

          {/* Card 3: AI Auto Ticket */}
          <div className="group relative rounded-2xl bg-gradient-to-b from-primary via-[#05434b] to-hero-bg-to p-6 pt-9 text-center text-white shadow-xl shadow-primary/25 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-teal-400 border border-teal-500/30">
            {/* Icon tròn nổi đè lên mép trên */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-teal-500 via-teal-400 to-emerald-400 text-white shadow-lg shadow-teal-500/40 border-2 border-white transition-transform group-hover:scale-110">
              <FileCheck2 className="h-6 w-6 text-white" />
            </div>

            <h4 className="text-sm sm:text-base font-bold text-white">
              AI tạo phiếu thu/chi, phiếu xuất/nhập vật tư
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-teal-100/80">
              Tự động tạo phiếu xuất kho thanh nhôm, kính và phụ kiện theo lệnh sản xuất.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroAiAssistantVisual;
