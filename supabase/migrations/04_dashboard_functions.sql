-- ============================================
-- DASHBOARD FUNCTIONS
-- Simplified stats without batch metrics
-- ============================================

-- Get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats_simple()
RETURNS JSONB AS $$
DECLARE
  v_mtd_revenue DECIMAL(10,2);
  v_mtd_profit DECIMAL(10,2);
  v_mtd_sales_count INTEGER;
  v_inventory_value DECIMAL(10,2);
  v_low_stock_count INTEGER;
  v_weekly_items_sold INTEGER;
  v_month_start DATE;
  v_week_start DATE;
BEGIN
  -- Calculate date boundaries
  v_month_start := DATE_TRUNC('month', CURRENT_DATE);
  v_week_start := DATE_TRUNC('week', CURRENT_DATE);

  -- MTD (Month to Date) metrics
  SELECT
    COALESCE(SUM(revenue), 0),
    COALESCE(SUM(profit), 0),
    COUNT(*)
  INTO v_mtd_revenue, v_mtd_profit, v_mtd_sales_count
  FROM sales
  WHERE created_at >= v_month_start;

  -- Inventory value
  SELECT COALESCE(SUM(total_value), 0)
  INTO v_inventory_value
  FROM inventory_items;

  -- Low stock count (items below reorder threshold)
  SELECT COUNT(*)
  INTO v_low_stock_count
  FROM inventory_items
  WHERE reorder_threshold IS NOT NULL
    AND total_quantity <= reorder_threshold;

  -- Weekly items sold
  SELECT COALESCE(SUM(quantity), 0)
  INTO v_weekly_items_sold
  FROM sales
  WHERE created_at >= v_week_start;

  RETURN jsonb_build_object(
    'mtd_revenue', ROUND(v_mtd_revenue::NUMERIC, 2),
    'mtd_profit', ROUND(v_mtd_profit::NUMERIC, 2),
    'mtd_sales_count', v_mtd_sales_count,
    'inventory_value', ROUND(v_inventory_value::NUMERIC, 2),
    'low_stock_count', v_low_stock_count,
    'weekly_items_sold', v_weekly_items_sold
  );
END;
$$ LANGUAGE plpgsql;

-- Get current owner balance
CREATE OR REPLACE FUNCTION get_current_owner_balance()
RETURNS JSONB AS $$
DECLARE
  v_initial DECIMAL(10,2) := 0;
  v_adjustments DECIMAL(10,2) := 0;
  v_sales_revenue DECIMAL(10,2) := 0;
  v_total DECIMAL(10,2);
  v_has_initial BOOLEAN;
BEGIN
  -- Check if initial balance is set
  SELECT amount INTO v_initial
  FROM owner_initial_balance
  LIMIT 1;

  v_has_initial := FOUND;

  IF NOT v_has_initial THEN
    RETURN jsonb_build_object(
      'success', true,
      'has_initial_balance', false,
      'balance', 0,
      'breakdown', jsonb_build_object(
        'initial', 0,
        'adjustments', 0,
        'sales', 0
      )
    );
  END IF;

  -- Get adjustments total (positive for add, negative for subtract)
  SELECT COALESCE(SUM(
    CASE WHEN adjustment_type = 'add' THEN amount ELSE -amount END
  ), 0)
  INTO v_adjustments
  FROM owner_balance_adjustments;

  -- Get sales revenue (only cash and omt add to balance)
  SELECT COALESCE(SUM(revenue), 0)
  INTO v_sales_revenue
  FROM sales
  WHERE payment_method IN ('cash', 'omt');

  -- Calculate total
  v_total := v_initial + v_adjustments + v_sales_revenue;

  RETURN jsonb_build_object(
    'success', true,
    'has_initial_balance', true,
    'balance', ROUND(v_total::NUMERIC, 2),
    'breakdown', jsonb_build_object(
      'initial', ROUND(v_initial::NUMERIC, 2),
      'adjustments', ROUND(v_adjustments::NUMERIC, 2),
      'sales', ROUND(v_sales_revenue::NUMERIC, 2)
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Get revenue data for charts (last 30 days)
CREATE OR REPLACE FUNCTION get_revenue_chart_data(p_days INTEGER DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'date', day::DATE,
      'revenue', COALESCE(daily_revenue, 0),
      'profit', COALESCE(daily_profit, 0)
    )
    ORDER BY day
  )
  INTO v_result
  FROM (
    SELECT
      d.day,
      SUM(s.revenue) as daily_revenue,
      SUM(s.profit) as daily_profit
    FROM generate_series(
      CURRENT_DATE - (p_days - 1),
      CURRENT_DATE,
      '1 day'::interval
    ) AS d(day)
    LEFT JOIN sales s ON DATE(s.created_at) = d.day
    GROUP BY d.day
  ) daily_data;

  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql;

-- Get top products
CREATE OR REPLACE FUNCTION get_top_products(p_limit INTEGER DEFAULT 5)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'menu_item_id', menu_item_id,
      'name', name,
      'quantity_sold', quantity_sold,
      'revenue', revenue
    )
  )
  INTO v_result
  FROM (
    SELECT
      s.menu_item_id,
      mi.name,
      SUM(s.quantity) as quantity_sold,
      SUM(s.revenue) as revenue
    FROM sales s
    JOIN menu_items mi ON mi.id = s.menu_item_id
    WHERE s.created_at >= DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY s.menu_item_id, mi.name
    ORDER BY quantity_sold DESC
    LIMIT p_limit
  ) top;

  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql;

-- Get recent sales
CREATE OR REPLACE FUNCTION get_recent_sales(p_limit INTEGER DEFAULT 10)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', s.id,
      'menu_item_name', mi.name,
      'quantity', s.quantity,
      'revenue', s.revenue,
      'payment_method', s.payment_method,
      'created_at', s.created_at
    )
  )
  INTO v_result
  FROM (
    SELECT * FROM sales ORDER BY created_at DESC LIMIT p_limit
  ) s
  JOIN menu_items mi ON mi.id = s.menu_item_id;

  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONE - Dashboard Functions Ready
-- ============================================
