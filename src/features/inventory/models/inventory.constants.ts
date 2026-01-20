// ============================================
// INVENTORY CONSTANTS
// UI labels, validation rules, defaults
// ============================================

import type { InventoryCategory, UnitOfMeasurement } from './inventory.types';

// Category display labels
export const CATEGORY_LABELS: Record<InventoryCategory, string> = {
  proteins: 'Proteins',
  sauces: 'Sauces & Condiments',
  produce: 'Produce & Veggies',
  sides: 'Sides',
  bread: 'Bread',
  packaging: 'Packaging & Supplies',
};

// Category options for dropdowns
export const CATEGORY_OPTIONS = [
  { label: '━━━ FOOD ━━━', value: '', disabled: true },
  { label: 'Proteins', value: 'proteins' as InventoryCategory },
  { label: 'Sauces & Condiments', value: 'sauces' as InventoryCategory },
  { label: 'Produce & Veggies', value: 'produce' as InventoryCategory },
  { label: 'Sides', value: 'sides' as InventoryCategory },
  { label: 'Bread', value: 'bread' as InventoryCategory },
  { label: '━━━ SUPPLIES ━━━', value: '', disabled: true },
  { label: 'Packaging & Supplies', value: 'packaging' as InventoryCategory },
];

// Unit display labels
export const UNIT_LABELS: Record<UnitOfMeasurement, string> = {
  kg: 'kg',
  g: 'g',
  L: 'L',
  ml: 'ml',
  pc: 'pc',
  box: 'box',
  bottle: 'bottle',
  pack: 'pack',
  cup: 'cup'
};

// Unit options for dropdowns
export const UNIT_OPTIONS = [
  { label: 'Kilogram (kg)', value: 'kg' as UnitOfMeasurement },
  { label: 'Gram (g)', value: 'g' as UnitOfMeasurement },
  { label: 'Liter (L)', value: 'L' as UnitOfMeasurement },
  { label: 'Milliliter (ml)', value: 'ml' as UnitOfMeasurement },
  { label: 'Piece (pc)', value: 'pc' as UnitOfMeasurement },
  { label: 'Box', value: 'box' as UnitOfMeasurement },
  { label: 'Bottle', value: 'bottle' as UnitOfMeasurement },
  { label: 'Pack', value: 'pack' as UnitOfMeasurement },
  { label: 'Cup', value: 'cup' as UnitOfMeasurement }
];

// Unit plural labels
export const UNIT_PLURAL_LABELS: Record<UnitOfMeasurement, string> = {
  kg: 'kg',
  g: 'g',
  L: 'L',
  ml: 'ml',
  pc: 'pc',
  box: 'box',
  bottle: 'bottle',
  pack: 'pack',
  cup: 'cup'
};

// Categories that are typically expirable
export const EXPIRABLE_CATEGORIES: InventoryCategory[] = [
  'proteins',
  'sauces',
  'produce',
  'sides',
  'bread',
];

// Default reorder thresholds by category
export const DEFAULT_REORDER_THRESHOLDS: Record<InventoryCategory, number> = {
  proteins: 5,
  sauces: 2,
  produce: 2,
  sides: 5,
  bread: 10,
  packaging: 50,
};

// Validation rules
export const VALIDATION_RULES = {
  MIN_QUANTITY: 0.001,
  MAX_QUANTITY: 999999,
  MIN_COST: 0.01,
  MAX_COST: 999999,
  MAX_NAME_LENGTH: 100,
  MAX_SUPPLIER_LENGTH: 100,
};

// Stock status thresholds
export const STOCK_THRESHOLDS = {
  LOW_STOCK_PERCENTAGE: 0.2,
};

// Expiry warning thresholds (days)
export const EXPIRY_WARNINGS = {
  CRITICAL: 3,
  WARNING: 7,
  INFO: 14,
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  DISPLAY_WITH_TIME: 'MMM d, yyyy h:mm a',
  INPUT: 'yyyy-MM-dd',
};

// Default form values
export const DEFAULT_FORM_VALUES = {
  purchase_date: new Date().toISOString().split('T')[0],
  supplier: '',
};
