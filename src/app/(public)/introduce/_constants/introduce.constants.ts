import { Building2, Compass, Eye, HardHat, Users, Wrench, type LucideIcon } from 'lucide-react';

export const INTRODUCE_EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface SloganWord {
  text: string;
  accent?: boolean;
}

export const SLOGAN_LINES: SloganWord[][] = [
  [{ text: 'KIẾN' }, { text: 'TẠO' }, { text: 'GIÁ', accent: true }, { text: 'TRỊ', accent: true }],
  [{ text: 'CHUYỂN' }, { text: 'HÓA' }, { text: 'TƯƠNG', accent: true }, { text: 'LAI', accent: true }],
];

export interface SloganCharToken {
  char: string;
  delay: string;
}

export interface SloganWordToken {
  color: string;
  chars: SloganCharToken[];
}

export interface SloganLineToken {
  words: SloganWordToken[];
}

function buildPrecomputedSloganTokens(): SloganLineToken[] {
  let charGlobalIdx = 0;
  return SLOGAN_LINES.map((line) => ({
    words: line.map((word) => ({
      color: word.accent ? '#0b6b63' : '#0f1b2d',
      chars: Array.from(word.text).map((char) => {
        const idx = charGlobalIdx++;
        return {
          char,
          delay: `${(0.28 + idx * 0.055).toFixed(3)}s`,
        };
      }),
    })),
  }));
}

export const PRECOMPUTED_SLOGAN_LINES: readonly SloganLineToken[] = buildPrecomputedSloganTokens();

export interface EcosystemModule {
  code: string;
  name: string;
  desc: string;
}

export const ECOSYSTEM_MODULES: EcosystemModule[] = [
  {
    code: 'XMS Fab',
    name: 'Xưởng Nhôm Kính & Nội Thất',
    desc: 'Thiết kế CAD 2D/3D, bóc tách BOM tự động, xuất thẻ cắt A4 và quản lý tiến độ sản xuất tại xưởng.',
  },
  {
    code: 'XMS Build',
    name: 'Xây Dựng & Đội Thợ Thực Địa',
    desc: 'Quản lý công trình, kho vật tư xuất nhập, chấm công tại công trình và nghiệm thu bảo hành QR.',
  },
  {
    code: 'XMS Biz',
    name: 'HCNS, Kế Toán & Kinh Doanh',
    desc: 'Quản lý hợp đồng, báo giá, thu chi, nhân sự và báo cáo lãi/lỗ chi tiết theo từng đơn hàng.',
  },
];

export interface BenefitItem {
  letter?: string;
  title: string;
  desc: string;
}

export const SOFTWARE_BENEFITS: BenefitItem[] = [
  {
    letter: 'X',
    title: 'X – Xuyên suốt & Thực chiến (Execution)',
    desc: 'Biến mọi quy trình phức tạp từ bản vẽ đến công trường thành thao tác đơn giản, hiệu quả thực tế.',
  },
  {
    letter: 'T',
    title: 'T – Tận gốc (Transparency & Root-cause)',
    desc: 'Giải quyết triệt để nỗi đau của xưởng và công trình bằng dữ liệu minh bạch, không làm ăn "áng chừng".',
  },
  {
    letter: 'T',
    title: 'T – Tin cậy & Bảo mật (Trust)',
    desc: 'Coi dữ liệu và biên lợi nhuận của khách hàng là danh dự bất khả xâm phạm (kiến trúc Zero-Trust).',
  },
  {
    letter: 'E',
    title: 'E – Hiệu quả tinh gọn (Efficiency)',
    desc: 'Tối ưu từng đồng vốn, từng milimet vật tư và từng giờ công thợ.',
  },
  {
    letter: 'C',
    title: 'C – Chung thuyền (Co-ownership)',
    desc: 'Đội ngũ đồng lòng làm chủ, cùng kiến tạo, cùng hưởng thành quả và chịu trách nhiệm đến cùng.',
  },
  {
    letter: 'H',
    title: 'H – Hệ thống hóa (Habit & System)',
    desc: 'Mọi hoạt động đều vận hành bằng quy trình chuẩn (SOP) và số liệu đo lường rõ ràng.',
  },
];

export interface AudienceItem {
  title: string;
  subtitle: string;
  points: string[];
  icon: LucideIcon;
}

export const TARGET_AUDIENCES: AudienceItem[] = [
  {
    title: 'Chủ xưởng sản xuất',
    subtitle: 'Gia công nhôm kính, cơ khí & nội thất',
    icon: Building2,
    points: [
      'Thiết kế CAD 2D/3D & Thư viện hệ nhôm chuẩn',
      'Bóc tách BOM & Xuất thẻ cắt A4 tự động',
      'Giám sát tiến độ gia công tại xưởng',
      'Tính giá vốn & Định mức vật tư tức thì',
    ],
  },
  {
    title: 'Nhà thầu thi công',
    subtitle: 'Mặt dựng, công trình dân dụng & dự án',
    icon: HardHat,
    points: [
      'Quản lý đa dự án & Phân kỳ hạng mục',
      'Kiểm soát kho vật tư & Cấp phát phụ kiện',
      'Nghiệm thu điện tử & Bảo hành quét mã QR',
      'Kiểm soát dòng tiền & Hồ sơ thanh quyết toán',
    ],
  },
  {
    title: 'Thợ lắp & Kỹ thuật',
    subtitle: 'Đội thợ công trình & kỹ thuật đo đạc',
    icon: Wrench,
    points: [
      'Xem bản vẽ 2D/3D & Kích thước ô chờ thực tế',
      'Danh mục vật tư cần mang đi lắp đặt',
      'Chấm công GPS / Khuôn mặt tại công trình',
      'Chụp ảnh nghiệm thu & Báo sự cố ngay lập tức',
    ],
  },
  {
    title: 'Kế toán & Kinh doanh',
    subtitle: 'Báo giá, dòng tiền, công nợ & quản trị',
    icon: Users,
    points: [
      'Báo giá nhanh chuẩn xác theo hệ nhôm',
      'Quản lý hợp đồng & Nhắc hạn công nợ',
      'Quản lý thu chi & Chi phí nhân công',
      'Báo cáo lãi/lỗ & Phê duyệt trực tuyến',
    ],
  },
];

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
    badge: 'Sứ mệnh XT Tech',
    title: 'Sứ mệnh',
    icon: Compass,
    summaryLead: 'XT Tech đưa công nghệ trở thành công cụ vận hành',
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
    imageAlt: 'Sứ mệnh XT Tech',
    imageAnimationClass: 'animate-compass-mission',
    glowClass: 'bg-linear-to-tr from-primary/20 via-emerald-400/15 to-transparent',
    imageFirst: false,
  },
  {
    id: 'vision',
    badge: 'Tầm nhìn XT Tech',
    title: 'Tầm nhìn',
    icon: Eye,
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
    imageAlt: 'Tầm nhìn XT Tech',
    imageAnimationClass: 'animate-compass-vision',
    glowClass: 'bg-linear-to-bl from-teal-400/20 via-primary/15 to-transparent',
    imageFirst: true,
  },
];
