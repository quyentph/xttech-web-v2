'use client';

import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '@/utils/query';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Giữ nguyên instance queryClient đã được cấu hình chuẩn của dự án trong '@/utils/query'
  const [client] = useState(() => queryClient);

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}

export default QueryProvider;

