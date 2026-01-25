// ============================================
// SUPABASE CLIENT
// Shared Supabase client instance
// ============================================

import { createClient } from '@supabase/supabase-js';

// Environment variables - these should be set in .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.error(
    '[Supabase] Missing environment variables! Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify environment settings.'
  );
}

// Create single supabase client instance with robust settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'pos-admin-auth',
  },
  global: {
    headers: {
      'x-client-info': 'pos-admin',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Database types
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          role: 'admin' | 'employee';
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      inventory_items: {
        Row: {
          id: string;
          name: string;
          category: string;
          unit_of_measurement: string;
          total_quantity: number;
          total_value: number;
          weighted_avg_cost: number;
          reorder_threshold: number | null;
          is_expirable: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inventory_items']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['inventory_items']['Insert']>;
      };
      stock_purchases: {
        Row: {
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
        };
        Insert: Omit<Database['public']['Tables']['stock_purchases']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['stock_purchases']['Insert']>;
      };
      menu_items: {
        Row: {
          id: string;
          name: string;
          price: number;
          category: string | null;
          recipe_type: 'fixed_recipe' | 'variable_recipe';
          image_url: string | null;
          is_active: boolean;
          display_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['menu_items']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>;
      };
      menu_ingredients: {
        Row: {
          id: string;
          menu_item_id: string;
          inventory_item_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['menu_ingredients']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['menu_ingredients']['Insert']>;
      };
      menu_option_groups: {
        Row: {
          id: string;
          menu_item_id: string;
          name: string;
          display_order: number;
          is_required: boolean;
          multiple_selection: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['menu_option_groups']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['menu_option_groups']['Insert']>;
      };
      menu_options: {
        Row: {
          id: string;
          option_group_id: string;
          inventory_item_id: string;
          quantity: number;
          additional_price: number;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['menu_options']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['menu_options']['Insert']>;
      };
      menu_packaging: {
        Row: {
          id: string;
          menu_item_id: string;
          inventory_item_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['menu_packaging']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['menu_packaging']['Insert']>;
      };
      sales: {
        Row: {
          id: string;
          menu_item_id: string;
          quantity: number;
          revenue: number;
          cogs: number;
          profit: number;
          channel: string;
          payment_method: string;
          discount_percent: number | null;
          discount_amount: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sales']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sales']['Insert']>;
      };
      sale_ingredients: {
        Row: {
          id: string;
          sale_id: string;
          inventory_item_id: string;
          quantity: number;
          cost: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sale_ingredients']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sale_ingredients']['Insert']>;
      };
      sale_selections: {
        Row: {
          id: string;
          sale_id: string;
          option_group_id: string;
          option_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sale_selections']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sale_selections']['Insert']>;
      };
      owner_initial_balance: {
        Row: {
          id: string;
          amount: number;
          set_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['owner_initial_balance']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['owner_initial_balance']['Insert']>;
      };
      owner_balance_adjustments: {
        Row: {
          id: string;
          amount: number;
          reason: string;
          adjustment_type: 'add' | 'subtract';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['owner_balance_adjustments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['owner_balance_adjustments']['Insert']>;
      };
    };
    Functions: {
      deduct_inventory_fifo: {
        Args: {
          p_item_id: string;
          p_quantity: number;
        };
        Returns: {
          success: boolean;
          total_cost: number;
          deductions: Array<{
            purchase_id: string;
            quantity_deducted: number;
            cost_per_unit: number;
            cost: number;
            purchase_date: string;
            expiry_date: string | null;
          }>;
          error?: string;
        };
      };
      complete_pos_sale_simple: {
        Args: {
          p_menu_item_id: string;
          p_quantity: number;
          p_selections: Array<{
            option_group_id: string;
            option_id: string;
          }>;
          p_payment_method: string;
          p_discount_percent?: number;
        };
        Returns: {
          success: boolean;
          sale_id: string;
          revenue: number;
          cogs: number;
          profit: number;
          error?: string;
        };
      };
      get_dashboard_stats_simple: {
        Args: Record<string, never>;
        Returns: {
          mtd_revenue: number;
          mtd_profit: number;
          mtd_sales_count: number;
          inventory_value: number;
          low_stock_count: number;
          weekly_items_sold: number;
        };
      };
      get_current_owner_balance: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
  };
};
