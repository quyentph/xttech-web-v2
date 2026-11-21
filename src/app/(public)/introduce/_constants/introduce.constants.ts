import {
  Briefcase,
  Building2,
  Clock,
  Compass,
  HardHat,
  Layers,
  ShieldCheck,
  Smartphone,
  Target,
  TrendingUp,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export const INTRODUCE_EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface SloganWord {
  text: string;
  accent?: boolean;
}

export const SLOGAN_LINES: SloganWord[][] = [
  [{ text: 'KIẾN' }, { text: 'TẠO' }, { text: 'GIÁ', accent: true }, { text: 'TRỊ', accent: true }],
  [{ text: 'CHUYỂN' }, { text: 'HÓA' }, { text: 'TƯƠNG', accent: true }, { text: 'LAI', accent: true }],
];

export interface EcosystemModule {
  code: string;
  name: string;
  desc: string;
  icon: LucideIcon;
}

export const ECOSYSTEM_MODULES: EcosystemModule[] = [
  {
    code: 'XMS Fab',
    name: 'Xưởng Nhôm Kính & Nội Thất',
    desc: 'Thiết kế CAD 2D/3D, bóc tách BOM tự động, xuất thẻ cắt A4 và quản lý tiến độ sản xuất tại xưởng.',
    icon: Layers,
  },
  {
    code: 'XMS Build',
    name: 'Xây Dựng & Đội Thợ Thực Địa',
    desc: 'Quản lý công trình, kho vật tư xuất nhập, chấm công tại công trình và nghiệm thu bảo hành QR.',
    icon: HardHat,
  },
  {
    code: 'XMS Biz',
    name: 'HCNS, Kế Toán & Kinh Doanh',
    desc: 'Quản lý hợp đồng, báo giá, thu chi, nhân sự và báo cáo lãi/lỗ chi tiết theo từng đơn hàng.',
    icon: Briefcase,
  },
];

export interface BenefitStepStyle {
  card: string;
  circle: string;
  title: string;
  desc: string;
  icon: string;
  offsetClass: string;
}

export const BENEFIT_STEP_STYLES: BenefitStepStyle[] = [
  {
    card: 'bg-white text-slate-900 border-slate-200/80 shadow-md shadow-slate-200/40 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10',
    circle: 'bg-slate-50 border border-slate-200/90 text-primary shadow-xs',
    title: 'text-slate-900 group-hover:text-primary',
    desc: 'text-slate-600',
    icon: 'text-slate-400 group-hover:text-primary',
    offsetClass: 'ml-0',
  },
  {
    card: 'bg-[#eef8f5] text-slate-900 border-[#d2eee5] shadow-xs hover:border-primary/50 hover:shadow-md hover:shadow-primary/10',
    circle: 'bg-white border border-[#bce2d7] text-primary shadow-2xs',
    title: 'text-slate-900 group-hover:text-primary',
    desc: 'text-slate-600',
    icon: 'text-[#007a6e] group-hover:scale-110',
    offsetClass: 'sm:ml-6 lg:ml-8 xl:ml-10',
  },
  {
    card: 'bg-[#d6f0e7] text-slate-900 border-[#b9e5d8] shadow-xs hover:border-primary/60 hover:shadow-md hover:shadow-primary/15',
    circle: 'bg-white border border-[#a2d8c9] text-primary shadow-2xs',
    title: 'text-slate-900 group-hover:text-primary',
    desc: 'text-slate-700',
    icon: 'text-[#005b52] group-hover:scale-110',
    offsetClass: 'sm:ml-12 lg:ml-16 xl:ml-20',
  },
  {
    card: 'bg-[#044e54] text-white border-[#033c41] shadow-xl shadow-[#044e54]/25 hover:shadow-2xl hover:shadow-[#044e54]/40 hover:border-teal-400/50',
    circle: 'bg-white/20 border border-white/30 text-white backdrop-blur-xs shadow-xs',
    title: 'text-white',
    desc: 'text-teal-50/90',
    icon: 'text-teal-200 group-hover:text-white group-hover:scale-110',
    offsetClass: 'sm:ml-18 lg:ml-24 xl:ml-30',
  },
];

export interface BenefitItem {
  title: string;
  desc: string;
}

export const SOFTWARE_BENEFITS: BenefitItem[] = [
  {
    title: 'Báo giá nhanh tại công trình',
    desc: 'Lên phương án thiết kế và dự toán vật tư tức thì ngay trên điện thoại hoặc máy tính bảng, loại bỏ hoàn toàn việc tính tay Excel và rút ngắn thời gian chốt hợp đồng.',
  },
  {
    title: 'Giảm hao hụt phôi & kho',
    desc: 'Chuẩn hóa quy trình bóc tách BOM và xuất thẻ cắt A4 tối ưu thanh nhôm, giúp kiểm soát chặt chẽ định mức vật tư và tiết kiệm phôi tồn kho đáng kể.',
  },
  {
    title: 'Đồng bộ xưởng & đội thợ',
    desc: 'Giao việc trực quan theo bản vẽ kỹ thuật chi tiết, kiểm tra phụ kiện cần mang và theo dõi tiến độ thi công xuyên suốt từ gia công tại xưởng đến hiện trường lắp dựng.',
  },
  {
    title: 'Minh bạch dữ liệu & dòng tiền',
    desc: 'Nắm bắt tức thời chi phí vật tư, công thợ và biên lợi nhuận lãi/lỗ của từng dự án trên một màn hình tập trung, giúp chủ doanh nghiệp dễ dàng kiểm soát dòng tiền.',
  },
];

export interface RoleBenefitDetail {
  title: string;
  desc: string;
}

export interface RoleAudienceItem {
  id: string;
  rolePrefix: string;
  shortRole: string;
  roleName: string;
  subtitle: string;
  icon: LucideIcon;
  systemModule: string;
  badgeText: string;
  headline: string;
  painPointQuote: string;
  stats: {
    value: string;
    label: string;
  }[];
  benefits: RoleBenefitDetail[];
  ctaText: string;
}

export const ROLE_AUDIENCES: RoleAudienceItem[] = [
  {
    id: 'chu-xuong',
    rolePrefix: 'Tôi là',
    shortRole: 'Chủ xưởng',
    roleName: 'Chủ xưởng sản xuất',
    subtitle: 'Gia công nhôm kính, cơ khí & nội thất',
    icon: Building2,
    systemModule: 'Phân hệ XTTECH XMS Fab',
    badgeText: 'Dành cho Chủ xưởng',
    headline: 'Bóc tách BOM tự động, giảm hao hụt phôi & giải phóng thời gian quản lý',
    painPointQuote:
      'Không còn cảnh cộng trừ nhẩm phôi hay tính tay Excel dễ nhầm lẫn. Mọi quy trình từ thiết kế CAD, ra thẻ cắt A4 đến quản lý kho đều chạy tự động.',
    stats: [
      { value: '-90%', label: 'Thời gian ra thẻ cắt A4 & bóc tách' },
      { value: '-15%', label: 'Tỷ lệ hao hụt phôi nhôm xưởng' },
    ],
    benefits: [
      {
        title: 'Thiết kế CAD 2D/3D & Thư viện hệ nhôm chuẩn',
        desc: 'Lên phương án cửa đi, cửa sổ, vách kính kèm công thức trừ độ hở và phụ kiện chính xác theo từng hãng nhôm.',
      },
      {
        title: 'Bóc tách BOM & Xuất thẻ cắt A4 tự động',
        desc: 'Tự động tính toán phương án cắt phôi tối ưu chiều dài thanh, hạn chế tối đa đầu mẩu và phế liệu dư thừa.',
      },
      {
        title: 'Giám sát tiến độ gia công tại xưởng',
        desc: 'Theo dõi trực quan đơn hàng đang ở khâu nào: cắt phôi, ghép góc, vào kính hay đã sẵn sàng xuất xưởng.',
      },
      {
        title: 'Tính giá vốn & Định mức vật tư tức thì',
        desc: 'Nắm chắc giá thành sản xuất, chi phí nhân công và biên lợi nhuận thực tế trên từng bộ cửa xuất xưởng.',
      },
    ],
    ctaText: 'Khám phá giải pháp may đo cho Xưởng nhôm kính',
  },
  {
    id: 'nha-thau',
    rolePrefix: 'Tôi là',
    shortRole: 'Nhà thầu',
    roleName: 'Nhà thầu thi công',
    subtitle: 'Mặt dựng, công trình dân dụng & dự án',
    icon: HardHat,
    systemModule: 'Phân hệ XTTECH XMS Build',
    badgeText: 'Dành cho Nhà thầu',
    headline: 'Minh bạch vật tư kho công trường, bám sát tiến độ & nghiệm thu số QR',
    painPointQuote:
      'Đồng bộ dữ liệu tức thời giữa văn phòng điều hành và công trình, kiểm soát chặt chẽ cấp phát vật tư, bàn giao đúng tiến độ cam kết.',
    stats: [
      { value: '100%', label: 'Minh bạch xuất/nhập kho công trình' },
      { value: '0', label: 'Rủi ro trễ hẹn bàn giao dự án' },
    ],
    benefits: [
      {
        title: 'Quản lý đa dự án & Phân kỳ hạng mục',
        desc: 'Theo dõi tiến độ theo từng tầng, trục, căn hộ; phân bổ nhân sự và nhà thầu phụ rõ ràng, minh bạch.',
      },
      {
        title: 'Kiểm soát kho vật tư & Cấp phát phụ kiện',
        desc: 'Xuất kho theo đúng định mức bóc tách, đối soát tức thời vật tư tồn bãi để ngăn ngừa thất thoát phôi.',
      },
      {
        title: 'Nghiệm thu điện tử & Bảo hành quét mã QR',
        desc: 'Lập biên bản nghiệm thu có ảnh hiện trường, kích hoạt tem bảo hành QR tra cứu nguồn gốc cho chủ đầu tư.',
      },
      {
        title: 'Kiểm soát dòng tiền & Hồ sơ thanh quyết toán',
        desc: 'Quản lý tạm ứng, phụ lục phát sinh công trình và công nợ thầu phụ trên một màn hình tập trung.',
      },
    ],
    ctaText: 'Khám phá giải pháp quản lý cho Nhà thầu xây lắp',
  },
  {
    id: 'tho-lap',
    rolePrefix: 'Tôi là',
    shortRole: 'Thợ lắp',
    roleName: 'Thợ lắp & Kỹ thuật',
    subtitle: 'Đội thợ công trình & kỹ thuật đo đạc',
    icon: Wrench,
    systemModule: 'App Mobile Thực Địa',
    badgeText: 'Dành cho Thợ lắp & Kỹ thuật',
    headline: 'Xem bản vẽ ô chờ trên điện thoại, chấm công GPS & báo cáo hiện trường 1 chạm',
    painPointQuote:
      'Chỉ cần mở điện thoại là xem rõ ô chờ nào lắp kính gì, cần ốc vít phụ kiện nào, không sợ nhầm lẫn hay phải gọi điện hỏi lại xưởng.',
    stats: [
      { value: '30s', label: 'Tra cứu bản vẽ & kích thước ô chờ' },
      { value: '1 chạm', label: 'Chấm công GPS & gửi ảnh nghiệm thu' },
    ],
    benefits: [
      {
        title: 'Xem bản vẽ 2D/3D & Kích thước ô chờ thực tế',
        desc: 'Không cần mang bản vẽ giấy cồng kềnh, xem rõ chi tiết khe hở, phụ kiện đi kèm trực tiếp trên điện thoại.',
      },
      {
        title: 'Danh mục vật tư cần mang đi lắp đặt',
        desc: 'Kiểm tra đầy đủ số lượng kính, bản lề, khóa, keo silicon trước khi xe chở hàng xuất xưởng ra công trình.',
      },
      {
        title: 'Chấm công GPS / Khuôn mặt tại công trình',
        desc: 'Điểm danh minh bạch theo tọa độ dự án, ghi nhận ngày công tự động và chính xác từng ca làm việc.',
      },
      {
        title: 'Chụp ảnh nghiệm thu & Báo sự cố ngay lập tức',
        desc: 'Gửi ảnh hoàn thành trực tiếp về xưởng, ghi nhận sai lệch ô chờ để kỹ thuật xử lý kịp thời.',
      },
    ],
    ctaText: 'Trải nghiệm App Mobile cho Đội thợ thực địa',
  },
  {
    id: 'ke-toan',
    rolePrefix: 'Tôi là',
    shortRole: 'Kế toán',
    roleName: 'Kế toán & Kinh doanh',
    subtitle: 'Báo giá, dòng tiền, công nợ & quản trị',
    icon: Users,
    systemModule: 'Phân hệ XTTECH XMS Biz',
    badgeText: 'Dành cho Kế toán & Kinh doanh',
    headline: 'Lên báo giá trong 5 phút, kiểm soát chặt công nợ & nắm chắc lãi/lỗ từng dự án',
    painPointQuote:
      'Kinh doanh chốt đơn nhanh theo giá nhập mới nhất. Kế toán nắm chắc thu chi và công nợ mà không phải dò tìm qua hàng chục bảng tính rời rạc.',
    stats: [
      { value: '5 phút', label: 'Hoàn thiện báo giá hệ nhôm chuẩn xác' },
      { value: '100%', label: 'Kiểm soát công nợ & dòng tiền thu chi' },
    ],
    benefits: [
      {
        title: 'Báo giá nhanh chuẩn xác theo hệ nhôm',
        desc: 'Tự động tính theo bảng giá nhập nhôm, kính, phụ kiện kèm tỷ lệ lợi nhuận mong muốn của xưởng.',
      },
      {
        title: 'Quản lý hợp đồng & Nhắc hạn công nợ',
        desc: 'Theo dõi tiến độ thanh toán từng đợt của chủ nhà, tự động cảnh báo công nợ quá hạn để thu hồi vốn.',
      },
      {
        title: 'Quản lý thu chi & Chi phí nhân công',
        desc: 'Hạch toán chi phí vật tư, lương thợ xưởng, thợ lắp và chi phí vận chuyển theo từng đơn hàng chi tiết.',
      },
      {
        title: 'Báo cáo lãi/lỗ & Phê duyệt trực tuyến',
        desc: 'Chủ doanh nghiệp xem báo cáo tài chính tức thời trên điện thoại, phê duyệt đề xuất từ xa linh hoạt.',
      },
    ],
    ctaText: 'Khám phá giải pháp Báo giá & Kế toán XMS Biz',
  },
];

export interface AudienceItem {
  title: string;
  subtitle: string;
  points: string[];
  icon: LucideIcon;
}

export const TARGET_AUDIENCES: AudienceItem[] = ROLE_AUDIENCES.map((r) => ({
  title: r.roleName,
  subtitle: r.subtitle,
  points: r.benefits.map((b) => b.title),
  icon: r.icon,
}));

export interface MissionVisionHighlight {
  lead: string;
  text: string;
}

export interface MissionVisionBlock {
  id: 'mission' | 'vision';
  badge: string;
  title: string;
  icon: LucideIcon;
  summaryLead: string;
  summaryHighlight: string;
  summaryTail: string;
  listTitle: string;
  items: MissionVisionHighlight[];
  imageSrc: string;
  imageAlt: string;
  imageAnimationClass: string;
  glowClass: string;
  imageFirst: boolean;
}

export const MISSION_VISION_BLOCKS: MissionVisionBlock[] = [
  {
    id: 'mission',
    badge: 'Sứ mệnh XTTECH',
    title: 'Sứ mệnh',
    icon: Compass,
    summaryLead: 'XTTECH đưa công nghệ trở thành công cụ vận hành',
    summaryHighlight: 'dễ tiếp cận, hiệu quả và bền vững',
    summaryTail: 'cho mọi doanh nghiệp vừa và nhỏ tại Việt Nam.',
    listTitle: 'Chúng tôi giúp doanh nghiệp:',
    items: [
      {
        lead: 'Quản trị nội bộ thông minh:',
        text: 'Tiết kiệm thời gian và chi phí vận hành.',
      },
      {
        lead: 'Áp dụng AI xây dựng thương hiệu số:',
        text: 'Thông qua hệ thống app/web mang dấu ấn riêng.',
      },
      {
        lead: 'Kết nối cộng đồng doanh nghiệp cùng ngành:',
        text: 'Chia sẻ nguồn lực và cơ hội phát triển.',
      },
    ],
    imageSrc: '/assets/introduce/our-mission.png',
    imageAlt: 'Sứ mệnh XTTECH',
    imageAnimationClass: 'animate-compass-mission',
    glowClass: 'bg-linear-to-tr from-primary/20 via-emerald-400/15 to-transparent',
    imageFirst: false,
  },
  {
    id: 'vision',
    badge: 'Tầm nhìn XTTECH',
    title: 'Tầm nhìn',
    icon: Target,
    summaryLead: 'Trở thành',
    summaryHighlight: 'đơn vị dẫn đầu',
    summaryTail: 'trong lĩnh vực chuyển đổi số cho ngành nhôm cao cấp và xây dựng tại Việt Nam.',
    listTitle: 'Định hướng phát triển trọng tâm:',
    items: [
      {
        lead: 'Đối tác công nghệ tin cậy:',
        text: 'Đồng hành cùng các doanh nghiệp SME đang trên hành trình hiện đại hóa mô hình vận hành.',
      },
      {
        lead: 'Tiên phong chuẩn hóa ngành:',
        text: 'Tích hợp toàn diện thiết kế CAD 2D/3D, bóc tách vật tư và quản lý thi công trên một nền tảng.',
      },
      {
        lead: 'Kiến tạo giá trị dài hạn:',
        text: 'Giúp xưởng và nhà thầu nâng cao năng lực cạnh tranh và tối ưu hóa lợi nhuận.',
      },
    ],
    imageSrc: '/assets/introduce/vision.jpg',
    imageAlt: 'Tầm nhìn XTTECH',
    imageAnimationClass: 'animate-compass-vision',
    glowClass: 'bg-linear-to-bl from-teal-400/20 via-primary/15 to-transparent',
    imageFirst: true,
  },
];
