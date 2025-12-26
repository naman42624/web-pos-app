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
    const data = JSON.parse(encodedData);
    if (data.type === "product") {
      return data;
    }
    return null;
  } catch (error) {
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
