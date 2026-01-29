import { useAuth } from "@/hooks/useAuth";
import { useReceiptRecovery } from "@/hooks/useReceiptRecovery";

/**
 * A global provider component that initializes receipt recovery logic.
 * It checks on focus/visibility if there's a stuck "uploading" payment
 * and resumes or retries the upload automatically.
 */
export const ReceiptRecoveryProvider = () => {
  const { user } = useAuth();
  useReceiptRecovery(user?.id);
  return null;
};
