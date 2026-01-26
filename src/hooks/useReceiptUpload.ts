import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_TIMEOUT = 10000; // 10 seconds
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

const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Skip compression for PDFs
    if (file.type === "application/pdf") {
      resolve(file);
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Revoke object URL to free memory
      URL.revokeObjectURL(img.src);
      
      const maxWidth = 1200;
      const maxHeight = 1200;
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          } else {
            reject(new Error("Compression failed"));
          }
        },
        "image/jpeg",
        0.8
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Image load failed"));
    };
    img.src = URL.createObjectURL(file);
  });
};

export const useReceiptUpload = (): UseReceiptUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Store the last file for retry functionality
  const lastFileRef = useRef<File | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const resetUpload = useCallback(() => {
    // Cancel any in-progress upload
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setUploadedUrl(null);
    setFileName(null);
    setUploadProgress(0);
    setUploadError(null);
    lastFileRef.current = null;
  }, []);

  const uploadReceipt = useCallback(async (file: File): Promise<string | null> => {
    // Store file for potential retry
    lastFileRef.current = file;
    
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const errorMsg = "Please upload JPG, PNG, or PDF files only";
      setUploadError(errorMsg);
      toast({
        title: "Invalid file type",
        description: errorMsg,
        variant: "destructive",
      });
      return null;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const errorMsg = "Maximum file size is 5MB";
      setUploadError(errorMsg);
      toast({
        title: "File too large",
        description: errorMsg,
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);
    setUploadProgress(5);
    setUploadError(null);

    // Create abort controller for timeout
    abortControllerRef.current = new AbortController();

    try {
      // Get current user directly (bypass hook state lag on mobile)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Please log in to upload receipts");
      }

      setUploadProgress(15);

      // Compress image if needed (skip for PDFs)
      let fileToUpload = file;
      if (file.type.startsWith("image/") && file.size > 300000) { // Compress if > 300KB
        try {
          setUploadProgress(25);
          fileToUpload = await compressImage(file);
          setUploadProgress(40);
        } catch {
          // Use original file if compression fails
          fileToUpload = file;
          setUploadProgress(40);
        }
      } else {
        setUploadProgress(40);
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const uniqueFileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      setUploadProgress(50);

      // Create upload promise with timeout
      const uploadPromise = supabase.storage
        .from("receipts")
        .upload(uniqueFileName, fileToUpload, {
          cacheControl: "3600",
          upsert: false,
        });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Upload timeout - please try again"));
        }, UPLOAD_TIMEOUT);
      });

      // Race between upload and timeout
      setUploadProgress(60);
      const { error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      setUploadProgress(85);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("receipts")
        .getPublicUrl(uniqueFileName);

      setUploadProgress(100);
      setUploadedUrl(urlData.publicUrl);
      setFileName(file.name);

      toast({
        title: "Receipt uploaded successfully",
        description: file.name,
      });

      return urlData.publicUrl;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Upload failed. Please try again.";
      setUploadError(errorMsg);
      setUploadProgress(0);
      
      toast({
        title: "Upload failed",
        description: errorMsg,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  }, []);

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
