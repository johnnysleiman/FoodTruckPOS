// ============================================
// MENU SERVICE
// Menu queries and calculations (simplified - no batches)
// ============================================

import { supabase } from '../../../lib/supabase';
import type {
  MenuItemWithDetails,
  MenuFilters,
  MenuOption,
  COGSBreakdown,
  PriceBreakdown,
} from '../models/menu.types';

// ============================================
// QUERY FUNCTIONS
// ============================================

/**
 * Fetches all menu items with full details (ingredients, options, packaging)
 * @param filters - Optional filters to apply
 * @returns Array of menu items with details
 */
export async function getMenuItems(
  filters?: MenuFilters
): Promise<MenuItemWithDetails[]> {
  let query = supabase
    .from('menu_items')
    .select(`
      *,
      ingredients:menu_ingredients (
        id,
        menu_item_id,
        inventory_item_id,
        quantity,
        created_at,
        inventory_item:inventory_items!inventory_item_id (
          id,
          name,
          unit_of_measurement,
          weighted_avg_cost,
          total_quantity
        )
      ),
      option_groups:menu_option_groups (
        id,
        menu_item_id,
        name,
        is_required,
        multiple_selection,
        display_order,
        created_at,
        options:menu_options (
          id,
          option_group_id,
          inventory_item_id,
          name,
          quantity,
          additional_price,
          display_order,
          created_at,
          inventory_item:inventory_items!inventory_item_id (
            id,
            name,
            unit_of_measurement,
            weighted_avg_cost,
            total_quantity
          )
        )
      ),
      packaging:menu_packaging (
        id,
        menu_item_id,
        inventory_item_id,
        quantity,
        created_at,
        inventory_item:inventory_items!inventory_item_id (
          id,
          name,
          unit_of_measurement,
          weighted_avg_cost,
          total_quantity
        )
      )
    `);

  // Apply filters
  if (filters) {
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters.recipe_type) {
      query = query.eq('recipe_type', filters.recipe_type);
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
  }

  // Default sort by display_order, then name
  query = query.order('display_order', { ascending: true });
  query = query.order('name', { ascending: true });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch menu items: ${error.message}`);
  }

  // Sort option_groups by display_order
  const items = (data || []).map(item => ({
    ...item,
    option_groups: (item.option_groups || [])
      .map((group: any) => ({
        ...group,
        options: (group.options || []).sort((a: any, b: any) => a.display_order - b.display_order)
      }))
      .sort((a: any, b: any) => a.display_order - b.display_order)
  }));

  return items as MenuItemWithDetails[];
}

/**
 * Fetches a single menu item by ID with full details
 * @param id - Menu item ID
 * @returns Menu item with details or null if not found
 */
export async function getMenuItemById(id: string): Promise<MenuItemWithDetails | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .select(`
      *,
      ingredients:menu_ingredients (
        id,
        menu_item_id,
        inventory_item_id,
        quantity,
        created_at,
        inventory_item:inventory_items!inventory_item_id (
          id,
          name,
          unit_of_measurement,
          weighted_avg_cost,
          total_quantity
        )
      ),
      option_groups:menu_option_groups (
        id,
        menu_item_id,
        name,
        is_required,
        multiple_selection,
        display_order,
        created_at,
        options:menu_options (
          id,
          option_group_id,
          inventory_item_id,
          name,
          quantity,
          additional_price,
          display_order,
          created_at,
          inventory_item:inventory_items!inventory_item_id (
            id,
            name,
            unit_of_measurement,
            weighted_avg_cost,
            total_quantity
          )
        )
      ),
      packaging:menu_packaging (
        id,
        menu_item_id,
        inventory_item_id,
        quantity,
        created_at,
        inventory_item:inventory_items!inventory_item_id (
          id,
          name,
          unit_of_measurement,
          weighted_avg_cost,
          total_quantity
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch menu item: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  // Sort option_groups and options by display_order
  const item = {
    ...data,
    option_groups: (data.option_groups || [])
      .map((group: any) => ({
        ...group,
        options: (group.options || []).sort((a: any, b: any) => a.display_order - b.display_order)
      }))
      .sort((a: any, b: any) => a.display_order - b.display_order)
  };

  return item as MenuItemWithDetails;
}

/**
 * Fetches active menu items for POS
 * @returns Array of active menu items
 */
export async function getActiveMenuItems(): Promise<MenuItemWithDetails[]> {
  return getMenuItems({
    is_active: true
  });
}

// ============================================
// CALCULATION UTILITIES
// ============================================

/**
 * Calculates estimated COGS for a menu item (simplified - no batch batter)
 * @param item - Menu item with details
 * @returns COGS breakdown
 */
export function calculateEstimatedCOGS(item: MenuItemWithDetails): COGSBreakdown {
  let ingredients_cost = 0;
  let options_cost = 0;
  let packaging_cost = 0;

  // Fixed ingredients cost
  if (item.ingredients) {
    ingredients_cost = item.ingredients.reduce((sum, ing) => {
      const cost = (ing.inventory_item?.weighted_avg_cost || 0) * ing.quantity;
      return sum + cost;
    }, 0);
  }

  // Variable options cost (worst-case: assume all selected)
  if (item.option_groups) {
    for (const group of item.option_groups) {
      if (group.multiple_selection) {
        // Multiple selection: assume all options selected
        options_cost += group.options.reduce((sum, opt) => {
          const cost = (opt.inventory_item?.weighted_avg_cost || 0) * opt.quantity;
          return sum + cost;
        }, 0);
      } else {
        // Single selection: use most expensive option
        const costs = group.options.map(opt => (opt.inventory_item?.weighted_avg_cost || 0) * opt.quantity);
        if (costs.length > 0) {
          options_cost += Math.max(...costs);
        }
      }
    }
  }

  // Packaging cost
  if (item.packaging) {
    packaging_cost = item.packaging.reduce((sum, pkg) => {
      const cost = (pkg.inventory_item?.weighted_avg_cost || 0) * pkg.quantity;
      return sum + cost;
    }, 0);
  }

  const total_cogs = ingredients_cost + options_cost + packaging_cost;

  return {
    ingredients_cost,
    options_cost,
    packaging_cost,
    total_cogs
  };
}

/**
 * Calculates actual COGS for specific selections
 * @param item - Menu item with details
 * @param selectedOptions - Array of selected options
 * @returns Actual COGS
 */
export function calculateActualCOGS(
  item: MenuItemWithDetails,
  selectedOptions: MenuOption[]
): number {
  let total = 0;

  // Fixed ingredients cost
  if (item.ingredients) {
    total += item.ingredients.reduce((sum, ing) => {
      const cost = (ing.inventory_item?.weighted_avg_cost || 0) * ing.quantity;
      return sum + cost;
    }, 0);
  }

  // Selected options cost
  total += selectedOptions.reduce((sum, opt) => {
    const cost = (opt.inventory_item?.weighted_avg_cost || 0) * opt.quantity;
    return sum + cost;
  }, 0);

  // Packaging cost
  if (item.packaging) {
    total += item.packaging.reduce((sum, pkg) => {
      const cost = (pkg.inventory_item?.weighted_avg_cost || 0) * pkg.quantity;
      return sum + cost;
    }, 0);
  }

  return total;
}

/**
 * Calculates dynamic price based on base price and selected options
 * @param basePrice - Base menu item price
 * @param selectedOptions - Array of selected options
 * @returns Price breakdown
 */
export function calculateDynamicPrice(basePrice: number, selectedOptions: MenuOption[]): PriceBreakdown {
  const additional_options_cost = selectedOptions.reduce(
    (sum, opt) => sum + opt.additional_price,
    0
  );

  return {
    base_price: basePrice,
    additional_options_cost,
    total_price: basePrice + additional_options_cost
  };
}
