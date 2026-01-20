// ============================================
// OWNER BALANCE TYPES (simplified - no expenses)
// ============================================

export interface OwnerBalance {
  id: string;
  amount: number;  // Column is 'amount' in DB
  set_at: string;
  created_at: string;
}

export interface OwnerBalanceAdjustment {
  id: string;
  amount: number;
  reason: string;  // Column is 'reason' in DB
  adjustment_type: 'add' | 'subtract';  // Required in DB
  created_at: string;
}

export interface BalanceBreakdown {
  initial: number;
  adjustments: number;
  sales: number;
}

export interface CurrentBalanceResponse {
  success: boolean;
  has_initial_balance: boolean;
  balance: number;
  breakdown?: BalanceBreakdown;
}

export interface SetInitialBalanceInput {
  amount: number;
}

export interface CreateAdjustmentInput {
  amount: number;
  description: string;
}
