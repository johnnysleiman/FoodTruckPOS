// ============================================
// ADJUST BALANCE MODAL
// ============================================

import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { balanceService } from '../services/balanceService';

interface AdjustBalanceModalProps {
  onClose: () => void;
  onSuccess: () => void;
  currentBalance: number;
}

export function AdjustBalanceModal({
  onClose,
  onSuccess,
  currentBalance,
}: AdjustBalanceModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountValue = parseFloat(amount);

    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const finalAmount = adjustmentType === 'add' ? amountValue : -amountValue;

      await balanceService.createAdjustment({
        amount: finalAmount,
        description: description.trim(),
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating adjustment:', err);
      setError(err instanceof Error ? err.message : 'Failed to adjust balance');
    } finally {
      setIsLoading(false);
    }
  };

  const newBalance = adjustmentType === 'add'
    ? currentBalance + parseFloat(amount || '0')
    : currentBalance - parseFloat(amount || '0');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Adjust Balance</h2>
            <p className="text-sm text-gray-500">Current: ${currentBalance.toFixed(2)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adjustment Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('add')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                    adjustmentType === 'add'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  <Plus size={18} />
                  <span className="font-medium">Add Money</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('subtract')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                    adjustmentType === 'subtract'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  <Minus size={18} />
                  <span className="font-medium">Remove Money</span>
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-lg"
                placeholder="0.00"
                disabled={isLoading}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g., Cash deposit, Owner withdrawal"
                disabled={isLoading}
                required
              />
            </div>

            {/* New Balance Preview */}
            {amount && !isNaN(parseFloat(amount)) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New Balance:</span>
                  <span
                    className={`text-lg font-bold ${
                      newBalance < 0 ? 'text-red-600' : 'text-gray-900'
                    }`}
                  >
                    ${newBalance.toFixed(2)}
                  </span>
                </div>
                {newBalance < 0 && (
                  <p className="mt-2 text-xs text-red-600">
                    Warning: This will result in a negative balance
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !amount || !description}
              className={`flex-1 px-4 py-3 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                adjustmentType === 'add'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isLoading
                ? 'Processing...'
                : adjustmentType === 'add'
                ? 'Add Money'
                : 'Remove Money'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
