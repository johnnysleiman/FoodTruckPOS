// ============================================
// CreateItemModal Component
// ============================================

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CreateItemFormData, InventoryCategory, UnitOfMeasurement } from '../models/inventory.types';
import { createInventoryItem, checkItemNameExists } from '../services/inventoryService';
import { CATEGORY_OPTIONS, UNIT_OPTIONS, EXPIRABLE_CATEGORIES, DEFAULT_REORDER_THRESHOLDS } from '../models/inventory.constants';

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateItemModal({ isOpen, onClose, onSuccess }: CreateItemModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('proteins');
  const [unitOfMeasurement, setUnitOfMeasurement] = useState<UnitOfMeasurement>('kg');
  const [reorderThreshold, setReorderThreshold] = useState('');
  const [isExpirable, setIsExpirable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setCategory('proteins');
      setUnitOfMeasurement('kg');
      setReorderThreshold(String(DEFAULT_REORDER_THRESHOLDS['proteins']));
      setIsExpirable(EXPIRABLE_CATEGORIES.includes('proteins'));
    }
  }, [isOpen]);

  // Update defaults when category changes
  const handleCategoryChange = (newCategory: InventoryCategory) => {
    setCategory(newCategory);
    setReorderThreshold(String(DEFAULT_REORDER_THRESHOLDS[newCategory]));
    setIsExpirable(EXPIRABLE_CATEGORIES.includes(newCategory));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Item name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if name already exists
      const exists = await checkItemNameExists(name);
      if (exists) {
        toast.error('An item with this name already exists');
        setIsSubmitting(false);
        return;
      }

      const formData: CreateItemFormData = {
        name: name.trim(),
        category,
        unit_of_measurement: unitOfMeasurement,
        reorder_threshold: reorderThreshold ? parseFloat(reorderThreshold) : undefined,
        is_expirable: isExpirable,
      };
      await createInventoryItem(formData);
      toast.success('Item created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create item');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Item</h2>
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
                placeholder="e.g., All-Purpose Flour"
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
              >
                {UNIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
              <p className="text-xs text-gray-500 mt-1">
                Alert when stock falls below this level
              </p>
            </div>

            {/* Is Expirable */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_expirable"
                checked={isExpirable}
                onChange={(e) => setIsExpirable(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="is_expirable" className="text-sm text-gray-700 cursor-pointer">
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
                Create Item
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
