'use client';

import React from 'react';
import { FileText, Clock, CheckCircle2, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDocuments } from '@/actions/document';
import { Document } from '@/types/document';
import { Skeleton } from '@/components';
import toast from 'react-hot-toast';

interface StatCardItemProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
  trendDirection?: 'up' | 'down';
  onClick?: () => void;
  accentColorClass?: string;
}

const StatCardItem = ({
  title,
  value,
  icon,
  trend,
  trendDirection = 'up',
  onClick,
  accentColorClass = 'bg-primary/5 text-primary',
}: StatCardItemProps) => {
  const isUp = trendDirection === 'up';

  return (
    <div
      className="bg-white rounded-xl md:rounded-2xl shadow-xs p-3 md:p-4 flex flex-col gap-2 md:gap-4 hover:shadow-sm transition w-full cursor-pointer border border-gray-100"
      onClick={onClick}
    >
      <div className="flex items-center relative">
        <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ${accentColorClass} [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div
            className={`px-2 py-0.5 absolute right-0 top-0 rounded-full text-[10px] md:text-xs font-semibold flex items-center gap-0.5 md:gap-1 ${
              isUp ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}
          >
            {isUp ? <TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> : <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 md:gap-3">
        <span className="text-gray-500 text-[10px] md:text-xs font-medium truncate whitespace-nowrap overflow-hidden">{title}</span>
        <span className="text-lg md:text-2xl font-bold text-slate-800">{value}</span>
      </div>
    </div>
  );
};

export default function StatCards({ containerWidth }: { containerWidth?: number }) {
  // const {
  //   data: documentData,
  //   isLoading,
  //   isError,
  //   error,
  // } = useQuery({
  //   queryKey: ['documents-stats'],
  //   queryFn: () => getDocuments({ limit: 1000 }),
  //   refetchOnWindowFocus: false,
  // });

  // Mockup data for now
  const isLoading = false;
  
  const mockItems = [
    { approvalStatus: 'approved' },
    { approvalStatus: 'pending' },
    { approvalStatus: 'pending' },
    { approvalStatus: 'rejected' },
    { approvalStatus: 'approved' },
    { approvalStatus: 'draft' },
  ];

  // React.useEffect(() => {
  //   if (isError && error) {
  //     toast.error('Không thể tải dữ liệu thống kê tài liệu.');
  //   }
  // }, [isError, error]);

  const isLarge = containerWidth ? containerWidth >= 900 : false;

  const gridClass = containerWidth
    ? isLarge
      ? 'grid grid-cols-4'
      : 'grid grid-cols-2'
    : 'grid grid-cols-2 md:grid-cols-4';

  if (isLoading) {
    return (
      <div className={`${gridClass} gap-4 md:gap-6 w-full select-none`}>
        <Skeleton className="w-full h-32 md:h-40 rounded-2xl md:rounded-3xl" />
        <Skeleton className="w-full h-32 md:h-40 rounded-2xl md:rounded-3xl" />
        <Skeleton className="w-full h-32 md:h-40 rounded-2xl md:rounded-3xl" />
        <Skeleton className="w-full h-32 md:h-40 rounded-2xl md:rounded-3xl" />
      </div>
    );
  }

  const items = mockItems as any[];
  const total = items.length;
  const pendingCount = items.filter((item: any) => item.approvalStatus === 'pending').length;
  const approvedCount = items.filter((item: any) => item.approvalStatus === 'approved').length;
  const rejectedCount = items.filter((item: any) => item.approvalStatus === 'rejected').length;

  const stats = [
    {
      title: 'Tổng số tài liệu',
      value: total,
      icon: <FileText />,
      accentColorClass: 'bg-primary/10 text-primary',
    },
    {
      title: 'Đang chờ duyệt',
      value: pendingCount,
      icon: <Clock />,
      accentColorClass: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Đã phê duyệt',
      value: approvedCount,
      icon: <CheckCircle2 />,
      accentColorClass: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Bị từ chối',
      value: rejectedCount,
      icon: <XCircle />,
      accentColorClass: 'bg-rose-50 text-rose-600',
    },
  ];

  return (
    <div className={`${gridClass} gap-4 select-none w-full`}>
      {stats.map((stat, index) => (
        <StatCardItem
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          accentColorClass={stat.accentColorClass}
        />
      ))}
    </div>
  );
}