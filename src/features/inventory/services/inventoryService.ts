// ============================================
// INVENTORY SERVICE
// Database operations for inventory management
// ============================================

import { supabase } from '../../../lib/supabase';
import type {
  InventoryItem,
  InventoryItemWithStatus,
  InventoryItemDetails,
  StockPurchase,
  AddStockFormData,
  CreateItemFormData,
  InventoryFilters,
  InventorySortOptions,
  FIFOResult,
  StockStatus,
} from '../models/inventory.types';
import { calculateStockStatus, calculateDaysUntilExpiry } from '../utils/stockCalculations';

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get all inventory items with status calculations
 */
export async function getInventoryItems(
  filters?: InventoryFilters,
  sort?: InventorySortOptions
): Promise<InventoryItemWithStatus[]> {
  try {
    let query = supabase.from('inventory_items').select('*');

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.expirable_only) {
      query = query.eq('is_expirable', true);
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });
    } else {
      query = query.order('name', { ascending: true });
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get oldest purchase for each item (for expiry calculations)
    const itemsWithPurchases = await Promise.all(
      (data || []).map(async (item) => {
        const { data: purchases } = await supabase
          .from('stock_purchases')
          .select('purchase_date, expiry_date')
          .eq('inventory_item_id', item.id)
          .gt('quantity_remaining', 0)
          .order('purchase_date', { ascending: true })
          .limit(1);

        const oldestPurchase = purchases?.[0];

        return {
          ...item,
          stock_status: calculateStockStatus(item.total_quantity, item.reorder_threshold),
          days_until_expiry: oldestPurchase?.expiry_date
            ? calculateDaysUntilExpiry(oldestPurchase.expiry_date)
            : undefined,
          oldest_purchase_date: oldestPurchase?.purchase_date,
        } as InventoryItemWithStatus;
      })
    );

    // Apply status filter if provided
    if (filters?.status) {
      return itemsWithPurchases.filter((item) => item.stock_status === filters.status);
    }

    return itemsWithPurchases;
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    throw new Error('Failed to fetch inventory items');
  }
}

/**
 * Get single inventory item with full details including purchases
 */
export async function getInventoryItemById(id: string): Promise<InventoryItemDetails | null> {
  try {
    const { data: item, error: itemError } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();

    if (itemError) throw itemError;
    if (!item) return null;

    const { data: purchases, error: purchasesError } = await supabase
      .from('stock_purchases')
      .select('*')
      .eq('inventory_item_id', id)
      .order('purchase_date', { ascending: false });

    if (purchasesError) throw purchasesError;

    const activePurchases = purchases?.filter((p) => p.quantity_remaining > 0) || [];
    const oldestPurchase = activePurchases.sort(
      (a, b) => new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime()
    )[0];

    return {
      ...item,
      stock_status: calculateStockStatus(item.total_quantity, item.reorder_threshold),
      days_until_expiry: oldestPurchase?.expiry_date
        ? calculateDaysUntilExpiry(oldestPurchase.expiry_date)
        : undefined,
      oldest_purchase_date: oldestPurchase?.purchase_date,
      purchases: purchases || [],
      total_purchases: purchases?.length || 0,
    } as InventoryItemDetails;
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    throw new Error('Failed to fetch inventory item');
  }
}

/**
 * Get stock purchases for an item
 */
export async function getStockPurchases(itemId: string): Promise<StockPurchase[]> {
  try {
    const { data, error } = await supabase
      .from('stock_purchases')
      .select('*')
      .eq('inventory_item_id', itemId)
      .order('purchase_date', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching stock purchases:', error);
    throw new Error('Failed to fetch stock purchases');
  }
}

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create new inventory item
 */
export async function createInventoryItem(
  formData: CreateItemFormData
): Promise<InventoryItem> {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        name: formData.name.trim(),
        category: formData.category,
        unit_of_measurement: formData.unit_of_measurement,
        reorder_threshold: formData.reorder_threshold || null,
        is_expirable: formData.is_expirable,
        total_quantity: 0,
        total_value: 0,
        weighted_avg_cost: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return data as InventoryItem;
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw new Error('Failed to create inventory item');
  }
}

/**
 * Add stock to existing item
 */
export async function addStock(
  itemId: string,
  formData: AddStockFormData
): Promise<StockPurchase> {
  try {
    const costPerUnit = formData.total_cost / formData.quantity_purchased;

    const { data, error } = await supabase
      .from('stock_purchases')
      .insert({
        inventory_item_id: itemId,
        quantity_purchased: formData.quantity_purchased,
        quantity_remaining: formData.quantity_purchased,
        cost_per_unit: costPerUnit,
        total_cost: formData.total_cost,
        supplier: formData.supplier || null,
        purchase_date: formData.purchase_date,
        expiry_date: formData.expiry_date || null,
      })
      .select()
      .single();

    if (error) throw error;

    return data as StockPurchase;
  } catch (error) {
    console.error('Error adding stock:', error);
    throw new Error('Failed to add stock');
  }
}

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update inventory item details
 */
