// ============================================
// EditItemModal Component
// ============================================

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { InventoryItemWithStatus, InventoryCategory, UnitOfMeasurement } from '../models/inventory.types';
import { updateInventoryItem, checkItemNameExists } from '../services/inventoryService';
import { CATEGORY_OPTIONS, UNIT_OPTIONS, EXPIRABLE_CATEGORIES } from '../models/inventory.constants';

interface EditItemModalProps {
  isOpen: boolean;
  item: InventoryItemWithStatus | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditItemModal({ isOpen, item, onClose, onSuccess }: EditItemModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('proteins');
  const [unitOfMeasurement, setUnitOfMeasurement] = useState<UnitOfMeasurement>('kg');
  const [reorderThreshold, setReorderThreshold] = useState('');
  const [isExpirable, setIsExpirable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when item changes
  useEffect(() => {
    if (isOpen && item) {
      setName(item.name);
      setCategory(item.category);
      setUnitOfMeasurement(item.unit_of_measurement);
      setReorderThreshold(item.reorder_threshold?.toString() || '');
      setIsExpirable(item.is_expirable);
    }
  }, [isOpen, item]);

  const handleCategoryChange = (newCategory: InventoryCategory) => {
    setCategory(newCategory);
    setIsExpirable(EXPIRABLE_CATEGORIES.includes(newCategory));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!item) return;

    if (!name.trim()) {
      toast.error('Item name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if name already exists (excluding current item)
      if (name.trim() !== item.name) {
        const exists = await checkItemNameExists(name, item.id);
        if (exists) {
          toast.error('An item with this name already exists');
          setIsSubmitting(false);
          return;
        }
      }

      await updateInventoryItem(item.id, {
        name: name.trim(),
        category,
        unit_of_measurement: unitOfMeasurement,
        reorder_threshold: reorderThreshold ? parseFloat(reorderThreshold) : undefined,
        is_expirable: isExpirable,
      });
      toast.success('Item updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update item');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Edit Item</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as InventoryCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {CATEGORY_OPTIONS.filter(opt => !opt.disabled).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit of Measurement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit of Measurement
              </label>
              <select
                value={unitOfMeasurement}
                onChange={(e) => setUnitOfMeasurement(e.target.value as UnitOfMeasurement)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={item.total_quantity > 0}
              >
                {UNIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {item.total_quantity > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Cannot change unit while stock exists
                </p>
              )}
            </div>

            {/* Reorder Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder Threshold ({unitOfMeasurement})
              </label>
              <input
                type="number"
                step="0.001"
                value={reorderThreshold}
                onChange={(e) => setReorderThreshold(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Leave empty for no threshold"
              />
            </div>

            {/* Is Expirable */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit_is_expirable"
                checked={isExpirable}
                onChange={(e) => setIsExpirable(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="edit_is_expirable" className="text-sm text-gray-700 cursor-pointer">
                This item has an expiry date
              </label>
            </div>

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
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
