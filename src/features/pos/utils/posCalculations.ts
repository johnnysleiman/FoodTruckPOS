// ============================================
// POS CALCULATIONS
// Price and quantity calculations for POS
// ============================================

import type { MenuItemWithDetails, MenuOption } from '../../menu/models/menu.types';

// ============================================
// PRICE CALCULATIONS
// ============================================

/**
 * Calculate dynamic price for menu item with selected options
 */
export function calculateItemPrice(
  menuItem: MenuItemWithDetails,
  selectedOptions?: MenuOption[]
): number {
  let totalPrice = menuItem.price;

  if (selectedOptions && selectedOptions.length > 0) {
    const additionalCost = selectedOptions.reduce(
      (sum, option) => sum + (option.additional_price || 0),
      0
    );
    totalPrice += additionalCost;
  }

  return totalPrice;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
