import { useRef, useEffect, useState, useMemo } from "react";
import * as QRCode from "qrcode";
import { X, Download, Printer } from "lucide-react";
import { Product } from "@/hooks/usePOS";
import { generateQRCodeData, encodeQRData } from "@/utils/qrcode";

interface QRCodeModalProps {
  product: Product;
  onClose: () => void;
  autoprint?: boolean;
}

export function QRCodeModal({
  product,
  onClose,
  autoprint = false,
}: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrDataUrlRef = useRef<string>("");
  const [, setRerender] = useState(0);

  // Memoize the encoded data based on product identity
  const encodedData = useMemo(() => {
    const qrData = generateQRCodeData(product);
    return encodeQRData(qrData);
  }, [product.id]);

  // Generate QR code on canvas once per product
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Generate QR code to canvas
    QRCode.toCanvas(canvas, encodedData, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.95,
      margin: 1,
      width: 250,
    });

    // Extract data URL without state update
    qrDataUrlRef.current = canvas.toDataURL("image/png");

    // Trigger minimal re-render if needed
    setRerender((prev) => prev + 1);
  }, [encodedData]);

  const handleDownload = () => {
    if (qrDataUrlRef.current) {
      const link = document.createElement("a");
      link.href = qrDataUrlRef.current;
      link.download = `qr-${product.name.replace(/\s+/g, "-")}.png`;
      link.click();
    }
  };

  const handlePrint = () => {
    if (qrDataUrlRef.current) {
      const printWindow = window.open("", "", "height=500,width=500");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print QR Code - ${product.name}</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: flex-start;
                  height: auto;
                  padding: 10px;
                  font-family: Arial, sans-serif;
                  background: white;
                }
                .qr-container {
                  text-align: center;
                  margin: 10px 0;
                  page-break-inside: avoid;
                }
                .qr-container img {
                  max-width: 300px;
                  width: 100%;
                  border: 2px solid #333;
                  padding: 5px;
                }
                .product-info {
                  margin-top: 10px;
                  text-align: center;
                  page-break-inside: avoid;
                }
                .product-info h2 {
                  margin: 5px 0;
                  font-size: 18px;
                }
                .product-info p {
                  margin: 3px 0;
                  font-size: 12px;
                  color: #666;
                }
                @media print {
                  body {
                    padding: 5px;
                    height: auto;
                  }
                  .qr-container {
                    margin: 5px 0;
                  }
                  .product-info {
                    margin-top: 5px;
                  }
                }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <img src="${qrDataUrlRef.current}" alt="QR Code" />
              </div>
              <div class="product-info">
                <h2>${product.name}</h2>
                <p style="font-size: 11px; color: #666; margin-top: 5px;">Code: <strong>${product.id}</strong></p>
                <p style="font-size: 10px; margin-top: 3px;">${new Date().toLocaleDateString("en-IN")}</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
          if (autoprint) {
            printWindow.close();
          }
        }, 250);
      }
    }
  };

  // Auto-print on mount if autoprint prop is true
  useEffect(() => {
    if (autoprint && qrDataUrlRef.current) {
      setTimeout(() => {
        handlePrint();
      }, 500);
    }
  }, [autoprint]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Product QR Code</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Product Info */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <h3 className="font-semibold text-slate-900 mb-2">{product.name}</h3>
          <p className="text-sm text-slate-600">
            Price:{" "}
            <span className="font-semibold text-slate-900">
              ₹{(product.price || 0).toFixed(2)}
            </span>
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Items in composition:{" "}
            <span className="font-semibold text-slate-900">
              {product.items?.length || 0}
            </span>
          </p>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center mb-6 p-4 bg-white border-2 border-slate-200 rounded-lg">
          <canvas ref={canvasRef} className="w-full max-w-xs" />
          <p className="text-xs text-slate-500 mt-3">
            Manual Entry Code:{" "}
            <span className="font-semibold text-slate-700">{product.id}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={!qrDataUrlRef.current}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={handlePrint}
            disabled={!qrDataUrlRef.current}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
