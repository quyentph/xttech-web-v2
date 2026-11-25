'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MotionConfig } from 'motion/react';
import { Modal, RegisterInlineForm } from '@/components';
import { IntroduceAudienceSection } from './introduce-audience-section';
import { IntroduceBenefitsSection } from './introduce-benefits-section';
import { IntroduceHeroSection } from './introduce-hero-section';
import { IntroduceMissionVisionSection } from './introduce-mission-vision-section';
import { IntroduceVideoSection } from './introduce-video-section';

const AUTO_REGISTER_MODAL_DELAY_MS = 8000;

function IntroduceContent() {
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsAutoModalOpen(true);
    }, AUTO_REGISTER_MODAL_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="overflow-x-clip bg-white text-slate-900">
      <IntroduceHeroSection />
      <IntroduceVideoSection />
      <IntroduceMissionVisionSection />
      <IntroduceBenefitsSection />
      <IntroduceAudienceSection />

      <Modal
        isOpen={isAutoModalOpen}
        onClose={() => setIsAutoModalOpen(false)}
        size="md"
        title="Đăng ký sử dụng XT Tech XMS Fab"
        className="max-w-lg border border-primary/20"
        bodyClassName="p-5 sm:p-6"
      >
        <RegisterInlineForm
          key={`intro-auto-${isAutoModalOpen}`}
          variant="modal"
          onBack={() => setIsAutoModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export function IntroducePageClient() {
  const pathname = usePathname();

  return (
    <MotionConfig reducedMotion="user">
      <IntroduceContent key={pathname} />
    </MotionConfig>
  );
}
