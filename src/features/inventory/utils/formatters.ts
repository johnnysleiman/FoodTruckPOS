// ============================================
// FORMATTERS
// Utility functions for formatting display values
// ============================================

import type {
  UnitOfMeasurement,
  InventoryCategory,
  StockStatus,
} from '../models/inventory.types';
import {
  UNIT_LABELS,
  UNIT_PLURAL_LABELS,
  CATEGORY_LABELS,
} from '../models/inventory.constants';

/**
 * Format quantity with unit
 */
export function formatQuantity(
  quantity: number,
  unit: UnitOfMeasurement,
  usePlural: boolean = false
): string {
  const formattedQty = formatNumber(quantity);
  const unitLabel = usePlural ? UNIT_PLURAL_LABELS[unit] : UNIT_LABELS[unit];

  return `${formattedQty} ${unitLabel}`;
}

/**
 * Format number with appropriate decimal places
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (Number.isInteger(value)) {
    return value.toString();
  }

  return value.toFixed(decimals);
}

/**
 * Format currency (USD)
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string, includeTime: boolean = false): string {
  const date = new Date(dateString);

  if (includeTime) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Format days until expiry
 */
export function formatDaysUntilExpiry(days: number): string {
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  if (days < 7) return `Expires in ${days} days`;
  if (days < 30) return `Expires in ${Math.floor(days / 7)} weeks`;

  return `Expires in ${Math.floor(days / 30)} months`;
}

/**
 * Format category label
 */
export function formatCategory(category: InventoryCategory): string {
  return CATEGORY_LABELS[category] || category;
}

/**
 * Format stock status for display
 */
export function formatStockStatus(status: StockStatus): string {
  switch (status) {
    case 'in_stock':
      return 'In Stock';
    case 'low_stock':
      return 'Low Stock';
    case 'out_of_stock':
      return 'Out of Stock';
    default:
      return status;
  }
}

/**
 * Get stock status color class
 */
export function getStockStatusColor(status: StockStatus): string {
  switch (status) {
    case 'in_stock':
      return 'text-green-600 bg-green-50';
    case 'low_stock':
      return 'text-yellow-600 bg-yellow-50';
    case 'out_of_stock':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

/**
 * Get expiry status color class
 */
export function getExpiryStatusColor(
  status: 'critical' | 'warning' | 'info' | 'normal' | null
): string {
  switch (status) {
    case 'critical':
      return 'text-red-600 bg-red-50';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50';
    case 'info':
      return 'text-blue-600 bg-blue-50';
    case 'normal':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength - 3) + '...';
}
