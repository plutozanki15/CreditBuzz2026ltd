import { useState, useEffect } from "react";

export interface Transaction {
  id: string;
  type: "claim" | "withdraw";
  amount: number;
  date: string;
  status: "success" | "pending" | "failed";
}

const STORAGE_KEY = "zenfi_transactions";

export const useTransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  const addTransaction = (type: "claim" | "withdraw", amount: number, status: "success" | "pending" | "failed" = "success") => {
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      amount,
      date: new Date().toISOString(),
      status,
    };

    setTransactions((prev) => {
      const updated = [newTransaction, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    return newTransaction;
  };

  const getTransactions = () => transactions;

  return {
    transactions,
    addTransaction,
    getTransactions,
  };
};
