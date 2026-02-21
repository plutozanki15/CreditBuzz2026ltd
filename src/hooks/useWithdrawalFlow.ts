import { useState, useEffect } from "react";

export type WithdrawalFlowStep = 
  | "form" 
  | "processing" 
  | "activation-code" 
  | "activation-form" 
  | "payment-details" 
  | "verifying-payment" 
  | "payment-not-confirmed";

export interface WithdrawalFlowState {
  step: WithdrawalFlowStep;
  withdrawalId?: string;
  formData?: {
    accountNumber: string;
    accountName: string;
    bank: string;
    amount: string;
    zfcCode: string;
  };
  activationFormData?: {
    fullName: string;
    bankName: string;
    accountNumber: string;
    activationCode: string;
  };
  timestamp: number;
}

const WITHDRAWAL_FLOW_KEY = "creditbuzz_withdrawal_flow";
const FLOW_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export const useWithdrawalFlow = () => {
  const [flowState, setFlowState] = useState<WithdrawalFlowState | null>(() => {
    try {
      const raw = localStorage.getItem(WITHDRAWAL_FLOW_KEY);
      if (!raw) return null;
      const parsed: WithdrawalFlowState = JSON.parse(raw);
      // Check if expired
      if (Date.now() - parsed.timestamp > FLOW_EXPIRY_MS) {
        localStorage.removeItem(WITHDRAWAL_FLOW_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const updateFlowState = (updates: Partial<WithdrawalFlowState>) => {
    setFlowState((prev) => {
      const newState: WithdrawalFlowState = {
        step: prev?.step || "form",
        ...prev,
        ...updates,
        timestamp: Date.now(),
      };
      localStorage.setItem(WITHDRAWAL_FLOW_KEY, JSON.stringify(newState));
      return newState;
    });
  };

  const clearFlowState = () => {
    localStorage.removeItem(WITHDRAWAL_FLOW_KEY);
    setFlowState(null);
  };

  const currentStep = flowState?.step || "form";

  return {
    flowState,
    currentStep,
    updateFlowState,
    clearFlowState,
  };
};
