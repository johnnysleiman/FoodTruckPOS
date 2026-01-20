// ============================================
// SALES TYPES
// TypeScript types for sales management (simplified - no batches)
// ============================================

// Base sale record from database
export interface Sale {
  id: string;
  menu_item_id: string;
  quantity: number;
  revenue: number;
  cogs: number;
  profit: number;
  channel: 'pos';
  payment_method: 'cash' | 'omt' | 'whish';
  created_at: string;
  // Discount fields
  discount_percent: number | null;
  discount_amount: number | null;
  original_revenue: number | null;
}

// Sale ingredient tracking
export interface SaleIngredient {
  id: string;
  sale_id: string;
  inventory_item_id: string;
  quantity_used: number;
  cost: number;
  created_at: string;
}

// Sale selection tracking (for variable recipe items)
export interface SaleSelection {
  id: string;
  sale_id: string;
  option_group_id: string;
  menu_option_id: string;
  created_at: string;
}

// Input data for creating a sale (simplified - no batch_id)
export interface CreateSaleData {
  menu_item_id: string;
  quantity: number;
  selected_option_ids?: string[] | null; // For variable recipe items
  payment_method: 'cash' | 'omt' | 'whish';
  channel?: 'pos';
  discount_percent?: number | null; // Optional discount percentage (0-100)
}

// Response from complete_pos_sale RPC (simplified - no batch info)
export interface CompleteSaleResult {
  success: boolean;
  sale_id?: string;
  menu_item_name?: string;
  quantity?: number;
  original_revenue?: number;
  discount_percent?: number;
  discount_amount?: number;
  revenue?: number;
  cogs?: number;
  profit?: number;
  payment_method?: string;
  channel?: string;
  ingredient_deductions?: IngredientDeduction[];
  timestamp?: string;
  message?: string;
  // Error fields
  error?: string;
  error_detail?: string;
}

// Deduction details from RPC response
export interface IngredientDeduction {
  type: 'fixed_ingredient' | 'variable_option' | 'packaging';
  inventory_item_id: string;
  ingredient_name?: string;
  packaging_name?: string;
  option_id?: string;
  quantity_deducted: number;
  cost: number;
  fifo_details: FIFODeduction[];
}

export interface FIFODeduction {
  purchase_id: string;
  quantity_deducted: number;
  cost_per_unit: number;
  cost: number;
  purchase_date: string;
}

// Sale with full details (for display)
export interface SaleWithDetails extends Sale {
  menu_item?: {
    id: string;
    name: string;
    price: number;
  };
  ingredients?: SaleIngredient[];
  selections?: SaleSelection[];
}

// Filters for fetching sales
export interface SalesFilters {
  date_from?: string;
  date_to?: string;
  payment_method?: 'cash' | 'omt' | 'whish';
  menu_item_id?: string;
}

// Sales statistics
export interface SalesStats {
  total_sales: number;
  total_revenue: number;
  total_cogs: number;
  total_profit: number;
  profit_margin: number;
  by_payment_method: {
    cash: number;
    omt: number;
    whish: number;
  };
}
