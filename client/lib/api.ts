import { toast } from "sonner";

const API_BASE = "/api/data";

function getAuthToken(): string {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  return token;
}

function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  };
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "API request failed");
  }
  return response.json();
}

// Items
export async function fetchItems() {
  const response = await fetch(`${API_BASE}/items`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function createItem(item: {
  name: string;
  price: number;
  stock: number;
  image?: string;
}) {
  const response = await fetch(`${API_BASE}/items`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(item),
  });
  return handleResponse(response);
}

export async function updateItem(
  id: string,
  item: Partial<{
    name: string;
    price: number;
    stock: number;
    image: string;
  }>,
) {
  const response = await fetch(`${API_BASE}/items/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(item),
  });
  return handleResponse(response);
}

export async function deleteItem(id: string) {
  const response = await fetch(`${API_BASE}/items/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
}

// Products
export async function fetchProducts() {
  const response = await fetch(`${API_BASE}/products`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function createProduct(product: {
  name: string;
  price: number;
  stock: number;
  image?: string;
  items?: Array<{
    itemId: string;
    customName?: string;
    customPrice?: number;
    quantity: number;
  }>;
}) {
  const response = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(product),
  });
  return handleResponse(response);
}

export async function updateProduct(
  id: string,
  product: Partial<{
    name: string;
    price: number;
    stock: number;
    image: string;
    items: Array<{
      itemId: string;
      customName?: string;
      customPrice?: number;
      quantity: number;
    }>;
  }>,
) {
  const response = await fetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(product),
  });
  return handleResponse(response);
}

export async function deleteProduct(id: string) {
  const response = await fetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
}

// Customers
export async function fetchCustomers() {
  const response = await fetch(`${API_BASE}/customers`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function fetchCustomer(id: string) {
  const response = await fetch(`${API_BASE}/customers/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function createCustomer(customer: {
  name: string;
  phone: string;
  altPhone?: string;
  email?: string;
  organization?: string;
  addresses?: Array<{
    id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  }>;
  totalCredit?: number;
}) {
  const response = await fetch(`${API_BASE}/customers`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(customer),
  });
  return handleResponse(response);
}

export async function updateCustomer(
  id: string,
  customer: Partial<{
    name: string;
    phone: string;
    altPhone: string;
    email: string;
    organization: string;
    addresses: Array<{
      id: string;
      label: string;
      street: string;
      city: string;
      state: string;
      zip: string;
    }>;
    totalCredit: number;
  }>,
) {
  const response = await fetch(`${API_BASE}/customers/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(customer),
  });
  return handleResponse(response);
}

export async function deleteCustomer(id: string) {
  const response = await fetch(`${API_BASE}/customers/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
}

// Sales
export async function fetchSales() {
  const response = await fetch(`${API_BASE}/sales`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function fetchSale(id: string) {
  const response = await fetch(`${API_BASE}/sales/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function createSale(sale: any) {
  const response = await fetch(`${API_BASE}/sales`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(sale),
  });
  return handleResponse(response);
}

export async function updateSale(id: string, sale: any) {
  const response = await fetch(`${API_BASE}/sales/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(sale),
  });
  return handleResponse(response);
}

export async function deleteSale(id: string) {
  const response = await fetch(`${API_BASE}/sales/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
}

// Credit Records
export async function fetchCreditRecords() {
  const response = await fetch(`${API_BASE}/credit-records`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function createCreditRecord(record: {
  customerId: string;
  amount: number;
  date: string;
  saleId: string;
}) {
  const response = await fetch(`${API_BASE}/credit-records`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(record),
  });
  return handleResponse(response);
}

// Delivery Boys
export async function fetchDeliveryBoys() {
  const response = await fetch(`${API_BASE}/delivery-boys`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function createDeliveryBoy(boy: {
  name: string;
  phone: string;
  pin: string;
  idProofUrl?: string;
  status?: "available" | "busy";
}) {
  const response = await fetch(`${API_BASE}/delivery-boys`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(boy),
  });
  return handleResponse(response);
}

export async function updateDeliveryBoy(
  id: string,
  boy: Partial<{
    name: string;
    phone: string;
    pin: string;
    idProofUrl: string;
    status: "available" | "busy";
  }>,
) {
  const response = await fetch(`${API_BASE}/delivery-boys/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(boy),
  });
  return handleResponse(response);
}

// Settings
export async function fetchSettings() {
  const response = await fetch(`${API_BASE}/settings`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function updateSettings(settings: any) {
  const response = await fetch(`${API_BASE}/settings`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(settings),
  });
  return handleResponse(response);
}
