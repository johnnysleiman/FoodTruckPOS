// ============================================
// POS Feature - Public Exports
// ============================================

// Components
export { POSInterface } from './components/POSInterface';
export { VariableOptionsModal } from './components/VariableOptionsModal';

// Hooks
export { usePOSStore } from './hooks/usePOSStore';

// Types
export type { CartItem, CartOption, PaymentMethod } from './models/pos.types';

// Utils
export { calculateItemPrice, formatCurrency } from './utils/posCalculations';
