import { idbDel, idbGet, idbSet } from "@/lib/idbKeyval";

export type StoredReceipt = {
  blob: Blob;
  type: string;
  name: string;
  lastModified: number;
};

const draftKey = (userId: string) => `zenfi_receipt_draft:${userId}`;
const paymentKey = (paymentId: string) => `zenfi_receipt_payment:${paymentId}`;

export const saveReceiptDraft = async (userId: string, file: File) => {
  const payload: StoredReceipt = {
    blob: file,
    type: file.type,
    name: file.name,
    lastModified: file.lastModified,
  };
  await idbSet(draftKey(userId), payload);
};

export const loadReceiptDraft = async (userId: string): Promise<StoredReceipt | null> => {
  return await idbGet<StoredReceipt>(draftKey(userId));
};

export const deleteReceiptDraft = async (userId: string) => {
  await idbDel(draftKey(userId));
};

export const saveReceiptForPayment = async (paymentId: string, file: File) => {
  const payload: StoredReceipt = {
    blob: file,
    type: file.type,
    name: file.name,
    lastModified: file.lastModified,
  };
  await idbSet(paymentKey(paymentId), payload);
};

export const loadReceiptForPayment = async (paymentId: string): Promise<StoredReceipt | null> => {
  return await idbGet<StoredReceipt>(paymentKey(paymentId));
};

export const deleteReceiptForPayment = async (paymentId: string) => {
  await idbDel(paymentKey(paymentId));
};

export const storedReceiptToFile = (stored: StoredReceipt): File => {
  return new File([stored.blob], stored.name || "receipt.jpg", {
    type: stored.type || "image/jpeg",
    lastModified: stored.lastModified || Date.now(),
  });
};
