import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { xhrPutUpload } from "@/lib/xhrPutUpload";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_TIMEOUT = 30000; // 30 seconds hard timeout
const STALL_TIMEOUT = 10000; // abort if no progress for 10s (mobile safety)
const SIGNED_URL_TIMEOUT = 10000; // signed-url request timeout
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];

interface UseReceiptUploadReturn {
  uploadReceipt: (file: File) => Promise<string | null>;
  isUploading: boolean;
  uploadProgress: number;
  uploadedUrl: string | null;
  fileName: string | null;
  uploadError: string | null;
  resetUpload: () => void;
  retryUpload: () => void;
}

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

const withTimeout = async <T,>(
  promise: Promise<T>,
  ms: number,
  message: string
): Promise<T> => {
  let timer: number | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = window.setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    if (timer) window.clearTimeout(timer);
  }
};

export const useReceiptUpload = (): UseReceiptUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const lastFileRef = useRef<File | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const resetUpload = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
    xhrRef.current = null;
    setUploadedUrl(null);
    setFileName(null);
    setUploadProgress(0);
    setUploadError(null);
    setIsUploading(false);
    lastFileRef.current = null;
  }, []);

  const uploadReceipt = useCallback(async (file: File): Promise<string | null> => {
    // Prevent double uploads (cancel previous if any)
    if (isUploading) {
      try {
        xhrRef.current?.abort();
      } catch {
        // ignore
      }
    }

    lastFileRef.current = file;
    
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const errorMsg = "Please upload JPG, PNG, or PDF files only";
      setUploadError(errorMsg);
      toast({ title: "Invalid file type", description: errorMsg, variant: "destructive" });
      return null;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const errorMsg = "Maximum file size is 5MB";
      setUploadError(errorMsg);
      toast({ title: "File too large", description: errorMsg, variant: "destructive" });
      return null;
    }

    setIsUploading(true);
    setUploadedUrl(null);
    setFileName(null);
    setUploadProgress(8); // immediately past “5%” on mobile
    setUploadError(null);

    // Let the UI paint before doing any network work (prevents perceived “freeze”)
    await nextFrame();

    try {
      // Get signed upload URL from edge function
      const { data: signedData, error: signedError } = await withTimeout(
        supabase.functions.invoke("create-signed-upload-url", {
          body: {
            fileName: file.name,
            contentType: file.type,
          },
        }),
        SIGNED_URL_TIMEOUT,
        "Upload URL request timed out. Please retry."
      );

      if (signedError || !signedData?.signedUrl) {
        throw new Error(signedError?.message || "Failed to get upload URL");
      }

      setUploadProgress(15);

      // Upload using XHR PUT with real progress tracking
      await xhrPutUpload({
        url: signedData.signedUrl,
        file,
        contentType: file.type,
        timeoutMs: UPLOAD_TIMEOUT,
        stallTimeoutMs: STALL_TIMEOUT,
        onXhr: (xhr) => {
          xhrRef.current = xhr;
        },
        onProgress: (percent) => {
          // Map 0-100 to 15-99 during transfer (finish sets 100)
          const mapped = 15 + Math.round(percent * 0.84);
          setUploadProgress(Math.min(mapped, 99));
        },
      });

      setUploadProgress(100);
      // Store path (not a public URL) so bucket can be private
      setUploadedUrl(signedData.path);
      setFileName(file.name);
      xhrRef.current = null;

      toast({ title: "Receipt uploaded successfully", description: file.name });
      return signedData.path;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Upload failed. Please try again.";
      setUploadError(errorMsg);
      setUploadProgress(0);
      toast({ title: "Upload failed", description: errorMsg, variant: "destructive" });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [isUploading]);

  const retryUpload = useCallback(() => {
    if (lastFileRef.current) {
      uploadReceipt(lastFileRef.current);
    }
  }, [uploadReceipt]);

  return {
    uploadReceipt,
    isUploading,
    uploadProgress,
    uploadedUrl,
    fileName,
    uploadError,
    resetUpload,
    retryUpload,
  };
};
