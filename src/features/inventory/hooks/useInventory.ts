// ============================================
// useInventory Hook
// Manages inventory list with filters and real-time updates
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import type {
  InventoryItemWithStatus,
  InventoryFilters,
  InventorySortOptions,
} from '../models/inventory.types';
import { getInventoryItems } from '../services/inventoryService';

interface UseInventoryReturn {
  items: InventoryItemWithStatus[];
  loading: boolean;
  error: string | null;
  filters: InventoryFilters;
  sort: InventorySortOptions;
  setFilters: (filters: InventoryFilters) => void;
  setSort: (sort: InventorySortOptions) => void;
  refresh: () => Promise<void>;
}

export function useInventory(): UseInventoryReturn {
  const [items, setItems] = useState<InventoryItemWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InventoryFilters>({});
  const [sort, setSort] = useState<InventorySortOptions>({
    field: 'name',
    direction: 'asc',
  });

  // Fetch items
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInventoryItems(filters, sort);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  // Initial load
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Set up real-time subscription
  useEffect(() => {
    const itemsSubscription = supabase
      .channel('inventory_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_items',
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    const purchasesSubscription = supabase
      .channel('stock_purchases_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock_purchases',
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(itemsSubscription);
      supabase.removeChannel(purchasesSubscription);
    };
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    filters,
    sort,
    setFilters,
    setSort,
    refresh: fetchItems,
  };
}
