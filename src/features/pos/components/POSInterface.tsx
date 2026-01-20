// ============================================
// POS INTERFACE
// Main POS terminal component
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, ShoppingCart, Trash2, Loader2, Maximize, Minimize, WifiOff, Wifi, LogOut, Percent } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { usePOSStore } from '../hooks/usePOSStore';
import { usePOSMenuItems } from '../../menu/hooks/useMenu';
import { VariableOptionsModal } from './VariableOptionsModal';
import { useCreateSale } from '../../sales/hooks/useSales';
import { ConfirmModal } from '../../../components/shared';
import type { MenuItemWithDetails, MenuOption } from '../../menu/models/menu.types';

// Fullscreen utilities
const enterFullscreen = () => {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if ((elem as any).webkitRequestFullscreen) {
    (elem as any).webkitRequestFullscreen();
  } else if ((elem as any).msRequestFullscreen) {
    (elem as any).msRequestFullscreen();
  }
};

const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if ((document as any).webkitExitFullscreen) {
    (document as any).webkitExitFullscreen();
  } else if ((document as any).msExitFullscreen) {
    (document as any).msExitFullscreen();
  }
};

const getIsFullscreen = () => {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).msFullscreenElement
  );
};

// Category emoji mapping
const getCategoryEmoji = (category: string | null) => {
  switch (category) {
    case 'main': return '🍽️';
    case 'sides': return '🍟';
    case 'drinks': return '🥤';
    case 'desserts': return '🍰';
    case 'combos': return '🎁';
    default: return '🍽️';
  }
};

