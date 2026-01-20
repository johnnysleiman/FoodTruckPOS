// ============================================
// SET INITIAL BALANCE MODAL
// ============================================

import { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { balanceService } from '../services/balanceService';

interface SetInitialBalanceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function SetInitialBalanceModal({ onClose, onSuccess }: SetInitialBalanceModalProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountValue = parseFloat(amount);

    if (isNaN(amountValue) || amountValue < 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      await balanceService.setInitialBalance({ amount: amountValue });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error setting initial balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to set initial balance');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Set Initial Balance</h2>
              <p className="text-sm text-gray-500">Enter your starting amount</p>
            </div>
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
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Amount ($)
              </label>
              <div className="relative">
                <DollarSign
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition-colors text-lg"
                  placeholder="0.00"
                  autoFocus
                  disabled={isLoading}
                  required
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                This is your total money on hand right now (cash + digital payments + bank)
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
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
              disabled={isLoading || !amount}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Setting...' : 'Set Balance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
