// ============================================
// VARIABLE OPTIONS MODAL
// Select options for variable recipe items
// ============================================

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { MenuItemWithDetails, MenuOption, MenuOptionGroup } from '../../menu/models/menu.types';
import { calculateItemPrice, formatCurrency } from '../utils/posCalculations';

interface VariableOptionsModalProps {
  isOpen: boolean;
  menuItem: MenuItemWithDetails | null;
  onClose: () => void;
  onConfirm: (selectedOptions: MenuOption[], totalPrice: number) => void;
}

export function VariableOptionsModal({
  isOpen,
  menuItem,
  onClose,
  onConfirm,
}: VariableOptionsModalProps) {
  const [selectedOptionIds, setSelectedOptionIds] = useState<Set<string>>(new Set());
  const [quantity, setQuantity] = useState(1);

  // Reset when modal opens/closes or menu item changes
  useEffect(() => {
    if (isOpen && menuItem) {
      setSelectedOptionIds(new Set());
      setQuantity(1);
    }
  }, [isOpen, menuItem]);

  if (!isOpen || !menuItem) return null;

  const optionGroups = menuItem.option_groups || [];

  // Get all selected options (full objects)
  const selectedOptions = optionGroups.flatMap((group) =>
    (group.options || []).filter((option) => selectedOptionIds.has(option.id))
  );

  // Calculate price
  const unitPrice = calculateItemPrice(menuItem, selectedOptions);
  const totalPrice = unitPrice * quantity;

  // Check if all required groups have selections
  const canConfirm = optionGroups.every((group) => {
    if (!group.is_required) return true;

    const hasSelection = (group.options || []).some((option) =>
      selectedOptionIds.has(option.id)
    );
    return hasSelection;
  });

  // Handle option selection
  const handleOptionToggle = (group: MenuOptionGroup, option: MenuOption) => {
    const newSelected = new Set(selectedOptionIds);

    if (group.multiple_selection) {
      // Checkbox behavior - toggle
      if (newSelected.has(option.id)) {
        newSelected.delete(option.id);
      } else {
        newSelected.add(option.id);
      }
    } else {
      // Radio behavior - clear other options in same group, select this one
      (group.options || []).forEach((opt) => newSelected.delete(opt.id));
      newSelected.add(option.id);
    }

    setSelectedOptionIds(newSelected);
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(selectedOptions, totalPrice);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{menuItem.name}</h2>
            <p className="text-sm text-gray-500 mt-1">Customize your order</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Options */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {optionGroups.map((group) => (
            <div key={group.id} className="space-y-3">
              {/* Group Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {group.name}
                  {group.is_required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </h3>
                <span className="text-xs text-gray-500">
                  {group.multiple_selection ? 'Select multiple' : 'Select one'}
                </span>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-3">
                {(group.options || []).map((option) => {
                  const isSelected = selectedOptionIds.has(option.id);
                  const hasAdditionalPrice = option.additional_price > 0;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleOptionToggle(group, option)}
                      className={`
                        relative p-4 rounded-lg border-2 transition-all text-left
                        ${
                          isSelected
                            ? 'border-primary bg-primary-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }
                      `}
                    >
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}

                      {/* Option Name */}
                      <div className="font-medium text-gray-900 pr-8">
                        {option.inventory_item?.name || option.name}
                      </div>

                      {/* Additional Price */}
                      {hasAdditionalPrice && (
                        <div className="text-sm text-primary font-medium mt-1">
                          +{formatCurrency(option.additional_price)}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-4">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors font-semibold"
              >
                -
              </button>
              <span className="text-lg font-bold text-gray-900 w-12 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors font-semibold"
              >
                +
              </button>
            </div>
          </div>

          {/* Price Display */}
          <div className="flex items-center justify-between py-3 border-t border-gray-200">
            <div>
              <div className="text-sm text-gray-500">Total Price</div>
              {quantity > 1 && (
                <div className="text-xs text-gray-400">
                  {formatCurrency(unitPrice)} x {quantity}
                </div>
              )}
            </div>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(totalPrice)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={`
                flex-1 px-6 py-3 font-semibold rounded-lg transition-colors
                ${
                  canConfirm
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {canConfirm ? 'Add to Cart' : 'Select Required Options'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
