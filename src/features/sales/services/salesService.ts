// ============================================
// SALES SERVICE
// Business logic for sales operations (simplified - no batches)
// ============================================

import { supabase } from '../../../lib/supabase';
import type {
  CreateSaleData,
  CompleteSaleResult,
  SaleWithDetails,
  SalesFilters,
  SalesStats,
} from '../models/sales.types';

// ============================================
// CREATE SALE (Main Function)
// ============================================

/**
 * Complete a POS sale atomically
 * Calls the complete_pos_sale_simple database function
 * Directly deducts from inventory using FIFO
 */
export async function createSale(
  data: CreateSaleData
): Promise<CompleteSaleResult> {
  // Convert selected_option_ids to selections JSONB format expected by the function
  const selections = (data.selected_option_ids || []).map(optionId => ({
    option_id: optionId,
  }));

  const { data: result, error } = await supabase.rpc('complete_pos_sale_simple', {
    p_menu_item_id: data.menu_item_id,
    p_quantity: data.quantity,
    p_selections: selections,  // JSONB array of {option_id, option_group_id}
    p_payment_method: data.payment_method,
    p_discount_percent: data.discount_percent || 0,
  });

  if (error) {
    throw new Error(`Sale creation failed: ${error.message}`);
  }

  return result as CompleteSaleResult;
}

// ============================================
// FETCH SALES
// ============================================

/**
 * Get all sales with optional filters
 */
export async function getSales(
  filters?: SalesFilters
): Promise<SaleWithDetails[]> {
  let query = supabase
    .from('sales')
    .select(
      `
      *,
      menu_item:menu_items(id, name, price),
      ingredients:sale_ingredients(
        id,
        inventory_item_id,
        quantity,
        cost,
        created_at
      ),
      selections:sale_selections(
        id,
        option_group_id,
        option_id,
        created_at
      )
    `
    )
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.date_from) {
    query = query.gte('created_at', filters.date_from);
  }

  if (filters?.date_to) {
    query = query.lte('created_at', filters.date_to);
  }

  if (filters?.payment_method) {
    query = query.eq('payment_method', filters.payment_method);
  }

  if (filters?.menu_item_id) {
    query = query.eq('menu_item_id', filters.menu_item_id);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch sales: ${error.message}`);
  }

  return data as SaleWithDetails[];
}

/**
 * Get a single sale by ID with full details
 */
export async function getSaleById(id: string): Promise<SaleWithDetails | null> {
  const { data, error } = await supabase
    .from('sales')
    .select(
      `
      *,
      menu_item:menu_items(id, name, price),
      ingredients:sale_ingredients(
        id,
        inventory_item_id,
        quantity,
        cost,
        created_at
      ),
      selections:sale_selections(
        id,
        option_group_id,
        option_id,
        created_at
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch sale: ${error.message}`);
  }

  return data as SaleWithDetails;
}

// ============================================
// SALES ANALYTICS
// ============================================

/**
 * Get sales statistics for a date range
 */
export async function getSalesStats(
  date_from?: string,
  date_to?: string
): Promise<SalesStats> {
  let query = supabase.from('sales').select('*');

  if (date_from) {
    query = query.gte('created_at', date_from);
  }

  if (date_to) {
    query = query.lte('created_at', date_to);
  }

  const { data: sales, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch sales stats: ${error.message}`);
  }

  if (!sales || sales.length === 0) {
    return {
      total_sales: 0,
      total_revenue: 0,
      total_cogs: 0,
      total_profit: 0,
      profit_margin: 0,
      by_payment_method: {
        cash: 0,
        omt: 0,
        whish: 0,
      },
    };
  }

  const total_revenue = sales.reduce((sum, s) => sum + Number(s.revenue), 0);
  const total_cogs = sales.reduce((sum, s) => sum + Number(s.cogs), 0);
  const total_profit = sales.reduce((sum, s) => sum + Number(s.profit), 0);
  const profit_margin =
    total_revenue > 0 ? (total_profit / total_revenue) * 100 : 0;

  // By payment method
  const cash_revenue = sales
    .filter((s) => s.payment_method === 'cash')
    .reduce((sum, s) => sum + Number(s.revenue), 0);
  const omt_revenue = sales
    .filter((s) => s.payment_method === 'omt')
    .reduce((sum, s) => sum + Number(s.revenue), 0);
  const whish_revenue = sales
    .filter((s) => s.payment_method === 'whish')
    .reduce((sum, s) => sum + Number(s.revenue), 0);

  return {
    total_sales: sales.length,
    total_revenue,
    total_cogs,
    total_profit,
    profit_margin,
    by_payment_method: {
      cash: cash_revenue,
      omt: omt_revenue,
      whish: whish_revenue,
    },
  };
}

/**
 * Get today's sales stats (quick access)
 */
export async function getTodaySalesStats(): Promise<SalesStats> {
  const today = new Date().toISOString().split('T')[0];
  return getSalesStats(`${today}T00:00:00Z`, `${today}T23:59:59Z`);
}
