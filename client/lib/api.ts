import { toast } from "sonner";

const API_BASE = "/api";

function getAuthToken(): string | null {
  return localStorage.getItem("token");
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        throw new Error(error.error || `API request failed: ${response.status}`);
      } else {
        // If response is not JSON, try to get text
        const text = await response.text();
        console.error("Error response text:", text);
        throw new Error(
          text || `API request failed: ${response.status} ${response.statusText}`,
        );
      }
    } catch (parseError) {
      if (parseError instanceof Error) {
        throw parseError;
      }
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }
  }
  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    }
  } catch (parseError) {
    console.error("Failed to parse API response:", parseError);
    throw new Error("Failed to parse API response");
  }
}

// ===== USERS =====
export async function fetchUsers() {
  const response = await fetch(`${API_BASE}/users`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function fetchUser(id: string) {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function createUser(user: {
  email: string;
  password: string;
  name: string;
  roleId?: string;
  isActive?: boolean;
}) {
  const payload: any = {
    email: user.email,
    password: user.password,
    name: user.name,
  };

  // Only include optional fields if they're provided
  if (user.roleId) {
    payload.roleId = user.roleId;
  }
  if (user.isActive !== undefined) {
    payload.isActive = user.isActive;
  }

  const response = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function updateUser(
  id: string,
  user: {
    name?: string;
    roleId?: string;
    isActive?: boolean;
  },
) {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(user),
  });
  return handleResponse(response);
}

export async function deleteUser(id: string) {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
}

// ===== ROLES =====
export async function fetchRoles() {
  const response = await fetch(`${API_BASE}/roles`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function fetchRole(id: string) {
  const response = await fetch(`${API_BASE}/roles/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function createRole(role: {
  name: string;
  description: string;
  permissions: {
    [entity: string]: {
      view?: boolean;
      add?: boolean;
      edit?: boolean;
      delete?: boolean;
    };
  };
}) {
  const response = await fetch(`${API_BASE}/roles`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(role),
  });
  return handleResponse(response);
}

export async function updateRole(
  id: string,
  role: {
    name?: string;
    description?: string;
    permissions?: {
      [entity: string]: {
        view?: boolean;
        add?: boolean;
        edit?: boolean;
        delete?: boolean;
      };
    };
  },
) {
  const response = await fetch(`${API_BASE}/roles/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(role),
  });
  return handleResponse(response);
}

export async function deleteRole(id: string) {
  const response = await fetch(`${API_BASE}/roles/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
}

// ===== POS DATA =====
const DATA_BASE = `${API_BASE}/data`;

export async function fetchItems() {
  const response = await fetch(`${DATA_BASE}/items`, {
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
  const response = await fetch(`${DATA_BASE}/items`, {
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
  const response = await fetch(`${DATA_BASE}/items/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(item),
  });
  return handleResponse(response);
}

export async function deleteItem(id: string) {
  const response = await fetch(`${DATA_BASE}/items/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function fetchProducts() {
  const response = await fetch(`${DATA_BASE}/products`, {
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
  const response = await fetch(`${DATA_BASE}/products`, {
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
  const response = await fetch(`${DATA_BASE}/products/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(product),
  });
  return handleResponse(response);
}

export async function deleteProduct(id: string) {
  const response = await fetch(`${DATA_BASE}/products/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function fetchCustomers() {
  const response = await fetch(`${DATA_BASE}/customers`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function fetchCustomer(id: string) {
  const response = await fetch(`${DATA_BASE}/customers/${id}`, {
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
  // Validate required fields
  if (!customer.name || !customer.name.trim()) {
    throw new Error("Customer name is required");
  }
  if (!customer.phone || !customer.phone.trim()) {
    throw new Error("Phone number is required");
  }

  // Build payload with only provided fields
  const payload: any = {
    name: customer.name.trim(),
    phone: customer.phone.trim(),
  };

  // Only include optional fields if they have values
  if (customer.altPhone && customer.altPhone.trim()) {
    payload.altPhone = customer.altPhone.trim();
  }
  if (customer.email && customer.email.trim()) {
    payload.email = customer.email.trim();
  }
  if (customer.organization && customer.organization.trim()) {
    payload.organization = customer.organization.trim();
  }
  if (customer.addresses && customer.addresses.length > 0) {
    payload.addresses = customer.addresses;
  }

  const response = await fetch(`${DATA_BASE}/customers`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
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
  const response = await fetch(`${DATA_BASE}/customers/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(customer),
  });
  return handleResponse(response);
}

export async function deleteCustomer(id: string) {
  const response = await fetch(`${DATA_BASE}/customers/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function fetchSales() {
  const response = await fetch(`${DATA_BASE}/sales`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function fetchSale(id: string) {
  const response = await fetch(`${DATA_BASE}/sales/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function createSale(sale: any) {
  const response = await fetch(`${DATA_BASE}/sales`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(sale),
  });
  return handleResponse(response);
}

export async function updateSale(id: string, sale: any) {
  const response = await fetch(`${DATA_BASE}/sales/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(sale),
  });
  return handleResponse(response);
}

export async function deleteSale(id: string) {
  const response = await fetch(`${DATA_BASE}/sales/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function fetchCreditRecords() {
  const response = await fetch(`${DATA_BASE}/credit-records`, {
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
  const response = await fetch(`${DATA_BASE}/credit-records`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(record),
  });
  return handleResponse(response);
}

export async function fetchDeliveryBoys() {
  const response = await fetch(`${DATA_BASE}/delivery-boys`, {
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
  const response = await fetch(`${DATA_BASE}/delivery-boys`, {
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
  const response = await fetch(`${DATA_BASE}/delivery-boys/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(boy),
  });
  return handleResponse(response);
}

export async function fetchSettings() {
  const response = await fetch(`${DATA_BASE}/settings`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function updateSettings(settings: any) {
  const response = await fetch(`${DATA_BASE}/settings`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(settings),
  });
  return handleResponse(response);
}

// ===== DELIVERY BOY LOGIN =====
export async function verifyDeliveryBoyPin(phone: string, pin: string) {
  const response = await fetch(`${API_BASE}/auth/delivery-boy/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone, pin }),
  });
  return handleResponse(response);
}
