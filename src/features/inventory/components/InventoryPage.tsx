// ============================================
// InventoryPage Component
// Main container for inventory management
// ============================================

import { useState } from 'react';
import { Plus, Package, AlertCircle, TrendingUp, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useInventory } from '../hooks/useInventory';
import type { InventoryItemWithStatus } from '../models/inventory.types';
import { StockStatus } from '../models/inventory.types';
import { InventoryTable } from './InventoryTable';
import { InventoryFilters } from './InventoryFilters';
import { AddStockModal } from './AddStockModal';
import { CreateItemModal } from './CreateItemModal';
import { EditItemModal } from './EditItemModal';
import { ConfirmModal } from '../../../components/shared';
import { deleteInventoryItem } from '../services/inventoryService';

export function InventoryPage() {
  const { items, loading, error, filters, setFilters, refresh } = useInventory();
  const [selectedItem, setSelectedItem] = useState<InventoryItemWithStatus | null>(null);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculate stats
  const totalItems = items.length;
  const lowStockCount = items.filter(
    (item) => item.stock_status === StockStatus.LOW_STOCK
  ).length;
  const outOfStockCount = items.filter(
    (item) => item.stock_status === StockStatus.OUT_OF_STOCK
  ).length;
  const totalValue = items.reduce((sum, item) => sum + item.total_value, 0);

  const handleAddStock = (item: InventoryItemWithStatus) => {
    setSelectedItem(item);
    setShowAddStockModal(true);
  };

  const handleEdit = (item: InventoryItemWithStatus) => {
    setSelectedItem(item);
    setShowEditItemModal(true);
  };

  const handleDeleteClick = (item: InventoryItemWithStatus) => {
    setSelectedItem(item);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    
    setIsDeleting(true);
    try {
      await deleteInventoryItem(selectedItem.id);
      toast.success('Item deleted successfully');
      refresh();
      setShowDeleteConfirm(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalClose = () => {
    setShowAddStockModal(false);
    setShowCreateItemModal(false);
    setShowEditItemModal(false);
    setShowDeleteConfirm(false);
    setSelectedItem(null);
  };

  const handleSuccess = () => {
    refresh();
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="mt-1 text-gray-600">
              Track and manage your inventory items with FIFO tracking
            </p>
          </div>
          <button
            onClick={() => setShowCreateItemModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            <Plus size={20} />
            Create Item
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">{totalItems}</p>
              </div>
              <div className="p-2 lg:p-3 bg-primary-50 rounded-lg">
                <Package className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">{lowStockCount}</p>
              </div>
              <div className="p-2 lg:p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">{outOfStockCount}</p>
              </div>
              <div className="p-2 lg:p-3 bg-red-50 rounded-lg">
                <XCircle className="h-5 w-5 lg:h-6 lg:w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">
                  ${totalValue.toFixed(2)}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <InventoryFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <InventoryTable
          items={items}
          onAddStock={handleAddStock}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Modals */}
      <AddStockModal
        item={selectedItem}
        isOpen={showAddStockModal}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />

      <CreateItemModal
        isOpen={showCreateItemModal}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />

      <EditItemModal
        item={selectedItem}
        isOpen={showEditItemModal}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Item"
        message={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleModalClose}
      />
    </div>
  );
}
