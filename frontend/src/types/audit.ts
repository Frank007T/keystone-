export interface AuditLogItem {
  id: number;
  action: string;
  module: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  performedByUserId?: number;
  performedByName?: string;
  performedByEmail?: string;
  role?: string;
  ipAddress?: string;
  browser?: string;
  operatingSystem?: string;
  endpoint?: string;
  httpMethod?: string;
  requestBody?: string;
  responseStatus?: number;
  status?: string;
  createdAt?: string;
}

export interface AuditLogResponse {
  content: AuditLogItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface AuditLogStatistics {
  totalAuditCount: number;
  todayActions: number;
  weeklyActions: number;
  recentActivityCount: number;
  loginCount: number;
  userCreationCount: number;
  orderCount: number;
  settingsChangeCount: number;
}
