-- ============================================
-- FIFO DEDUCTION FUNCTION
-- Deducts inventory using First In, First Out
-- ============================================

CREATE OR REPLACE FUNCTION deduct_inventory_fifo(
  p_item_id UUID,
  p_quantity DECIMAL(10,3)
)
RETURNS JSONB AS $$
DECLARE
  v_remaining_needed DECIMAL(10,3);
  v_purchase RECORD;
  v_deduct_qty DECIMAL(10,3);
  v_deductions JSONB := '[]'::JSONB;
  v_total_cost DECIMAL(10,2) := 0;
  v_deduction JSONB;
BEGIN
  -- Initialize remaining quantity needed
  v_remaining_needed := p_quantity;

  -- Check if we have enough stock
  IF (SELECT COALESCE(SUM(quantity_remaining), 0) FROM stock_purchases WHERE inventory_item_id = p_item_id) < p_quantity THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient stock',
      'available', (SELECT COALESCE(SUM(quantity_remaining), 0) FROM stock_purchases WHERE inventory_item_id = p_item_id),
      'requested', p_quantity
    );
  END IF;

  -- Loop through purchases in FIFO order (oldest first)
  FOR v_purchase IN
    SELECT *
    FROM stock_purchases
    WHERE inventory_item_id = p_item_id
      AND quantity_remaining > 0
    ORDER BY purchase_date ASC, created_at ASC
  LOOP
    -- Calculate how much to deduct from this purchase
    IF v_purchase.quantity_remaining >= v_remaining_needed THEN
      v_deduct_qty := v_remaining_needed;
    ELSE
      v_deduct_qty := v_purchase.quantity_remaining;
    END IF;

    -- Update the purchase record
    UPDATE stock_purchases
    SET quantity_remaining = quantity_remaining - v_deduct_qty
    WHERE id = v_purchase.id;

    -- Calculate cost for this deduction
    v_total_cost := v_total_cost + (v_deduct_qty * v_purchase.cost_per_unit);

    -- Record this deduction
    v_deduction := jsonb_build_object(
      'purchase_id', v_purchase.id,
      'quantity_deducted', v_deduct_qty,
      'cost_per_unit', v_purchase.cost_per_unit,
      'cost', v_deduct_qty * v_purchase.cost_per_unit,
      'purchase_date', v_purchase.purchase_date,
      'expiry_date', v_purchase.expiry_date
    );

    v_deductions := v_deductions || jsonb_build_array(v_deduction);

    -- Update remaining needed
    v_remaining_needed := v_remaining_needed - v_deduct_qty;

    -- If we've deducted enough, exit loop
    EXIT WHEN v_remaining_needed <= 0;
  END LOOP;

  -- Update inventory_items totals
  UPDATE inventory_items
  SET
    total_quantity = total_quantity - p_quantity,
    total_value = GREATEST(0, total_value - v_total_cost),
    updated_at = NOW()
  WHERE id = p_item_id;

  -- Return success with deduction details
  RETURN jsonb_build_object(
    'success', true,
    'quantity_deducted', p_quantity,
    'total_cost', ROUND(v_total_cost::NUMERIC, 2),
    'deductions', v_deductions
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONE - FIFO Function Ready
-- ============================================
