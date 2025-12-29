import { Sale } from "@/hooks/usePOS";
import { Receipt } from "./Receipt";
import { X, Printer, Download } from "lucide-react";
import { useRef } from "react";

interface ReceiptModalProps {
  sale: Sale;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptModal({ sale, isOpen, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!receiptRef.current) return;

    const printWindow = window.open("", "", "height=800,width=600");
    if (!printWindow) {
      alert("Please allow popups to print the receipt");
      return;
    }

    const receiptHTML = receiptRef.current.innerHTML;
    const styles = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Courier New', monospace;
          background: white;
          padding: 20px;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    `;

    printWindow.document.write("<!DOCTYPE html>");
    printWindow.document.write("<html>");
    printWindow.document.write("<head>");
    printWindow.document.write("<title>Receipt</title>");
    printWindow.document.write(styles);
    printWindow.document.write("</head>");
    printWindow.document.write("<body>");
    printWindow.document.write(receiptHTML);
    printWindow.document.write("</body>");
    printWindow.document.write("</html>");
    printWindow.document.close();

    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadPDF = () => {
    // This is a simple implementation that opens print dialog
    // For a more robust solution, you might want to use a library like jsPDF
    handlePrint();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Order Receipt</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6 flex justify-center bg-slate-50">
          <div ref={receiptRef} className="w-full max-w-md">
            <Receipt sale={sale} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
