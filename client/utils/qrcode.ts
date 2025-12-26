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
    image: product.image,
    items: product.items,
    timestamp: new Date().toISOString(),
  };
}

export function encodeQRData(data: QRCodeData): string {
  return JSON.stringify(data);
}

export function decodeQRData(encodedData: string): QRCodeData | null {
  try {
    console.log("Attempting to decode QR data:", encodedData.substring(0, 100) + "...");
    const data = JSON.parse(encodedData);
    console.log("Successfully parsed JSON, data type:", data.type);
    if (data.type === "product") {
      console.log("Valid product QR data found");
      return data;
    }
    console.log("Invalid data type, expected 'product' but got:", data.type);
    return null;
  } catch (error) {
    console.error("Error decoding QR data:", error, "Raw data:", encodedData.substring(0, 100) + "...");
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
