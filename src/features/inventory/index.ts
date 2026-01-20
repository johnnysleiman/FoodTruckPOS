// ============================================
// Inventory Feature - Public Exports
// ============================================

// Components
export { InventoryPage } from './components/InventoryPage';
export { InventoryTable } from './components/InventoryTable';
export { InventoryFilters } from './components/InventoryFilters';
export { AddStockModal } from './components/AddStockModal';
export { CreateItemModal } from './components/CreateItemModal';

// Hooks
export { useInventory } from './hooks/useInventory';

// Types
export type {
  InventoryItem,
  InventoryItemWithStatus,
  StockPurchase,
  CreateItemFormData,
  AddStockFormData,
  InventoryFilters as InventoryFiltersType,
} from './models/inventory.types';
export { StockStatus } from './models/inventory.types';

// Services
export {
  getInventoryItems,
  createInventoryItem,
  addStock,
  checkItemNameExists,
} from './services/inventoryService';

// Utils
export { formatQuantity, formatCurrency, formatCategory } from './utils/formatters';
export { calculateStockStatus } from './utils/stockCalculations';
