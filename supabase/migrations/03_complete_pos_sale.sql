-- ============================================
-- SIMPLIFIED POS SALE COMPLETION FUNCTION
-- Direct inventory deduction (no batch system)
-- ============================================

CREATE OR REPLACE FUNCTION complete_pos_sale_simple(
  p_menu_item_id UUID,
  p_quantity INTEGER,
  p_selections JSONB DEFAULT '[]'::JSONB,
  p_payment_method TEXT DEFAULT 'cash',
  p_discount_percent DECIMAL(5,2) DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
  v_menu_item RECORD;
  v_ingredient RECORD;
  v_option RECORD;
  v_packaging RECORD;
  v_selection JSONB;
  v_deduction_result JSONB;
  v_total_cogs DECIMAL(10,2) := 0;
  v_ingredient_cost DECIMAL(10,2);
  v_sale_id UUID;
  v_unit_price DECIMAL(10,2);
  v_additional_price DECIMAL(10,2) := 0;
  v_revenue DECIMAL(10,2);
  v_discount_amount DECIMAL(10,2);
  v_profit DECIMAL(10,2);
  v_ingredients_deducted JSONB := '[]'::JSONB;
BEGIN
  -- Get menu item details
  SELECT * INTO v_menu_item
  FROM menu_items
  WHERE id = p_menu_item_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Menu item not found or inactive'
    );
  END IF;

  v_unit_price := v_menu_item.price;

  -- Process fixed recipe ingredients
  FOR v_ingredient IN
    SELECT mi.inventory_item_id, mi.quantity, ii.name as item_name
    FROM menu_ingredients mi
    JOIN inventory_items ii ON ii.id = mi.inventory_item_id
    WHERE mi.menu_item_id = p_menu_item_id
  LOOP
    -- Deduct ingredient using FIFO
    v_deduction_result := deduct_inventory_fifo(
      v_ingredient.inventory_item_id,
      v_ingredient.quantity * p_quantity
    );

    IF NOT (v_deduction_result->>'success')::BOOLEAN THEN
      RAISE EXCEPTION 'Insufficient stock for %: %',
        v_ingredient.item_name,
        v_deduction_result->>'error';
    END IF;

    v_ingredient_cost := (v_deduction_result->>'total_cost')::DECIMAL;
    v_total_cogs := v_total_cogs + v_ingredient_cost;

    -- Track ingredient deduction
    v_ingredients_deducted := v_ingredients_deducted || jsonb_build_array(jsonb_build_object(
      'inventory_item_id', v_ingredient.inventory_item_id,
      'quantity', v_ingredient.quantity * p_quantity,
      'cost', v_ingredient_cost
    ));
  END LOOP;

  -- Process variable selections
  FOR v_selection IN SELECT * FROM jsonb_array_elements(p_selections)
  LOOP
    SELECT mo.*, ii.name as item_name
    INTO v_option
    FROM menu_options mo
    JOIN inventory_items ii ON ii.id = mo.inventory_item_id
    WHERE mo.id = (v_selection->>'option_id')::UUID;

    IF FOUND THEN
      -- Deduct option ingredient using FIFO
      v_deduction_result := deduct_inventory_fifo(
        v_option.inventory_item_id,
        v_option.quantity * p_quantity
      );

      IF NOT (v_deduction_result->>'success')::BOOLEAN THEN
        RAISE EXCEPTION 'Insufficient stock for option %: %',
          v_option.item_name,
          v_deduction_result->>'error';
      END IF;

      v_ingredient_cost := (v_deduction_result->>'total_cost')::DECIMAL;
      v_total_cogs := v_total_cogs + v_ingredient_cost;
      v_additional_price := v_additional_price + COALESCE(v_option.additional_price, 0);

      -- Track ingredient deduction
      v_ingredients_deducted := v_ingredients_deducted || jsonb_build_array(jsonb_build_object(
        'inventory_item_id', v_option.inventory_item_id,
        'quantity', v_option.quantity * p_quantity,
        'cost', v_ingredient_cost
      ));
    END IF;
  END LOOP;

  -- Process packaging
  FOR v_packaging IN
    SELECT mp.inventory_item_id, mp.quantity, ii.name as item_name
    FROM menu_packaging mp
    JOIN inventory_items ii ON ii.id = mp.inventory_item_id
    WHERE mp.menu_item_id = p_menu_item_id
  LOOP
    -- Deduct packaging using FIFO
    v_deduction_result := deduct_inventory_fifo(
      v_packaging.inventory_item_id,
      v_packaging.quantity * p_quantity
    );

    IF NOT (v_deduction_result->>'success')::BOOLEAN THEN
      RAISE EXCEPTION 'Insufficient stock for packaging %: %',
        v_packaging.item_name,
        v_deduction_result->>'error';
    END IF;

    v_ingredient_cost := (v_deduction_result->>'total_cost')::DECIMAL;
    v_total_cogs := v_total_cogs + v_ingredient_cost;

    -- Track packaging deduction
    v_ingredients_deducted := v_ingredients_deducted || jsonb_build_array(jsonb_build_object(
      'inventory_item_id', v_packaging.inventory_item_id,
      'quantity', v_packaging.quantity * p_quantity,
      'cost', v_ingredient_cost
    ));
  END LOOP;

  -- Calculate financials
  v_revenue := (v_unit_price + v_additional_price) * p_quantity;
  v_discount_amount := ROUND((v_revenue * COALESCE(p_discount_percent, 0) / 100)::NUMERIC, 2);
  v_revenue := v_revenue - v_discount_amount;
  v_profit := v_revenue - v_total_cogs;

  -- Create sale record
  INSERT INTO sales (
    menu_item_id,
    quantity,
    revenue,
    cogs,
    profit,
    channel,
    payment_method,
    discount_percent,
    discount_amount
  ) VALUES (
    p_menu_item_id,
    p_quantity,
    v_revenue,
    v_total_cogs,
    v_profit,
    'pos',
    p_payment_method,
    p_discount_percent,
    v_discount_amount
  )
  RETURNING id INTO v_sale_id;

  -- Record ingredients used
  INSERT INTO sale_ingredients (sale_id, inventory_item_id, quantity, cost)
  SELECT
    v_sale_id,
    (elem->>'inventory_item_id')::UUID,
    (elem->>'quantity')::DECIMAL,
    (elem->>'cost')::DECIMAL
  FROM jsonb_array_elements(v_ingredients_deducted) AS elem;

  -- Record selections
  IF jsonb_array_length(p_selections) > 0 THEN
    INSERT INTO sale_selections (sale_id, option_group_id, option_id)
    SELECT
      v_sale_id,
      (elem->>'option_group_id')::UUID,
      (elem->>'option_id')::UUID
    FROM jsonb_array_elements(p_selections) AS elem;
  END IF;

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'sale_id', v_sale_id,
    'menu_item', v_menu_item.name,
    'quantity', p_quantity,
    'revenue', v_revenue,
    'cogs', v_total_cogs,
    'profit', v_profit,
    'payment_method', p_payment_method
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONE - Simplified POS Sale Function Ready
-- ============================================
