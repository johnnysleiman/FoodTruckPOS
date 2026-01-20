// ============================================
// INVENTORY FORMATTERS - UNIT TESTS
// ============================================

import { describe, it, expect } from 'vitest';
import {
  formatQuantity,
  formatNumber,
  formatCurrency,
  formatCategory,
  formatStockStatus,
  formatRelativeTime,
  formatDaysUntilExpiry,
  truncateText,
} from './formatters';
import type { InventoryCategory } from '../models/inventory.types';
import { StockStatus } from '../models/inventory.types';

describe('formatQuantity', () => {
  it('should format quantity with unit label', () => {
    expect(formatQuantity(10, 'kg')).toBe('10 kg');
    expect(formatQuantity(10, 'g')).toBe('10 g');
    expect(formatQuantity(10, 'pc')).toBe('10 pc');
  });

  it('should format decimal quantities correctly', () => {
    expect(formatQuantity(10.5, 'kg')).toBe('10.50 kg');
    expect(formatQuantity(10.25, 'L')).toBe('10.25 L');
  });

  it('should handle zero quantity', () => {
    expect(formatQuantity(0, 'kg')).toBe('0 kg');
  });
});

describe('formatNumber', () => {
  it('should format integers without decimals', () => {
    expect(formatNumber(10)).toBe('10');
    expect(formatNumber(100)).toBe('100');
  });

  it('should format decimal numbers with specified decimals', () => {
    expect(formatNumber(10.5)).toBe('10.50');
    expect(formatNumber(10.123, 2)).toBe('10.12');
    expect(formatNumber(10.5, 1)).toBe('10.5');
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

  it('should handle negative amounts', () => {
    expect(formatCurrency(-10)).toBe('-$10.00');
  });

  it('should format large amounts with comma separators', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });
});

describe('formatCategory', () => {
  it('should return category labels', () => {
    expect(formatCategory('proteins')).toBe('Proteins');
    expect(formatCategory('sauces')).toBe('Sauces & Condiments');
    expect(formatCategory('produce')).toBe('Produce & Veggies');
    expect(formatCategory('sides')).toBe('Sides');
    expect(formatCategory('bread')).toBe('Bread');
    expect(formatCategory('packaging')).toBe('Packaging & Supplies');
  });

  it('should fall back to category value for unknown categories', () => {
    expect(formatCategory('unknown' as InventoryCategory)).toBe('unknown');
  });
});

describe('formatStockStatus', () => {
  it('should format stock status labels', () => {
    expect(formatStockStatus(StockStatus.IN_STOCK)).toBe('In Stock');
    expect(formatStockStatus(StockStatus.LOW_STOCK)).toBe('Low Stock');
    expect(formatStockStatus(StockStatus.OUT_OF_STOCK)).toBe('Out of Stock');
  });
});

describe('formatRelativeTime', () => {
  it('should return "Today" for same day', () => {
    const today = new Date().toISOString();
    expect(formatRelativeTime(today)).toBe('Today');
  });

  it('should return "Yesterday" for previous day', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatRelativeTime(yesterday.toISOString())).toBe('Yesterday');
  });

  it('should return "X days ago" for recent dates', () => {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 5);
    expect(formatRelativeTime(daysAgo.toISOString())).toBe('5 days ago');
  });
});

describe('formatDaysUntilExpiry', () => {
  it('should return "Expired" for negative days', () => {
    expect(formatDaysUntilExpiry(-1)).toBe('Expired');
    expect(formatDaysUntilExpiry(-100)).toBe('Expired');
  });

  it('should return "Expires today" for 0 days', () => {
    expect(formatDaysUntilExpiry(0)).toBe('Expires today');
  });

  it('should return "Expires tomorrow" for 1 day', () => {
    expect(formatDaysUntilExpiry(1)).toBe('Expires tomorrow');
  });

  it('should return "Expires in X days" for near future', () => {
    expect(formatDaysUntilExpiry(5)).toBe('Expires in 5 days');
  });
});

describe('truncateText', () => {
  it('should not truncate text shorter than maxLength', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('should truncate text longer than maxLength', () => {
    expect(truncateText('Hello World', 8)).toBe('Hello...');
  });

  it('should handle exact length', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });
});