export async function updateInventoryItem(
  id: string,
  updates: Partial<CreateItemFormData>
): Promise<InventoryItem> {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({
        ...(updates.name && { name: updates.name.trim() }),
        ...(updates.category && { category: updates.category }),
        ...(updates.unit_of_measurement && {
          unit_of_measurement: updates.unit_of_measurement,
        }),
        ...(updates.reorder_threshold !== undefined && {
          reorder_threshold: updates.reorder_threshold,
        }),
        ...(updates.is_expirable !== undefined && { is_expirable: updates.is_expirable }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data as InventoryItem;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw new Error('Failed to update inventory item');
  }
}

// ============================================
// FIFO OPERATIONS
// ============================================

/**
 * Deduct inventory using FIFO method (calls database function)
 */
export async function deductInventoryFIFO(
  itemId: string,
  quantity: number
): Promise<FIFOResult> {
  try {
    const { data, error } = await supabase.rpc('deduct_inventory_fifo', {
      p_item_id: itemId,
      p_quantity: quantity,
    });

    if (error) throw error;

    return data as FIFOResult;
  } catch (error) {
    console.error('Error deducting inventory (FIFO):', error);
    throw new Error('Failed to deduct inventory');
  }
}

// ============================================
// UTILITY OPERATIONS
// ============================================

/**
 * Check if item name already exists
 */
export async function checkItemNameExists(name: string, excludeId?: string): Promise<boolean> {
  try {
    let query = supabase
      .from('inventory_items')
      .select('id')
      .ilike('name', name.trim());

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Error checking item name:', error);
    return false;
  }
}

/**
 * Get low stock items count
 */
export async function getLowStockCount(): Promise<number> {
  try {
    const { data, error } = await supabase.from('inventory_items').select('*');

    if (error) throw error;

    const lowStockItems = (data || []).filter((item) => {
      const status = calculateStockStatus(item.total_quantity, item.reorder_threshold);
      return status === ('low_stock' as StockStatus) || status === ('out_of_stock' as StockStatus);
    });

    return lowStockItems.length;
  } catch (error) {
    console.error('Error getting low stock count:', error);
    return 0;
  }
}

/**
 * Get expiring soon items count (within 7 days)
 */
export async function getExpiringSoonCount(): Promise<number> {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data, error } = await supabase
      .from('stock_purchases')
      .select('*')
      .gt('quantity_remaining', 0)
      .not('expiry_date', 'is', null)
      .lte('expiry_date', sevenDaysFromNow.toISOString().split('T')[0]);

    if (error) throw error;

    return data?.length || 0;
  } catch (error) {
    console.error('Error getting expiring soon count:', error);
    return 0;
  }
}

/**
 * Delete an inventory item (only if no stock purchases exist)
 */
export async function deleteInventoryItem(id: string): Promise<void> {
  try {
    // Check if there are any stock purchases
    const { data: purchases, error: purchaseError } = await supabase
      .from('stock_purchases')
      .select('id')
      .eq('inventory_item_id', id)
      .limit(1);

    if (purchaseError) throw purchaseError;

    if (purchases && purchases.length > 0) {
      throw new Error('Cannot delete item with existing stock purchases. Remove all stock first.');
    }

    // Check if item is used in any menu ingredients
    const { data: menuIngredients, error: menuError } = await supabase
      .from('menu_ingredients')
      .select('id')
      .eq('inventory_item_id', id)
      .limit(1);

    if (menuError) throw menuError;

    if (menuIngredients && menuIngredients.length > 0) {
      throw new Error('Cannot delete item that is used in menu recipes. Remove from menu first.');
    }

    // Delete the item
    const { error: deleteError } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error instanceof Error ? error : new Error('Failed to delete inventory item');
  }
}

/**
 * Delete a stock purchase (only if fully unused)
 */
export async function deletePurchase(purchaseId: string): Promise<void> {
  try {
    // Check if purchase is unused
    const { data: purchase, error: fetchError } = await supabase
      .from('stock_purchases')
      .select('inventory_item_id, quantity_purchased, quantity_remaining, total_cost')
      .eq('id', purchaseId)
      .single();

    if (fetchError) throw fetchError;

    if (purchase.quantity_remaining < purchase.quantity_purchased) {
      throw new Error('Cannot delete purchase that has been partially consumed');
    }

    // Delete purchase
    const { error: deleteError } = await supabase
      .from('stock_purchases')
      .delete()
      .eq('id', purchaseId);

    if (deleteError) throw deleteError;

    // Update inventory totals
    await supabase
      .from('inventory_items')
      .update({
        total_quantity: supabase.rpc('raw', { raw: `total_quantity - ${purchase.quantity_purchased}` }),
        total_value: supabase.rpc('raw', { raw: `total_value - ${purchase.total_cost}` }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', purchase.inventory_item_id);
  } catch (error) {
    console.error('Error deleting purchase:', error);
    throw error instanceof Error ? error : new Error('Failed to delete purchase');
  }
}
