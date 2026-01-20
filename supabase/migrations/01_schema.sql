-- ============================================
-- POS ADMIN - SUPABASE DATABASE SCHEMA
-- Simplified version without batch system
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER AUTHENTICATION
-- ============================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'employee', -- admin, employee
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. INVENTORY TABLES
-- ============================================

-- Main inventory items
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit_of_measurement TEXT NOT NULL,
  total_quantity DECIMAL(10,3) DEFAULT 0,
  total_value DECIMAL(10,2) DEFAULT 0,
  weighted_avg_cost DECIMAL(10,4) DEFAULT 0,
  reorder_threshold DECIMAL(10,3),
  is_expirable BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock purchases (for FIFO tracking)
CREATE TABLE stock_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_purchased DECIMAL(10,3) NOT NULL,
  quantity_remaining DECIMAL(10,3) NOT NULL,
  cost_per_unit DECIMAL(10,4) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  supplier TEXT,
  purchase_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stock_purchases_item ON stock_purchases(inventory_item_id);
CREATE INDEX idx_stock_purchases_fifo ON stock_purchases(inventory_item_id, purchase_date);

-- ============================================
-- 3. MENU TABLES
-- ============================================

-- Menu items (no batch_preset_id - simplified)
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT, -- For display grouping
  recipe_type TEXT NOT NULL, -- fixed_recipe, variable_recipe
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fixed recipe ingredients
CREATE TABLE menu_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id),
  quantity DECIMAL(10,3) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_ingredients_menu_item ON menu_ingredients(menu_item_id);
CREATE INDEX idx_menu_ingredients_inventory ON menu_ingredients(inventory_item_id);

-- Variable option groups (for customizable items)
CREATE TABLE menu_option_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_option_groups_menu_item ON menu_option_groups(menu_item_id);

-- Variable options (specific choices within groups)
CREATE TABLE menu_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_group_id UUID REFERENCES menu_option_groups(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id),
  name TEXT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  additional_price DECIMAL(10,2) DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_options_group ON menu_options(option_group_id);
CREATE INDEX idx_menu_options_inventory ON menu_options(inventory_item_id);

-- Packaging (auto-deducted per menu item sale)
CREATE TABLE menu_packaging (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id),
  quantity DECIMAL(10,3) DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_packaging_menu_item ON menu_packaging(menu_item_id);

-- ============================================
-- 4. SALES TABLES
-- ============================================

-- Sales records (no batch_id - simplified direct inventory deduction)
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  revenue DECIMAL(10,2) NOT NULL,
  cogs DECIMAL(10,2) NOT NULL,
  profit DECIMAL(10,2) NOT NULL,
  channel TEXT DEFAULT 'pos',
  payment_method TEXT NOT NULL,
  discount_percent DECIMAL(5,2),
  discount_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sales_created ON sales(created_at DESC);
CREATE INDEX idx_sales_menu_item ON sales(menu_item_id);

-- Track ingredients used per sale
CREATE TABLE sale_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id),
  quantity DECIMAL(10,3) NOT NULL,
  cost DECIMAL(10,4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sale_ingredients_sale ON sale_ingredients(sale_id);

-- Track variable selections per sale
CREATE TABLE sale_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  option_group_id UUID REFERENCES menu_option_groups(id),
  option_id UUID REFERENCES menu_options(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sale_selections_sale ON sale_selections(sale_id);

-- ============================================
-- 5. OWNER BALANCE TRACKING
-- ============================================

-- Initial balance (single row)
CREATE TABLE owner_initial_balance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  set_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one row exists
CREATE UNIQUE INDEX owner_initial_balance_singleton ON owner_initial_balance ((true));

-- Balance adjustments
CREATE TABLE owner_balance_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  adjustment_type TEXT NOT NULL, -- 'add' or 'subtract'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_owner_balance_adjustments_created ON owner_balance_adjustments(created_at DESC);

-- ============================================
-- 6. TRIGGERS
-- ============================================

-- Update weighted average cost when stock is purchased
CREATE OR REPLACE FUNCTION update_weighted_avg_cost()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inventory_items
  SET
    total_quantity = total_quantity + NEW.quantity_purchased,
    total_value = total_value + NEW.total_cost,
    weighted_avg_cost = CASE
      WHEN (total_quantity + NEW.quantity_purchased) > 0
      THEN (total_value + NEW.total_cost) / (total_quantity + NEW.quantity_purchased)
      ELSE 0
    END,
    updated_at = NOW()
  WHERE id = NEW.inventory_item_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_stock_purchase
  AFTER INSERT ON stock_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_weighted_avg_cost();

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_packaging ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_initial_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_balance_adjustments ENABLE ROW LEVEL SECURITY;

-- Authenticated users can access all data
CREATE POLICY "Authenticated users full access" ON user_profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON inventory_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON stock_purchases FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON menu_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON menu_ingredients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON menu_option_groups FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON menu_options FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON menu_packaging FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON sales FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON sale_ingredients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON sale_selections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON owner_initial_balance FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON owner_balance_adjustments FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- DONE - Simplified Schema Ready
-- ============================================
