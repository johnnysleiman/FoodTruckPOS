// ============================================
// STOCK CALCULATIONS - UNIT TESTS
// ============================================

import { describe, it, expect } from 'vitest';
import {
  calculateStockStatus,
  calculateDaysUntilExpiry,
  getExpiryStatus,
  calculateStockPercentage,
  needsReorder,
} from './stockCalculations';
import { StockStatus } from '../models/inventory.types';

describe('calculateStockStatus', () => {
  describe('with reorder threshold', () => {
    it('should return OUT_OF_STOCK when quantity is 0', () => {
      expect(calculateStockStatus(0, 10)).toBe(StockStatus.OUT_OF_STOCK);
    });

    it('should return LOW_STOCK when quantity is at or below 20% of threshold', () => {
      // 20% of 10 is 2, so quantity <= 2 is low stock
      expect(calculateStockStatus(2, 10)).toBe(StockStatus.LOW_STOCK);
      expect(calculateStockStatus(1, 10)).toBe(StockStatus.LOW_STOCK);
    });

    it('should return IN_STOCK when quantity is above 20% of threshold', () => {
      // 20% of 10 is 2, so quantity > 2 is in stock
      expect(calculateStockStatus(3, 10)).toBe(StockStatus.IN_STOCK);
      expect(calculateStockStatus(10, 10)).toBe(StockStatus.IN_STOCK);
    });
  });

  describe('without reorder threshold', () => {
    it('should return OUT_OF_STOCK when quantity is 0', () => {
      expect(calculateStockStatus(0, null)).toBe(StockStatus.OUT_OF_STOCK);
    });

    it('should return IN_STOCK when quantity is greater than 0', () => {
      expect(calculateStockStatus(1, null)).toBe(StockStatus.IN_STOCK);
      expect(calculateStockStatus(100, null)).toBe(StockStatus.IN_STOCK);
    });
  });
});

describe('calculateDaysUntilExpiry', () => {
  it('should return positive days for future dates', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const result = calculateDaysUntilExpiry(futureDate.toISOString().split('T')[0]);
    expect(result).toBe(10);
  });

  it('should return 0 for today', () => {
    const today = new Date().toISOString().split('T')[0];
    const result = calculateDaysUntilExpiry(today);
    expect(result).toBe(0);
  });

  it('should return negative days for past dates', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const result = calculateDaysUntilExpiry(pastDate.toISOString().split('T')[0]);
    expect(result).toBe(-5);
  });
});

describe('getExpiryStatus', () => {
  it('should return null for undefined days', () => {
    expect(getExpiryStatus(undefined)).toBe(null);
  });

  it('should return "critical" for expired items', () => {
    expect(getExpiryStatus(-1)).toBe('critical');
    expect(getExpiryStatus(-10)).toBe('critical');
  });

  it('should return "critical" for items expiring within 3 days', () => {
    expect(getExpiryStatus(0)).toBe('critical');
    expect(getExpiryStatus(3)).toBe('critical');
  });

  it('should return "warning" for items expiring within 7 days', () => {
    expect(getExpiryStatus(4)).toBe('warning');
    expect(getExpiryStatus(7)).toBe('warning');
  });

  it('should return "info" for items expiring within 14 days', () => {
    expect(getExpiryStatus(8)).toBe('info');
    expect(getExpiryStatus(14)).toBe('info');
  });

  it('should return "normal" for items with more than 14 days', () => {
    expect(getExpiryStatus(15)).toBe('normal');
    expect(getExpiryStatus(100)).toBe('normal');
  });
});

describe('calculateStockPercentage', () => {
  it('should return null when threshold is null or 0', () => {
    expect(calculateStockPercentage(10, null)).toBe(null);
    expect(calculateStockPercentage(10, 0)).toBe(null);
  });

  it('should calculate percentage correctly', () => {
    expect(calculateStockPercentage(5, 10)).toBe(50);
    expect(calculateStockPercentage(10, 10)).toBe(100);
    expect(calculateStockPercentage(20, 10)).toBe(200);
  });
});

describe('needsReorder', () => {
  it('should return false when threshold is null', () => {
    expect(needsReorder(0, null)).toBe(false);
    expect(needsReorder(100, null)).toBe(false);
  });

  it('should return true when quantity is at or below threshold', () => {
    expect(needsReorder(5, 10)).toBe(true);
    expect(needsReorder(10, 10)).toBe(true);
  });

  it('should return false when quantity is above threshold', () => {
    expect(needsReorder(15, 10)).toBe(false);
  });
});
