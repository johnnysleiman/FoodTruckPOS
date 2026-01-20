// ============================================
// STOCK CALCULATIONS
// Utility functions for stock status and expiry
// ============================================

import { StockStatus } from '../models/inventory.types';
import { STOCK_THRESHOLDS, EXPIRY_WARNINGS } from '../models/inventory.constants';

/**
 * Calculate stock status based on quantity and threshold
 */
export function calculateStockStatus(
  quantity: number,
  threshold: number | null
): StockStatus {
  if (quantity === 0) {
    return StockStatus.OUT_OF_STOCK;
  }

  if (threshold !== null && quantity <= threshold * STOCK_THRESHOLDS.LOW_STOCK_PERCENTAGE) {
    return StockStatus.LOW_STOCK;
  }

  return StockStatus.IN_STOCK;
}

/**
 * Calculate days until expiry from expiry date string
 */
export function calculateDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Get expiry status for UI display
 */
export function getExpiryStatus(
  daysUntilExpiry: number | undefined
): 'critical' | 'warning' | 'info' | 'normal' | null {
  if (daysUntilExpiry === undefined) return null;

  if (daysUntilExpiry < 0) return 'critical';
  if (daysUntilExpiry <= EXPIRY_WARNINGS.CRITICAL) return 'critical';
  if (daysUntilExpiry <= EXPIRY_WARNINGS.WARNING) return 'warning';
  if (daysUntilExpiry <= EXPIRY_WARNINGS.INFO) return 'info';

  return 'normal';
}

/**
 * Calculate percentage of quantity relative to threshold
 */
export function calculateStockPercentage(
  quantity: number,
  threshold: number | null
): number | null {
  if (threshold === null || threshold === 0) return null;

  return (quantity / threshold) * 100;
}

/**
 * Check if item needs reordering
 */
export function needsReorder(quantity: number, threshold: number | null): boolean {
  if (threshold === null) return false;

  return quantity <= threshold;
}
