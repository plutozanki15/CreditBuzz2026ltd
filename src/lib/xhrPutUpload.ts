export type XhrPutUploadOptions = {
  url: string;
  file: File;
  contentType: string;
  /** Hard timeout for the entire request (XHR.timeout) */
  timeoutMs: number;
  /** Abort if no progress event fires for this long */
  stallTimeoutMs: number;
  onProgress?: (percent: number) => void;
  /** Allows caller to keep a ref for abort() */
  onXhr?: (xhr: XMLHttpRequest) => void;
};

export const xhrPutUpload = (opts: XhrPutUploadOptions): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    opts.onXhr?.(xhr);

    let stallTimer: number | null = null;
    const bumpStallTimer = () => {
      if (stallTimer) window.clearTimeout(stallTimer);
      stallTimer = window.setTimeout(() => {
        try {
          xhr.abort();
        } catch {
          // ignore
        }
        reject(new Error("Upload stalled. Please retry."));
      }, opts.stallTimeoutMs);
    };

    const cleanup = () => {
      if (stallTimer) window.clearTimeout(stallTimer);
      stallTimer = null;
    };

    xhr.upload.addEventListener("progress", (event) => {
      bumpStallTimer();
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        opts.onProgress?.(percent);
      }
    });

    xhr.addEventListener("load", () => {
      cleanup();
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      cleanup();
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("timeout", () => {
      cleanup();
      reject(new Error("Upload timed out. Please retry."));
    });

    xhr.timeout = opts.timeoutMs;
    xhr.open("PUT", opts.url);
    xhr.setRequestHeader("Content-Type", opts.contentType);

    // Start stall timer immediately so mobile never sits “stuck”
    bumpStallTimer();
    xhr.send(opts.file);
  });
};
