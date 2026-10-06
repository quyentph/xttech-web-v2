export interface DocumentUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatar: string | null;
}

export interface DocumentVersion {
  id: number;
  documentId: number;
  versionNumber: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileType?: string;
  downloadUrl?: string;
  changeSummary?: string;
  isCurrent: boolean;
  createdAt: string;
  createdById: string;
  createdBy?: DocumentUser;
}

export interface Document {
  id: number;
  code: string;
  title: string;
  summary: string | null;
  documentType: 'regulation' | 'announcement' | 'form' | 'work_report';
  status: 'draft' | 'published' | 'archived' | 'pending';
  approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected';
  shareScope: 'private' | 'department' | 'all' | 'internal';
  categoryId: number | null;
  categoryName: string | null;
  effectiveDate: string | null;
  expirationDate: string | null;
  supersededById: number | null;
  issuingDepartmentId: number | null;
  issuingDepartmentName: string | null;
  approverId: string | null;
  createdById: string;
  approvalNote: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: DocumentUser;
  approver: DocumentUser | null;
  currentVersion: DocumentVersion | null;
  isRead: boolean | null;
  recipientStats: any | null;
  savedFolders: any | null;
}

export interface DocumentListResponse {
  items: Document[];
  meta: {
    next: boolean;
    total: number;
    offset: number;
    limit: number;
  };
}
