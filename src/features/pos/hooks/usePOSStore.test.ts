// ============================================
// POS STORE - UNIT TESTS
// ============================================

import { describe, it, expect, beforeEach } from 'vitest';
import { usePOSStore } from './usePOSStore';
import type { CartItem } from '../models/pos.types';

// Helper to create cart items
const createCartItem = (id: string, price: number): CartItem => ({
  id,
  name: `Item ${id}`,
  price,
});

describe('usePOSStore', () => {
  // Reset store before each test
  beforeEach(() => {
    usePOSStore.getState().clearOrder();
  });

  describe('addItem', () => {
    it('should add a new item to currentOrder', () => {
      const { addItem } = usePOSStore.getState();

      addItem(createCartItem('1', 10));

      const state = usePOSStore.getState();
      expect(state.currentOrder).toHaveLength(1);
      expect(state.currentOrder[0].name).toBe('Item 1');
      expect(state.currentOrder[0].price).toBe(10);
    });

    it('should add multiple items to currentOrder', () => {
      const { addItem } = usePOSStore.getState();

      addItem(createCartItem('1', 10));
      addItem(createCartItem('2', 15));
      addItem(createCartItem('3', 20));

      const state = usePOSStore.getState();
      expect(state.currentOrder).toHaveLength(3);
    });

    it('should allow duplicate items', () => {
      const { addItem } = usePOSStore.getState();
      const item = createCartItem('1', 10);

      addItem(item);
      addItem(item);

      const state = usePOSStore.getState();
      expect(state.currentOrder).toHaveLength(2);
    });
  });

  describe('removeItem', () => {
    it('should remove item at specified index', () => {
      const { addItem, removeItem } = usePOSStore.getState();

      addItem(createCartItem('1', 10));
      addItem(createCartItem('2', 15));
      addItem(createCartItem('3', 20));

      removeItem(1); // Remove middle item

      const state = usePOSStore.getState();
      expect(state.currentOrder).toHaveLength(2);
      expect(state.currentOrder[0].name).toBe('Item 1');
      expect(state.currentOrder[1].name).toBe('Item 3');
    });

    it('should remove first item', () => {
      const { addItem, removeItem } = usePOSStore.getState();

      addItem(createCartItem('1', 10));
      addItem(createCartItem('2', 15));

      removeItem(0);

      const state = usePOSStore.getState();
      expect(state.currentOrder).toHaveLength(1);
      expect(state.currentOrder[0].name).toBe('Item 2');
    });

    it('should remove last item', () => {
      const { addItem, removeItem } = usePOSStore.getState();

      addItem(createCartItem('1', 10));
      addItem(createCartItem('2', 15));

      removeItem(1);

      const state = usePOSStore.getState();
      expect(state.currentOrder).toHaveLength(1);
      expect(state.currentOrder[0].name).toBe('Item 1');
    });

    it('should handle removing from empty order gracefully', () => {
      const { removeItem } = usePOSStore.getState();

      // Should not throw
      expect(() => removeItem(0)).not.toThrow();

      const state = usePOSStore.getState();
      expect(state.currentOrder).toHaveLength(0);
    });
  });

  describe('clearOrder', () => {
    it('should remove all items from currentOrder', () => {
      const { addItem, clearOrder } = usePOSStore.getState();

      addItem(createCartItem('1', 10));
      addItem(createCartItem('2', 15));
      addItem(createCartItem('3', 20));

      clearOrder();

      const state = usePOSStore.getState();
      expect(state.currentOrder).toHaveLength(0);
    });

    it('should work on already empty order', () => {
      const { clearOrder } = usePOSStore.getState();

      clearOrder();

      const state = usePOSStore.getState();
      expect(state.currentOrder).toHaveLength(0);
    });
  });

  describe('getTotal', () => {
    it('should return 0 for empty order', () => {
      const total = usePOSStore.getState().getTotal();
      expect(total).toBe(0);
    });

    it('should calculate total for single item', () => {
      const { addItem } = usePOSStore.getState();

      addItem(createCartItem('1', 10));

      const total = usePOSStore.getState().getTotal();
      expect(total).toBe(10);
    });

    it('should calculate total for multiple items', () => {
      const { addItem } = usePOSStore.getState();

      addItem(createCartItem('1', 10));
      addItem(createCartItem('2', 15));
      addItem(createCartItem('3', 20));

      const total = usePOSStore.getState().getTotal();
      expect(total).toBe(45); // 10 + 15 + 20
    });

    it('should handle decimal prices', () => {
      const { addItem } = usePOSStore.getState();

      addItem(createCartItem('1', 10.50));
      addItem(createCartItem('2', 5.25));

      const total = usePOSStore.getState().getTotal();
      expect(total).toBeCloseTo(15.75, 2);
    });

    it('should update when items are removed', () => {
      const { addItem, removeItem } = usePOSStore.getState();

      addItem(createCartItem('1', 10));
      addItem(createCartItem('2', 15));

      let total = usePOSStore.getState().getTotal();
      expect(total).toBe(25);

      removeItem(0);

      total = usePOSStore.getState().getTotal();
      expect(total).toBe(15);
    });
  });
});
