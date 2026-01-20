// ============================================
// MENU HOOKS
// React Query hooks for menu data
// ============================================

import { useQuery } from '@tanstack/react-query';
import {
  getMenuItems,
  getMenuItemById,
  getActiveMenuItems,
} from '../services/menuService';
import type { MenuFilters } from '../models/menu.types';

// ============================================
// QUERY KEYS FACTORY
// ============================================

export const menuKeys = {
  all: ['menu'] as const,
  lists: () => [...menuKeys.all, 'list'] as const,
  list: (filters?: MenuFilters) => [...menuKeys.lists(), { filters }] as const,
  details: () => [...menuKeys.all, 'detail'] as const,
  detail: (id: string) => [...menuKeys.details(), id] as const,
  active: () => [...menuKeys.all, 'active'] as const,
};

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook to fetch all menu items with filters
 */
export function useMenuItems(
  filters?: MenuFilters,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) {
  return useQuery({
    queryKey: menuKeys.list(filters),
    queryFn: () => getMenuItems(filters),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

/**
 * Hook to fetch a single menu item by ID
 */
export function useMenuItem(
  id: string | null,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: menuKeys.detail(id || ''),
    queryFn: () => {
      if (!id) throw new Error('Menu item ID is required');
      return getMenuItemById(id);
    },
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 30000,
  });
}

/**
 * Hook to fetch active menu items for POS
 */
export function useActiveMenuItems(
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) {
  return useQuery({
    queryKey: menuKeys.active(),
    queryFn: () => getActiveMenuItems(),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
    ...options,
  });
}

/**
 * Alias for useActiveMenuItems for POS usage
 */
export function usePOSMenuItems(
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) {
  return useActiveMenuItems(options);
}
