// ============================================
// POS TYPES
// Type definitions for POS feature
// ============================================

export interface CartItem {
  id: string;
  name: string;
  price: number;
  selectedOptions?: CartOption[];
  // Internal tracking
  _selectedOptionIds?: string[];
  _selectedOptionsDisplay?: string;
}

export interface CartOption {
  id: string;
  name: string;
  price: number;
}

export type PaymentMethod = 'cash' | 'omt' | 'whish';
