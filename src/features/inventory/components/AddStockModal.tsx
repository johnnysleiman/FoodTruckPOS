// ============================================
// AddStockModal Component
// ============================================

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { InventoryItemWithStatus, AddStockFormData } from '../models/inventory.types';
import { addStock } from '../services/inventoryService';
import { formatQuantity } from '../utils/formatters';

interface AddStockModalProps {
  item: InventoryItemWithStatus | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddStockModal({ item, isOpen, onClose, onSuccess }: AddStockModalProps) {
  const [quantity, setQuantity] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [supplier, setSupplier] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity('');
      setTotalCost('');
      setSupplier('');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setExpiryDate('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!item) return;

    const quantityValue = parseFloat(quantity);
    const totalCostValue = parseFloat(totalCost);

    if (isNaN(quantityValue) || quantityValue <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (isNaN(totalCostValue) || totalCostValue <= 0) {
      toast.error('Total cost must be greater than 0');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData: AddStockFormData = {
        quantity_purchased: quantityValue,
        total_cost: totalCostValue,
        supplier: supplier || undefined,
        purchase_date: purchaseDate,
        expiry_date: expiryDate || undefined,
      };
      await addStock(item.id, formData);
      toast.success('Stock added successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !item) return null;

  const quantityNum = parseFloat(quantity) || 0;
  const totalCostNum = parseFloat(totalCost) || 0;
  const costPerUnit = quantityNum > 0 ? totalCostNum / quantityNum : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add Stock</h2>
              <p className="text-sm text-gray-500 mt-1">{item.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Current Stock Info */}
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <div className="text-sm text-gray-600">
              Current stock: <span className="font-medium text-gray-900">
                {formatQuantity(item.total_quantity, item.unit_of_measurement)}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity ({item.unit_of_measurement})
              </label>
              <input
                type="number"
                step="0.001"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Total Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              {costPerUnit > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Cost per {item.unit_of_measurement}: ${costPerUnit.toFixed(4)}
                </p>
              )}
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier (optional)
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Expiry Date (for expirable items) */}
            {item.is_expirable && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                Add Stock
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
