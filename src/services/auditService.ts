import { auditFunctions } from '@/supabase';
import { AuditLog, PaginatedResponse } from '@/types';

export const auditService = {
  async getAuditLogs(params: {
    page?: number;
    userId?: string;
    entityType?: string;
    action?: string;
  } = {}): Promise<PaginatedResponse<AuditLog>> {
    const result = await auditFunctions.getAuditLogs(params);

    return {
      data: (result.data || []).map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        userName: item.user?.name || 'Unknown',
        userRole: item.user?.role || 'UNKNOWN',
        action: item.action,
        entityType: item.entity_type,
        entityId: item.entity_id,
        oldValues: item.old_values,
        newValues: item.new_values,
        ipAddress: item.ip_address,
        userAgent: item.user_agent,
        createdAt: item.created_at,
      })) as AuditLog[],
      total: result.total,
      page: result.page,
      limit: 20,
      totalPages: result.totalPages,
    };
  },

  async logAction(payload: {
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
  }): Promise<void> {
    await auditFunctions.logAction(payload);
  },
};
