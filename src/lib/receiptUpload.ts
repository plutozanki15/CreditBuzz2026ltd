import { supabase } from "@/integrations/supabase/client";

const withTimeout = async <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let t: number | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        t = window.setTimeout(() => reject(new Error("timeout")), ms);
      }),
    ]);
  } finally {
    if (t) window.clearTimeout(t);
  }
};

const inferExt = (file: File) => {
  const fromName = file.name?.split(".").pop();
  if (fromName && fromName.length <= 6) return fromName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
};

export const uploadReceiptForPayment = async (params: {
  userId: string;
  paymentId: string;
  file: File;
  timeoutMs?: number;
}) => {
  const { userId, paymentId, file, timeoutMs = 30000 } = params;
  const ext = inferExt(file);
  const fileName = `${userId}/${paymentId}.${ext}`;

  // Ensure DB reflects we're uploading (source of truth)
  await supabase
    .from("payments")
    .update({ receipt_status: "uploading" } as any)
    .eq("id", paymentId);

  try {
    const { error: uploadError } = await withTimeout(
      supabase.storage.from("receipts").upload(fileName, file, { upsert: true }),
      timeoutMs
    );
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from("payments")
      .update({ receipt_url: urlData.publicUrl, receipt_status: "uploaded" } as any)
      .eq("id", paymentId);
    if (updateError) throw updateError;

    return { publicUrl: urlData.publicUrl };
  } catch (e) {
    await supabase
      .from("payments")
      .update({ receipt_status: "failed" } as any)
      .eq("id", paymentId);
    throw e;
  }
};
