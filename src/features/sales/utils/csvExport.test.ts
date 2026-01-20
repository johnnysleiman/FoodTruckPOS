// ============================================
// CSV EXPORT - UNIT TESTS
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateExportFilename } from './csvExport';

// Note: We test generateExportFilename as it's a pure function
// exportSalesToCSV uses DOM APIs and toast, which requires more complex mocking

describe('generateExportFilename', () => {
  beforeEach(() => {
    // Mock Date to get consistent results
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should generate filename with current date when no date range provided', () => {
    const filename = generateExportFilename();
    expect(filename).toBe('sales-2024-01-15.csv');
  });

  it('should generate filename with date range', () => {
    const filename = generateExportFilename('2024-01-01', '2024-01-15');
    expect(filename).toBe('sales-2024-01-01_to_2024-01-15.csv');
  });

  it('should generate filename with single date when from and to are the same', () => {
    const filename = generateExportFilename('2024-01-10', '2024-01-10');
    expect(filename).toBe('sales-2024-01-10.csv');
  });

  it('should include .csv extension', () => {
    const filename = generateExportFilename();
    expect(filename.endsWith('.csv')).toBe(true);
  });
});
