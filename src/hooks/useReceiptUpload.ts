import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];

interface UseReceiptUploadReturn {
  uploadReceipt: (file: File) => Promise<string | null>;
  isUploading: boolean;
  uploadProgress: number;
  uploadedUrl: string | null;
  fileName: string | null;
  resetUpload: () => void;
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

    img.onerror = () => reject(new Error("Image load failed"));
    img.src = URL.createObjectURL(file);
  });
};

export const useReceiptUpload = (): UseReceiptUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const resetUpload = useCallback(() => {
    setUploadedUrl(null);
    setFileName(null);
    setUploadProgress(0);
  }, []);

  const uploadReceipt = useCallback(async (file: File): Promise<string | null> => {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload JPG, PNG, or PDF files only",
        variant: "destructive",
      });
      return null;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({
          title: "Not logged in",
          description: "Please log in to upload receipts",
          variant: "destructive",
        });
        return null;
      }

      setUploadProgress(20);

      // Compress image if needed (skip for PDFs)
      let fileToUpload = file;
      if (file.type.startsWith("image/") && file.size > 500000) {
        try {
          fileToUpload = await compressImage(file);
        } catch {
          // Use original file if compression fails
          fileToUpload = file;
        }
      }

      setUploadProgress(40);

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const uniqueFileName = `${user.id}/${Date.now()}.${fileExt}`;

      setUploadProgress(60);

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(uniqueFileName, fileToUpload, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        toast({
          title: "Upload failed",
          description: uploadError.message,
          variant: "destructive",
        });
        return null;
      }

      setUploadProgress(80);

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
      toast({
        title: "Upload failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    uploadReceipt,
    isUploading,
    uploadProgress,
    uploadedUrl,
    fileName,
    resetUpload,
  };
};
