// ============================================
// INVENTORY CONSTANTS
// UI labels, validation rules, defaults
// ============================================

import type { InventoryCategory, UnitOfMeasurement } from './inventory.types';

// Category display labels
export const CATEGORY_LABELS: Record<InventoryCategory, string> = {
  raw: 'Proteins & Base',
  toppings: 'Toppings & Produce',
  fillings: 'Sauces & Condiments',
  plates_packaging: 'Packaging',
  utensils: 'Utensils',
};

// Category options for dropdowns
export const CATEGORY_OPTIONS = [
  { label: '━━━ FOOD ━━━', value: '', disabled: true },
  { label: 'Proteins & Base', value: 'raw' as InventoryCategory },
  { label: 'Toppings & Produce', value: 'toppings' as InventoryCategory },
  { label: 'Sauces & Condiments', value: 'fillings' as InventoryCategory },
  { label: '━━━ SUPPLIES ━━━', value: '', disabled: true },
  { label: 'Packaging', value: 'plates_packaging' as InventoryCategory },
  { label: 'Utensils', value: 'utensils' as InventoryCategory },
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
  'raw',
  'toppings',
  'fillings',
];

// Default reorder thresholds by category
export const DEFAULT_REORDER_THRESHOLDS: Record<InventoryCategory, number> = {
  raw: 5,
  toppings: 2,
  fillings: 2,
  plates_packaging: 50,
  utensils: 100,
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
