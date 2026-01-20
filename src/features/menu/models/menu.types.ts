// ============================================
// MENU TYPES
// Type definitions for the menu system (simplified - no batches)
// ============================================

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type MenuCategory = 'main' | 'sides' | 'drinks' | 'desserts' | 'combos';
export type MenuItemType = 'fixed_recipe' | 'variable_recipe';

// ============================================
// DATABASE MODELS
// ============================================

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  recipe_type: MenuItemType;
  is_active: boolean;
  category: MenuCategory | null;
  display_order: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MenuIngredient {
  id: string;
  menu_item_id: string;
  inventory_item_id: string;
  quantity: number;
  created_at: string;
  // Joined data
  inventory_item?: {
    id: string;
    name: string;
    unit_of_measurement: string;
    weighted_avg_cost: number;
    total_quantity: number;
  };
}

export interface MenuOptionGroup {
  id: string;
  menu_item_id: string;
  name: string;
  is_required: boolean;
  multiple_selection: boolean;
  display_order: number;
  created_at: string;
  // Related options
  options: MenuOption[];
}

export interface MenuOption {
  id: string;
  option_group_id: string;
  inventory_item_id: string;
  name: string;
  quantity: number;
  additional_price: number;
  display_order: number;
  created_at: string;
  // Joined data
  inventory_item?: {
    id: string;
    name: string;
    unit_of_measurement: string;
    weighted_avg_cost: number;
    total_quantity: number;
  };
}

export interface MenuPackaging {
  id: string;
  menu_item_id: string;
  inventory_item_id: string;
  quantity: number;
  created_at: string;
  // Joined data
  inventory_item?: {
    id: string;
    name: string;
    unit_of_measurement: string;
    weighted_avg_cost: number;
    total_quantity: number;
  };
}

// ============================================
// EXTENDED MODELS (with relations)
// ============================================

export interface MenuItemWithDetails extends MenuItem {
  // Related data
  ingredients: MenuIngredient[];
  option_groups: MenuOptionGroup[];
  packaging: MenuPackaging[];
  // Calculated fields
  estimated_cogs?: number;
  profit_margin?: number;
}

// ============================================
// QUERY & FILTER TYPES
// ============================================

export interface MenuFilters {
  category?: MenuCategory;
  is_active?: boolean;
  recipe_type?: MenuItemType;
  search?: string;
}

// ============================================
// SELECTION TYPES (for POS)
// ============================================

export interface OptionSelection {
  option_group_id: string;
  option_group_name: string;
  selected_options: MenuOption[];
}

export interface MenuItemSelection {
  menu_item: MenuItemWithDetails;
  quantity: number;
  selections: OptionSelection[];
  total_price: number;
  estimated_cogs: number;
}

// ============================================
// CALCULATION TYPES
// ============================================

export interface COGSBreakdown {
  ingredients_cost: number;
  options_cost: number;
  packaging_cost: number;
  total_cogs: number;
}

export interface PriceBreakdown {
  base_price: number;
  additional_options_cost: number;
  total_price: number;
}
