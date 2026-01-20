// ============================================
// INVENTORY TYPE DEFINITIONS
// ============================================

/**
 * Inventory categories for food truck
 */
export type InventoryCategory =
  // Food Ingredients
  | 'raw'           // Proteins, tortillas, rice, beans, beverages
  | 'toppings'      // Vegetables, cheese, herbs
  | 'fillings'      // Sauces, guacamole, sour cream
  // Supplies
  | 'plates_packaging'  // Trays, napkins, bags
  | 'utensils';         // Forks, spoons, etc.

/**
 * Units of measurement
 */
export type UnitOfMeasurement =
  | 'kg'
  | 'g'
  | 'L'
  | 'ml'
  | 'pc'
  | 'box'
  | 'bottle'
  | 'pack'
  | 'cup';

export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
}

// Database entity - matches inventory_items table
export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  unit_of_measurement: UnitOfMeasurement;
  total_quantity: number;
  total_value: number;
  weighted_avg_cost: number;
  reorder_threshold: number | null;
  is_expirable: boolean;
  created_at: string;
  updated_at: string;
}

// Database entity - matches stock_purchases table
export interface StockPurchase {
  id: string;
  inventory_item_id: string;
  quantity_purchased: number;
  quantity_remaining: number;
  cost_per_unit: number;
  total_cost: number;
  supplier: string | null;
  purchase_date: string;
  expiry_date: string | null;
  created_at: string;
}

// View model - Item with computed status
export interface InventoryItemWithStatus extends InventoryItem {
  stock_status: StockStatus;
  days_until_expiry?: number;
  oldest_purchase_date?: string;
}

// View model - Item with full details including purchases
export interface InventoryItemDetails extends InventoryItemWithStatus {
  purchases: StockPurchase[];
  total_purchases: number;
}

// Form data types
export interface AddStockFormData {
  quantity_purchased: number;
  total_cost: number;
  supplier?: string;
  purchase_date: string;
  expiry_date?: string;
}

export interface CreateItemFormData {
  name: string;
  category: InventoryCategory;
  unit_of_measurement: UnitOfMeasurement;
  reorder_threshold?: number;
  is_expirable: boolean;
}

// FIFO function response types
export interface FIFODeduction {
  purchase_id: string;
  quantity_deducted: number;
  cost_per_unit: number;
  cost: number;
  purchase_date: string;
  expiry_date: string | null;
}

export interface FIFOResult {
  success: boolean;
  total_cost: number;
  deductions: FIFODeduction[];
  error?: string;
}

// Filter and sort options
export interface InventoryFilters {
  category?: InventoryCategory;
  status?: StockStatus;
  search?: string;
  expirable_only?: boolean;
}

export interface InventorySortOptions {
  field: 'name' | 'category' | 'total_quantity' | 'stock_status' | 'updated_at';
  direction: 'asc' | 'desc';
}

// API Response types
export type InventoryListResponse = InventoryItemWithStatus[];
export type InventoryItemResponse = InventoryItemDetails;

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
