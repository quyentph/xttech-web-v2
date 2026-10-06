'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Folder, FolderOpen, Inbox, Users, Building, FileText, MoreHorizontal } from 'lucide-react';
import { cn } from '@/utils';
import { getDocumentCategoriesTree, getInboxDocuments } from '@/actions/document';
import { usePageTransition } from '@/contexts';
import { usePathname } from 'next/navigation';

interface DocumentSidebarNodeProps {
  isCollapsed: boolean;
  activeId?: string;
  variant?: 'light' | 'dark';
}

export function DocumentSidebarNode({ isCollapsed, activeId, variant = 'light' }: DocumentSidebarNodeProps) {
  const { navigateTo } = usePageTransition();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true); // Default open for "Cơ chế & Tài liệu"
  const [myFoldersOpen, setMyFoldersOpen] = useState(true);

  const isLight = variant === 'light';

  const { data: categoriesData } = useQuery({
    queryKey: ['document-categories'],
    queryFn: () => getDocumentCategoriesTree(),
  });

  const { data: inboxData } = useQuery({
    queryKey: ['document-inbox-count'],
    queryFn: () => getInboxDocuments({ isRead: false, limit: 1 }),
  });

  const badgeCount = inboxData?.total || 0;

  let myFolders: any[] = [];
  if (categoriesData?.myFolders) {
    myFolders = categoriesData.myFolders;
  } else if (categoriesData?.data?.myFolders) {
    myFolders = categoriesData.data.myFolders;
  }

  const isRootActive = pathname.startsWith('/app/documents');

  // Render a folder recursively
  const renderFolder = (folder: any, level = 0) => {
    const isFolderActive = pathname === `/app/documents?categoryId=${folder.id}`;
    
    return (
      <div key={folder.id} className="space-y-0.5">
        <button
          type="button"
          onClick={() => navigateTo(`/app/documents?categoryId=${folder.id}`)}
          className={cn(
            'w-full text-left py-1.5 pr-2 flex items-center gap-2 text-xs rounded-md transition-colors relative cursor-pointer overflow-hidden group',
            isFolderActive
              ? isLight
                ? 'bg-slate-100/50 text-primary font-semibold'
                : 'bg-slate-800/80 text-primary font-semibold'
              : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40',
          )}
          style={{ paddingLeft: `${(level + 1) * 12 + 16}px` }}
        >
          {folder.children && folder.children.length > 0 ? (
            <ChevronDown size={12} className="shrink-0 text-slate-400" />
          ) : (
            <div className="w-3 shrink-0" /> // Spacer
          )}
          <Folder size={12} className="shrink-0" />
          <span className="truncate whitespace-nowrap block flex-1">{folder.name}</span>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal size={12} className="text-slate-400 hover:text-slate-700" />
          </div>
        </button>

        {/* Children Render */}
        {folder.children && folder.children.length > 0 && (
          <div className="space-y-0.5">
            {folder.children.map((child: any) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {/* Root Item */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 relative cursor-pointer group text-left overflow-hidden',
          isRootActive
            ? isLight
              ? 'bg-slate-100 text-primary font-semibold'
              : 'bg-slate-800 text-white font-semibold'
            : isLight
              ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100',
        )}
      >
        {isCollapsed && isRootActive && <span className="absolute right-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-l-md" />}

        <span className={cn('shrink-0 transition-colors', isRootActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-400')}>
          <FileText size={18} />
        </span>

        {!isCollapsed && (
          <>
            <span className="flex-1 truncate whitespace-nowrap">Cơ chế & Tài liệu</span>
            <span className="text-slate-500 shrink-0">{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
          </>
        )}
      </button>

      {/* Sub Menu */}
      {!isCollapsed && isOpen && (
        <div className={cn('relative space-y-1 py-1 border-l ml-5', isLight ? 'border-slate-200' : 'border-slate-800')}>
          
          {/* Thư mục của tôi */}
          <div>
            <button
              type="button"
              onClick={() => setMyFoldersOpen(!myFoldersOpen)}
              className={cn(
                'w-full text-left py-2 pr-3 pl-4 flex items-center justify-between text-xs rounded-md transition-colors relative cursor-pointer overflow-hidden',
                isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40',
              )}
            >
              <div className="flex items-center gap-2">
                {myFoldersOpen ? <FolderOpen size={14} /> : <Folder size={14} />}
                <span className="font-medium">Thư mục của tôi</span>
              </div>
              {myFoldersOpen ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
            </button>
            
            {myFoldersOpen && (
              <div className="mt-1 space-y-0.5">
                {myFolders.length > 0 ? (
                  myFolders.map((folder: any) => renderFolder(folder, 0))
                ) : (
                  <div className="pl-9 py-1 text-[10px] text-slate-400 italic">Chưa có thư mục</div>
                )}
              </div>
            )}
          </div>

          {/* Được chia sẻ */}
          <button
            type="button"
            onClick={() => navigateTo('/app/documents?shared=true')}
            className={cn(
              'w-full text-left py-2 pr-3 pl-4 flex items-center gap-2 text-xs rounded-md transition-colors relative cursor-pointer overflow-hidden',
              pathname === '/app/documents' && (typeof window !== 'undefined' && window.location.search.includes('shared=true'))
                ? isLight
                  ? 'bg-slate-100/50 text-primary font-semibold'
                  : 'bg-slate-800/80 text-primary font-semibold'
                : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40',
            )}
          >
            <Users size={14} />
            <span>Được chia sẻ</span>
          </button>

          {/* Hộp thư đến */}
          <button
            type="button"
            onClick={() => navigateTo('/app/documents/inbox')}
            className={cn(
              'w-full text-left py-2 pr-3 pl-4 flex items-center justify-between text-xs rounded-md transition-colors relative cursor-pointer overflow-hidden',
              pathname.includes('/app/documents/inbox')
                ? isLight
                  ? 'bg-slate-100/50 text-primary font-semibold'
                  : 'bg-slate-800/80 text-primary font-semibold'
                : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40',
            )}
          >
            <div className="flex items-center gap-2">
              <Inbox size={14} />
              <span>Hộp thư đến</span>
            </div>
            {badgeCount > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {badgeCount > 99 ? '99+' : badgeCount}
              </span>
            )}
          </button>

          {/* Văn bản công ty */}
          <button
            type="button"
            onClick={() => navigateTo('/app/documents?status=published&shareScope=all')}
            className={cn(
              'w-full text-left py-2 pr-3 pl-4 flex items-center gap-2 text-xs rounded-md transition-colors relative cursor-pointer overflow-hidden',
              pathname === '/app/documents' && (typeof window !== 'undefined' && window.location.search.includes('status=published'))
                ? isLight
                  ? 'bg-slate-100/50 text-primary font-semibold'
                  : 'bg-slate-800/80 text-primary font-semibold'
                : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40',
            )}
          >
            <Building size={14} />
            <span>Văn bản công ty</span>
          </button>
        </div>
      )}
    </div>
  );
}
