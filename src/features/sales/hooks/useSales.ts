// ============================================
// SALES HOOKS
// React Query hooks for sales management
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createSale,
  getSales,
  getSaleById,
  getSalesStats,
  getTodaySalesStats,
} from '../services/salesService';
import type {
  CreateSaleData,
  SalesFilters,
} from '../models/sales.types';

// Inventory query keys for cache invalidation
const inventoryKeys = {
  all: ['inventory'] as const,
};

// ============================================
// QUERY KEYS FACTORY
// ============================================

export const salesKeys = {
  all: ['sales'] as const,
  lists: () => [...salesKeys.all, 'list'] as const,
  list: (filters?: SalesFilters) => [...salesKeys.lists(), { filters }] as const,
  details: () => [...salesKeys.all, 'detail'] as const,
  detail: (id: string) => [...salesKeys.details(), id] as const,
  stats: () => [...salesKeys.all, 'stats'] as const,
  stat: (date_from?: string, date_to?: string) =>
    [...salesKeys.stats(), { date_from, date_to }] as const,
  today: () => [...salesKeys.all, 'today'] as const,
};

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook to fetch all sales with optional filters
 */
export function useSales(
  filters?: SalesFilters,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) {
  return useQuery({
    queryKey: salesKeys.list(filters),
    queryFn: () => getSales(filters),
    staleTime: 30000, // 30 seconds
    ...options,
  });
}

/**
 * Hook to fetch a single sale by ID
 */
export function useSale(
  id: string | null,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: salesKeys.detail(id || ''),
    queryFn: () => {
      if (!id) throw new Error('Sale ID is required');
      return getSaleById(id);
    },
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 30000,
  });
}

/**
 * Hook to fetch sales statistics for a date range
 */
export function useSalesStats(
  date_from?: string,
  date_to?: string,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) {
  return useQuery({
    queryKey: salesKeys.stat(date_from, date_to),
    queryFn: () => getSalesStats(date_from, date_to),
    staleTime: 60000, // 1 minute
    ...options,
  });
}

/**
 * Hook to fetch today's sales statistics
 */
export function useTodaySalesStats(
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) {
  return useQuery({
    queryKey: salesKeys.today(),
    queryFn: () => getTodaySalesStats(),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    ...options,
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Hook to create a sale
 */
export function useCreateSale(
  options?: {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saleData: CreateSaleData) => createSale(saleData),
    onSuccess: (data) => {
      // Invalidate all sales lists and stats
      queryClient.invalidateQueries({ queryKey: salesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
      queryClient.invalidateQueries({ queryKey: salesKeys.today() });

      // Also invalidate inventory queries since stock was deducted
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });

      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

// ============================================
// COMBINED HOOK
// ============================================

/**
 * Hook that provides sales state and actions
 */
export function useSalesManagement(filters?: SalesFilters) {
  const { data: sales = [], isLoading, error } = useSales(filters);
  const { data: stats } = useSalesStats(filters?.date_from, filters?.date_to);
  const createMutation = useCreateSale();

  return {
    // Data
    sales,
    stats,
    isLoading,
    error: error?.message,

    // Mutations
    createSale: createMutation.mutate,

    // Mutation states
    isCreating: createMutation.isPending,
  };
}