export function POSInterface() {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const store = usePOSStore();
  const currentTotal = store.getTotal();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'omt' | 'whish'>('cash');
  const [isFullscreen, setIsFullscreen] = useState(getIsFullscreen());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Discount state
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountInput, setDiscountInput] = useState('');

  // Logout confirmation state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Handle logout button click
  const handleLogoutClick = () => {
    if (store.currentOrder.length > 0) {
      setShowLogoutConfirm(true);
    } else {
      performLogout();
    }
  };

  // Perform actual logout
  const performLogout = async () => {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);
    try {
      // Exit fullscreen first
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      await signOut();
      navigate('/pos/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  // Listen for online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored', { duration: 2000 });
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('No internet connection', { duration: 5000 });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(getIsFullscreen());
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  // Fetch menu items from database
  const { data: menuItems = [], isLoading: menuLoading } = usePOSMenuItems({
    refetchOnWindowFocus: false,
  });

  // Only show full loading spinner on initial load (no cached data yet)
  const showLoadingSpinner = menuLoading && menuItems.length === 0;

  // Variable options modal state
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemWithDetails | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  // Sale mutation
  const createSale = useCreateSale();
  const [isProcessingSale, setIsProcessingSale] = useState(false);

  // Handle menu item click
  const handleMenuItemClick = (item: MenuItemWithDetails) => {
    const isVariableRecipe = item.recipe_type === 'variable_recipe';

    if (isVariableRecipe) {
      // Show options modal for variable recipe items
      setSelectedMenuItem(item);
      setShowOptionsModal(true);
    } else {
      // Add fixed recipe items directly to cart
      store.addItem({
        id: item.id,
        name: item.name,
        price: item.price,
      });
    }
  };

  // Handle variable options confirmation
  const handleOptionsConfirm = (
    selectedOptions: MenuOption[],
    totalPrice: number
  ) => {
    if (selectedMenuItem) {
      // Add to cart with selected options
      store.addItem({
        id: selectedMenuItem.id,
        name: selectedMenuItem.name,
        price: totalPrice,
        // Store option IDs for sale creation
        _selectedOptionIds: selectedOptions.map(opt => opt.id),
        // Store human-readable display text for cart
        _selectedOptionsDisplay: selectedOptions.map(opt => opt.inventory_item?.name || opt.name).join(' + '),
      });

      setShowOptionsModal(false);
      setSelectedMenuItem(null);
    }
  };

  // Calculate grid layout based on item count
  const getGridClass = (itemCount: number) => {
    if (itemCount <= 4) return 'grid-cols-2 grid-rows-2';
    if (itemCount <= 6) return 'grid-cols-3 grid-rows-2';
    if (itemCount <= 8) return 'grid-cols-4 grid-rows-2';
    if (itemCount <= 9) return 'grid-cols-3 grid-rows-3';
    if (itemCount <= 12) return 'grid-cols-4 grid-rows-3';
    return 'grid-cols-4 grid-rows-4';
  };

  // Handle sale completion
  const handleCompleteSale = async () => {
    if (store.currentOrder.length === 0) return;

    setIsProcessingSale(true);

    try {
      // Group items by menu_item_id and aggregate quantities/options
      const itemsMap = new Map<string, { quantity: number; optionIds: string[] }>();

      for (const orderItem of store.currentOrder) {
        const key = orderItem.id;
        const existing = itemsMap.get(key) || { quantity: 0, optionIds: [] };

        existing.quantity += 1;
        if (orderItem._selectedOptionIds) {
          existing.optionIds.push(...orderItem._selectedOptionIds);
        }

        itemsMap.set(key, existing);
      }

      // Process each unique menu item
      let totalRevenue = 0;

      for (const [menuItemId, { quantity, optionIds }] of itemsMap.entries()) {
        const result = await createSale.mutateAsync({
          menu_item_id: menuItemId,
          quantity,
          selected_option_ids: optionIds.length > 0 ? optionIds : null,
          payment_method: paymentMethod,
          channel: 'pos',
          discount_percent: discountPercent || null,
        });

        if (!result.success) {
          throw new Error(result.error || 'Sale failed');
        }

        totalRevenue += result.revenue || 0;
      }

      // Success! Clear cart and reset discount
      store.clearOrder();
      setPaymentMethod('cash');
      setDiscountPercent(null);
      setDiscountInput('');

      toast.success(`Sale completed! Total: $${totalRevenue.toFixed(2)}`, {
        duration: 3000,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Sale failed. Please try again.';
      toast.error(errorMessage, {
        duration: 6000,
      });
      console.error('Sale error:', error);
    } finally {
      setIsProcessingSale(false);
    }
  };

  return (
    <>
      <div className="flex flex-row h-full w-full overflow-hidden">
        {/* Left Side - Menu Items */}
        <div className="flex-1 bg-gray-50 p-3 lg:p-4 overflow-hidden flex flex-col">
          {showLoadingSpinner ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
          ) : menuItems.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>No menu items available</p>
            </div>
          ) : (
            <div className={`grid ${getGridClass(menuItems.length)} gap-3 h-full`}>
              {menuItems.map((item) => {
                const isVariableRecipe = item.recipe_type === 'variable_recipe';

                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item)}
                    className="bg-white hover:bg-blue-50 rounded-xl p-3 transition-all duration-200 hover:shadow-xl border-2 border-gray-200 hover:border-primary flex flex-col justify-between h-full"
                  >
                    <div className="flex-1 bg-white rounded-lg mb-2 flex items-center justify-center overflow-hidden aspect-square">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-contain rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <span className={`text-5xl lg:text-6xl xl:text-7xl ${item.image_url ? 'hidden' : ''}`}>
                        {getCategoryEmoji(item.category)}
                      </span>
                    </div>
                    <div className="text-center flex-shrink-0">
                      <p className="font-bold text-gray-800 text-sm lg:text-base mb-1 line-clamp-2">{item.name}</p>
                      <p className="text-2xl lg:text-3xl font-bold text-primary">${item.price.toFixed(2)}</p>
                      {isVariableRecipe && (
                        <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Customize
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side - Current Order */}
        <div className="w-80 xl:w-96 bg-white flex flex-col border-l-2 border-gray-200 h-full overflow-hidden flex-shrink-0">
          {/* Order Header */}
          <div className="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <h3 className="text-base sm:text-lg font-bold text-gray-800">Current Order</h3>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                  store.currentOrder.length > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white text-gray-500'
                }`}>
                  {store.currentOrder.length} items
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Connection Status */}
                <div className={`p-2 rounded-lg ${isOnline ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                     title={isOnline ? 'Connected' : 'No Internet'}>
                  {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
                </div>
                {/* Fullscreen Toggle */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2.5 rounded-lg bg-primary hover:bg-primary-dark transition-colors text-white shadow-md"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
                </button>
                {/* Logout Button */}
                <button
                  onClick={handleLogoutClick}
                  disabled={isLoggingOut}
                  className="p-2.5 rounded-lg bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 transition-colors text-white shadow-md"
                  title={`End Shift${profile?.email ? ` (${profile.email})` : ''}`}
                >
                  {isLoggingOut ? <Loader2 size={22} className="animate-spin" /> : <LogOut size={22} />}
                </button>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50">
            {store.currentOrder.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingCart size={48} className="sm:w-16 sm:h-16 mb-4" />
                <p className="text-base sm:text-lg font-medium">No items yet</p>
                <p className="text-xs sm:text-sm mt-1">Select items from menu</p>
              </div>
            ) : (
              <div className="space-y-2">
                {store.currentOrder.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{item.name}</p>
                      {item._selectedOptionsDisplay && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{item._selectedOptionsDisplay}</p>
                      )}
                      <p className="text-base sm:text-lg font-bold text-primary mt-1">${item.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => store.removeItem(index)}
                      className="p-1.5 sm:p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group flex-shrink-0"
                    >
                      <Trash2 size={16} className="sm:w-[18px] sm:h-[18px] text-red-500 group-hover:text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Footer */}
          <div className="border-t border-gray-200 p-3 sm:p-4 space-y-2 sm:space-y-3 bg-white">
            {/* Offline Warning */}
            {!isOnline && (
              <div className="bg-red-500 text-white rounded-lg p-3 flex items-center gap-2 animate-pulse">
                <WifiOff size={20} />
                <span className="font-semibold text-sm">No Internet - Cannot Process Sales</span>
              </div>
            )}

            {/* Total with Discount */}
            <div className="bg-gradient-to-r from-primary to-primary-light rounded-lg p-3 sm:p-4 text-white">
              {/* Subtotal (show if discount applied) */}
              {discountPercent && discountPercent > 0 && (
                <div className="flex justify-between items-center text-white/80 text-sm mb-1">
                  <span>Subtotal:</span>
                  <span>${currentTotal.toFixed(2)}</span>
                </div>
              )}

              {/* Discount line (if applied) */}
              {discountPercent && discountPercent > 0 && (
                <div className="flex justify-between items-center text-yellow-200 text-sm mb-1">
                  <span className="flex items-center gap-1">
                    Discount ({discountPercent}%)
                    <button
                      onClick={() => {
                        setDiscountPercent(null);
                        setDiscountInput('');
                      }}
                      className="ml-1 hover:text-white"
                      title="Remove discount"
                    >
                      <X size={14} />
                    </button>
                  </span>
                  <span>-${(currentTotal * discountPercent / 100).toFixed(2)}</span>
                </div>
              )}

              {/* Final Total */}
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base md:text-lg font-medium">Total Due:</span>
                <span className="text-2xl sm:text-3xl font-bold">
                  ${(discountPercent ? currentTotal * (1 - discountPercent / 100) : currentTotal).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Discount Button */}
            <button
              onClick={() => {
                setDiscountInput(discountPercent ? discountPercent.toString() : '');
                setShowDiscountModal(true);
              }}
              disabled={store.currentOrder.length === 0}
              className={`w-full py-2 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                discountPercent && discountPercent > 0
                  ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <Percent size={16} />
              {discountPercent && discountPercent > 0 ? `Discount: ${discountPercent}%` : 'Add Discount'}
            </button>

            {/* Payment Method Selector */}
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase">Payment Method</p>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-2 px-2 sm:px-3 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cash
                </button>
                <button
                  onClick={() => setPaymentMethod('omt')}
                  className={`py-2 px-2 sm:px-3 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                    paymentMethod === 'omt'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  OMT
                </button>
                <button
                  onClick={() => setPaymentMethod('whish')}
                  className={`py-2 px-2 sm:px-3 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                    paymentMethod === 'whish'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Whish
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={() => store.clearOrder()}
                disabled={store.currentOrder.length === 0}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
                Clear
              </button>
              <button
                onClick={handleCompleteSale}
                disabled={store.currentOrder.length === 0 || isProcessingSale || !isOnline}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg font-semibold text-sm sm:text-base hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {!isOnline ? (
                  <>
                    <WifiOff size={18} className="sm:w-5 sm:h-5" />
                    Offline
                  </>
                ) : isProcessingSale ? (
                  <>
                    <Loader2 size={18} className="sm:w-5 sm:h-5 animate-spin" />
                    <span className="hidden sm:inline">Processing...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Check size={18} className="sm:w-5 sm:h-5" />
                    Pay
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Variable Options Modal */}
      <VariableOptionsModal
        isOpen={showOptionsModal}
        menuItem={selectedMenuItem}
        onConfirm={handleOptionsConfirm}
        onClose={() => {
          setShowOptionsModal(false);
          setSelectedMenuItem(null);
        }}
      />

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Apply Discount</h3>
              <button
                onClick={() => setShowDiscountModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={discountInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                      setDiscountInput(val);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = parseFloat(discountInput);
                      if (!isNaN(value) && value >= 0 && value <= 100) {
                        setDiscountPercent(value > 0 ? value : null);
                        setShowDiscountModal(false);
                      } else if (discountInput === '') {
                        setDiscountPercent(null);
                        setShowDiscountModal(false);
                      }
                    }
                  }}
                  placeholder="Enter percentage"
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg text-lg focus:outline-none focus:border-primary"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Enter 0 or leave empty to remove discount</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setDiscountPercent(null);
                  setDiscountInput('');
                  setShowDiscountModal(false);
                }}
                className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  const value = parseFloat(discountInput);
                  if (!isNaN(value) && value >= 0 && value <= 100) {
                    setDiscountPercent(value > 0 ? value : null);
                    setShowDiscountModal(false);
                  } else if (discountInput === '') {
                    setDiscountPercent(null);
                    setShowDiscountModal(false);
                  }
                }}
                className="flex-1 py-2.5 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="End Shift"
        message="You have items in your cart. Are you sure you want to end your shift? All items will be lost."
        confirmLabel="End Shift"
        cancelLabel="Cancel"
        variant="warning"
        onConfirm={performLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
