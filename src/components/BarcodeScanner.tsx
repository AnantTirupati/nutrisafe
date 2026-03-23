"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";

export function BarcodeScanner({
  onScan,
  onClose,
}: {
  onScan: (barcode: string) => void;
  onClose: () => void;
}) {
  const scannerRef = useRef<{ clear: () => Promise<void> } | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    if (typeof window === "undefined") return;

    let mounted = true;

    const initScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode");
        if (!mounted) return;

        const scanner = new Html5QrcodeScanner(
          "barcode-scanner-container",
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.33,
          },
          false
        );

        scanner.render(
          (decodedText: string) => {
            onScanRef.current(decodedText);
          },
          () => {}
        );

        scannerRef.current = scanner;
        setStatus("ready");
      } catch (err) {
        if (!mounted) return;
        console.error("Barcode scanner init error:", err);
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Failed to start camera");
      }
    };

    initScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Camera className="h-4 w-4" />
          Point camera at barcode
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          title="Close scanner"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      {status === "loading" && (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-600">
          Starting camera…
        </div>
      )}
      {status === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
          <p className="mt-2 text-xs">Use &quot;Enter barcode&quot; below to type the number instead.</p>
        </div>
      )}
      <div id="barcode-scanner-container" className={status !== "ready" ? "hidden" : ""} />
    </div>
  );
}
