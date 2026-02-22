"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface QrScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

/**
 * QR scanner component that supports:
 * 1. Live webcam scanning (Mac camera / any camera)
 * 2. Image file upload (drag & drop or click to select)
 */
export function QrScanner({ onScan, onError }: QrScannerProps) {
  const [mode, setMode] = useState<"idle" | "camera" | "uploading">("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrCodeRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        // State 2 = SCANNING
        if (state === 2) {
          await html5QrCodeRef.current.stop();
        }
      } catch {
        // ignore errors during cleanup
      }
      html5QrCodeRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setScanSuccess(false);
    setMode("camera");

    // Dynamically import html5-qrcode to avoid SSR issues
    const { Html5Qrcode } = await import("html5-qrcode");

    // Wait for the DOM element to mount
    await new Promise((r) => setTimeout(r, 100));

    if (!scannerRef.current) return;

    const scannerId = "aadhaar-qr-reader";

    // Ensure scanner element exists
    let el = document.getElementById(scannerId);
    if (!el) {
      el = document.createElement("div");
      el.id = scannerId;
      scannerRef.current.appendChild(el);
    }

    const html5QrCode = new Html5Qrcode(scannerId);
    html5QrCodeRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText: string) => {
          setScanSuccess(true);
          onScan(decodedText);
          // Stop after successful scan
          stopCamera();
          setMode("idle");
        },
        () => {
          // Ignore per-frame scan failures (no QR code in view)
        }
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to access camera";
      setCameraError(msg);
      onError?.(msg);
      setMode("idle");
    }
  }, [onScan, onError, stopCamera]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleFileUpload = useCallback(
    async (file: File) => {
      setScanSuccess(false);
      setMode("uploading");
      setCameraError(null);

      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const html5QrCode = new Html5Qrcode(
          "aadhaar-qr-file-scanner",
          /* verbose= */ false
        );

        const result = await html5QrCode.scanFile(file, true);
        setScanSuccess(true);
        onScan(result);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Could not read QR code from image";
        setCameraError(msg);
        onError?.(msg);
      } finally {
        setMode("idle");
      }
    },
    [onScan, onError]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  return (
    <div className="space-y-4">
      {/* Mode selector buttons */}
      {mode === "idle" && !scanSuccess && (
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-2"
            onClick={startCamera}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            Scan with Camera
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload QR Image
          </Button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {/* Hidden element for file scanning */}
      <div id="aadhaar-qr-file-scanner" className="hidden" />

      {/* Camera viewer */}
      {mode === "camera" && (
        <div className="space-y-3">
          <div
            ref={scannerRef}
            className="overflow-hidden rounded-lg border border-border/50"
          />
          <p className="text-center text-xs text-muted-foreground">
            Point your camera at the Aadhaar QR code
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => {
              stopCamera();
              setMode("idle");
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Upload drop zone */}
      {mode === "idle" && !scanSuccess && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="rounded-lg border-2 border-dashed border-border/50 p-6 text-center transition-colors hover:border-primary/30"
        >
          <p className="text-xs text-muted-foreground">
            Or drag &amp; drop your Aadhaar card image / e-Aadhaar screenshot
            here
          </p>
        </div>
      )}

      {/* Uploading state */}
      {mode === "uploading" && (
        <div className="flex items-center justify-center gap-3 p-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Reading QR code from image...
          </p>
        </div>
      )}

      {/* Success indicator */}
      {scanSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/20 p-3">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 text-xs">
            ✓
          </div>
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            QR code scanned successfully
          </p>
        </div>
      )}

      {/* Error message */}
      {cameraError && (
        <div className="rounded-lg bg-destructive/10 p-3">
          <p className="text-xs text-destructive">{cameraError}</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => {
              setCameraError(null);
              setScanSuccess(false);
            }}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
