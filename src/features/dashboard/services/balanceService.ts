// ============================================
// OWNER BALANCE SERVICE (simplified - no expenses)
// ============================================

import { supabase } from '../../../lib/supabase';
import type {
  CurrentBalanceResponse,
  SetInitialBalanceInput,
  CreateAdjustmentInput,
  OwnerBalanceAdjustment,
} from '../models/balance.types';

class BalanceService {
  /**
   * Get current balance
   */
  async getCurrentBalance(): Promise<CurrentBalanceResponse> {
    const { data, error } = await supabase.rpc('get_current_owner_balance');

    if (error) throw error;

    return data as CurrentBalanceResponse;
  }

  /**
   * Set initial balance (first-time setup)
   */
  async setInitialBalance(input: SetInitialBalanceInput): Promise<void> {
    const { error } = await supabase.from('owner_initial_balance').insert({
      amount: input.amount,  // Column is 'amount' not 'initial_amount'
    });

    if (error) throw error;
  }

  /**
   * Create a balance adjustment (add or remove money)
   */
  async createAdjustment(input: CreateAdjustmentInput): Promise<OwnerBalanceAdjustment> {
    // Determine adjustment type based on amount sign
    const adjustmentType = input.amount >= 0 ? 'add' : 'subtract';
    const absoluteAmount = Math.abs(input.amount);

    const { data, error } = await supabase
      .from('owner_balance_adjustments')
      .insert({
        amount: absoluteAmount,
        reason: input.description,  // Column is 'reason' not 'description'
        adjustment_type: adjustmentType,  // Required field
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create adjustment');

    return data;
  }

  /**
   * Get adjustment history
   */
  async getAdjustments(): Promise<OwnerBalanceAdjustment[]> {
    const { data, error } = await supabase
      .from('owner_balance_adjustments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  }
}

export const balanceService = new BalanceService();
