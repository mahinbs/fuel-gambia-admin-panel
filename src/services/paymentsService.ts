import { paymentFunctions } from '@/supabase';
import { Payment, PaginatedResponse, PaymentStatus } from '@/types';
import { PAGE_SIZE } from '@/utils/constants';

export const paymentsService = {
  async getPayments(params: {
    page?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Payment>> {
    const result = await paymentFunctions.getPayments({
      page: params.page,
      status: params.status,
      startDate: params.startDate,
      endDate: params.endDate,
    });

    const formattedData: Payment[] = (result.data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      userName: item.user?.name || 'Unknown',
      transactionId: item.transaction_id,
      amount: Number(item.amount),
      fuelType: item.fuel_type,
      status: item.status as PaymentStatus,
      paymentMethod: item.payment_method,
      gatewayResponse: item.gateway_response,
      retryCount: item.retry_count || 0,
      refunded: item.refunded || false,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    return {
      data: formattedData,
      total: result.total,
      page: result.page,
      limit: PAGE_SIZE,
      totalPages: result.totalPages,
    };
  },

  async getPaymentById(id: string): Promise<Payment> {
    const item = await paymentFunctions.getPaymentById(id) as any;
    return {
      id: item.id,
      userId: item.user_id,
      userName: item.user?.name || 'Unknown',
      transactionId: item.transaction_id,
      amount: Number(item.amount),
      fuelType: item.fuel_type,
      status: item.status as PaymentStatus,
      paymentMethod: item.payment_method,
      gatewayResponse: item.gateway_response,
      retryCount: item.retry_count || 0,
      refunded: item.refunded || false,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  },

  async retryPayment(id: string): Promise<Payment> {
    const item = await paymentFunctions.retryPayment(id) as any;
    return {
      id: item.id,
      userId: item.user_id,
      userName: '',
      transactionId: item.transaction_id,
      amount: Number(item.amount),
      fuelType: item.fuel_type,
      status: item.status as PaymentStatus,
      paymentMethod: item.payment_method,
      gatewayResponse: item.gateway_response,
      retryCount: item.retry_count || 0,
      refunded: item.refunded || false,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  },

  async processRefund(id: string): Promise<Payment> {
    const item = await paymentFunctions.processRefund(id) as any;
    return {
      id: item.id,
      userId: item.user_id,
      userName: '',
      transactionId: item.transaction_id,
      amount: Number(item.amount),
      fuelType: item.fuel_type,
      status: item.status as PaymentStatus,
      paymentMethod: item.payment_method,
      gatewayResponse: item.gateway_response,
      retryCount: item.retry_count || 0,
      refunded: true,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  },
};
