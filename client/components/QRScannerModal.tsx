import { useState, useRef, useEffect } from "react";
import { X, Camera, AlertCircle } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { decodeQRData, QRCodeData } from "@/utils/qrcode";

interface QRScannerModalProps {
  onScan: (data: QRCodeData) => void;
  onClose: () => void;
}

export function QRScannerModal({ onScan, onClose }: QRScannerModalProps) {
  const [scanMode, setScanMode] = useState<"manual" | "camera">("camera");
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const qrReaderRef = useRef<HTMLDivElement>(null);
  const scanCompleteRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let scannerInitTimer: NodeJS.Timeout;
    let cameraInitTimer: NodeJS.Timeout;

    const setupScanner = async () => {
      if (
        scanMode === "camera" &&
        !scannerActive &&
        qrReaderRef.current &&
        isMounted
      ) {
        await initializeScanner();

        // Set a timeout to check if camera is actually ready
        cameraInitTimer = setTimeout(() => {
          if (isMounted && !isCameraReady) {
            console.warn(
              "Camera initialization timeout - camera may not have started",
            );
          }
        }, 5000);

        // Give scanner a moment to fully initialize before marking as ready
        scannerInitTimer = setTimeout(() => {
          if (isMounted) {
            console.log("Scanner initialization complete");
          }
        }, 1000);
      }
    };

    setupScanner();

    return () => {
      isMounted = false;
      clearTimeout(scannerInitTimer);
      clearTimeout(cameraInitTimer);
      scanCompleteRef.current = false;
      if (scanMode === "camera" && scannerRef.current) {
        try {
          scannerRef.current
            .stop()
            .then(() => {
              console.log("Scanner stopped during cleanup");
            })
            .catch((e) => {
              console.debug("Error during scanner cleanup:", e);
            });
        } catch (e) {
          console.debug("Error during scanner cleanup:", e);
        }
        setScannerActive(false);
      }
    };
  }, [scanMode]);

  const initializeScanner = async () => {
    if (!qrReaderRef.current) return;

    try {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 15,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
          disableFlip: false,
          supportedScanTypes: ["image", "video"],
        },
        false,
      );

      const successCallback = (decodedText: string) => {
        // Prevent multiple triggers
        if (scanCompleteRef.current) {
          console.log("Scan already complete, ignoring additional detection");
          return;
        }

        console.log("QR Code detected:", decodedText);
        try {
          const data = decodeQRData(decodedText);
          console.log("Decoded data:", data);
          if (data && data.type === "product") {
            console.log("Valid product QR detected, calling onScan");
            scanCompleteRef.current = true;

            // Stop scanner before calling onScan
            if (scanner) {
              scanner
                .stop()
                .then(() => {
                  console.log("Scanner stopped successfully");
                  setScannerActive(false);
                  onScan(data);
                })
                .catch((err) => {
                  console.error("Error stopping scanner:", err);
                  setScannerActive(false);
                  onScan(data);
                });
            } else {
              setScannerActive(false);
              onScan(data);
            }
          } else {
            console.warn("Invalid QR code data type:", decodedText);
            setError("Invalid QR code. Please scan a valid product QR code.");
          }
        } catch (err) {
          console.error("Error decoding QR:", err);
          setError("Failed to decode QR code. Please try again.");
        }
      };

      const errorCallback = (errorMessage: string) => {
        // Only log errors that are not "No QR code detected" to avoid spam
        if (!errorMessage.includes("No QR code detected")) {
          console.debug("Scan error:", errorMessage);
        }
      };

      // render() does not return a promise, it sets up the scanner asynchronously
      scanner.render(successCallback, errorCallback);

      scannerRef.current = scanner;
      setScannerActive(true);
      setIsCameraReady(true);
      setError("");
    } catch (err: any) {
      console.error("Scanner initialization error:", err);
      setError(
        `Camera not available: ${err.message || "Please check camera permissions"}`,
      );
      setIsCameraReady(false);
      setScannerActive(false);
    }
  };

  const handleManualInput = () => {
    if (!manualInput.trim()) {
      setError("Please enter or paste QR data");
      return;
    }

    const data = decodeQRData(manualInput);
    if (data && data.type === "product") {
      onScan(data);
    } else {
      setError("Invalid QR data. Please check and try again.");
    }
  };

  const handleSwitchMode = async (mode: "manual" | "camera") => {
    scanCompleteRef.current = false;
    if (scannerRef.current && scanMode === "camera") {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.debug("Scanner stop error:", e);
      }
      setScannerActive(false);
      scannerRef.current = null;
    }
    setError("");
    setIsCameraReady(false);
    setScanMode(mode);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Scan Product QR</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleSwitchMode("manual")}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
              scanMode === "manual"
                ? "bg-blue-600 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => handleSwitchMode("camera")}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
              scanMode === "camera"
                ? "bg-blue-600 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Camera Scan
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Manual Input Mode */}
        {scanMode === "manual" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Paste QR Data
              </label>
              <textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Paste the QR code data here..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
                rows={5}
              />
            </div>
            <button
              onClick={handleManualInput}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Scan QR
            </button>
          </div>
        )}

        {/* Camera Scan Mode */}
        {scanMode === "camera" && (
          <div className="space-y-4">
            {!isCameraReady && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 mb-2">
                  Initializing camera...
                </p>
                <p className="text-xs text-slate-500">
                  Please allow camera access when prompted
                </p>
              </div>
            )}
            <div
              id="qr-reader"
              ref={qrReaderRef}
              className="w-full rounded-lg overflow-hidden"
            />
            {isCameraReady && (
              <p className="text-xs text-slate-500 text-center">
                Point your camera at the product QR code
              </p>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
