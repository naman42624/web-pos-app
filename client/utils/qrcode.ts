import { Product, SaleItem } from "@/hooks/usePOS";

export interface QRCodeData {
  type: "product";
  id: string;
  name: string;
  price: number;
  image?: string;
  items: Array<{
    itemId?: string;
    customName?: string;
    customPrice?: number;
    quantity: number;
  }>;
  timestamp: string;
}

export function generateQRCodeData(product: Product): QRCodeData {
  return {
    type: "product",
    id: product.id,
    name: product.name,
    price: product.price,
    // Exclude image from QR code to reduce size and improve readability
    items: product.items,
    timestamp: new Date().toISOString(),
  };
}

export function encodeQRData(data: QRCodeData): string {
  // Only encode the product ID for a simpler, more readable QR code
  // The full product details can be looked up by ID
  return data.id;
}

export function decodeQRData(encodedData: string): QRCodeData | null {
  try {
    // The QR code now just contains the product ID
    // In a real application, you would look up the product details from this ID
    console.log("Decoded product ID from QR:", encodedData);

    // Return a minimal QRCodeData object with just the ID
    // In production, you'd fetch the full product details from your database
    return {
      type: "product",
      id: encodedData,
      name: "Product",
      price: 0,
      items: [],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error decoding QR data:", error);
    return null;
  }
}

export function convertQRDataToSaleItem(data: QRCodeData): SaleItem {
  return {
    id: `qr-${data.id}-${Date.now()}`,
    name: data.name,
    quantity: 1,
    price: data.price,
    image: data.image,
    composition: data.items,
  };
}
