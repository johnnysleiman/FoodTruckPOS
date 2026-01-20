// ============================================
// POS CALCULATIONS - UNIT TESTS
// ============================================

import { describe, it, expect } from 'vitest';
import { calculateItemPrice, formatCurrency } from './posCalculations';
import type { MenuItemWithDetails, MenuOption } from '../../menu/models/menu.types';

// Helper to create a menu item for testing
const createMenuItem = (price: number): MenuItemWithDetails => ({
  id: '1',
  name: 'Test Item',
  price,
  category: 'main',  // Valid MenuCategory
  recipe_type: 'fixed_recipe',
  image_url: null,
  is_active: true,
  display_order: 0,
  description: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ingredients: [],
  option_groups: [],
  packaging: [],
});

// Helper to create menu options
const createOption = (id: string, additionalPrice: number): MenuOption => ({
  id,
  option_group_id: 'group-1',  // Correct field name
  name: `Option ${id}`,
  additional_price: additionalPrice,
  created_at: new Date().toISOString(),
  inventory_item_id: 'inv-1',  // Required string, not null
  quantity: 1,  // Correct field name
  display_order: 0,
});

describe('calculateItemPrice', () => {
  it('should return base price when no options selected', () => {
    const item = createMenuItem(10);
    expect(calculateItemPrice(item)).toBe(10);
    expect(calculateItemPrice(item, [])).toBe(10);
    expect(calculateItemPrice(item, undefined)).toBe(10);
  });

  it('should add option prices to base price', () => {
    const item = createMenuItem(10);
    const options = [
      createOption('1', 2),
      createOption('2', 3),
    ];
    expect(calculateItemPrice(item, options)).toBe(15); // 10 + 2 + 3
  });

  it('should handle options with zero additional price', () => {
    const item = createMenuItem(10);
    const options = [
      createOption('1', 0),
      createOption('2', 5),
    ];
    expect(calculateItemPrice(item, options)).toBe(15); // 10 + 0 + 5
  });

  it('should handle single option', () => {
    const item = createMenuItem(8.50);
    const options = [createOption('1', 1.50)];
    expect(calculateItemPrice(item, options)).toBe(10); // 8.50 + 1.50
  });

  it('should handle decimal prices', () => {
    const item = createMenuItem(5.99);
    const options = [createOption('1', 0.50)];
    expect(calculateItemPrice(item, options)).toBeCloseTo(6.49, 2);
  });
});

describe('formatCurrency', () => {
  it('should format positive amounts with dollar sign', () => {
    expect(formatCurrency(10)).toBe('$10.00');
    expect(formatCurrency(10.5)).toBe('$10.50');
    expect(formatCurrency(10.99)).toBe('$10.99');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should round to 2 decimal places', () => {
    expect(formatCurrency(10.999)).toBe('$11.00');
    expect(formatCurrency(10.001)).toBe('$10.00');
    expect(formatCurrency(10.126)).toBe('$10.13');
    expect(formatCurrency(10.124)).toBe('$10.12');
  });

  it('should handle negative amounts', () => {
    expect(formatCurrency(-10)).toBe('$-10.00');
  });

  it('should handle large amounts', () => {
    expect(formatCurrency(1000)).toBe('$1000.00');
    expect(formatCurrency(1000000)).toBe('$1000000.00');
  });
});
