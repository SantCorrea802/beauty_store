import { apiRequest } from "./http";

export type CartItem = {
  itemId: number;
  productId: number;
  variantId: number | null;
  variantNombre: string | null;
  variantColorHex: string | null;
  nombre: string;
  slug: string;
  marca: string | null;
  imagenPrincipalUrl: string | null;
  precioUnitarioSnapshot: number;
  quantity: number;
  subtotal: number;
};


export type Cart = {
  cartId: number | null;
  estado: string;
  items: CartItem[];
  totalItems: number;
  total: number;
  fechaUltimaActualizacion: string | null;
};

export type AddCartItemRequest = {
  productId: number;
  variantId?: number | null;
  quantity: number;
};

export type UpdateCartItemQuantityRequest = {
  quantity: number;
};

export type WhatsAppOrderResponse = {
  message: string;
  whatsappUrl: string;
  totalItems: number;
  total: number;
};

type RawWhatsAppOrderResponse = {
  message: string;
  whatsappUrl?: string;
  whatsappurl?: string;
  totalItems: number;
  total: number;
};

export function getMyCart(): Promise<Cart> {
  return apiRequest<Cart>("/api/me/cart", {
    authenticated: true,
  });
}

export function addCartItem(request: AddCartItemRequest): Promise<Cart> {
  return apiRequest<Cart>("/api/me/cart/items", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify(request),
  });
}

export function updateCartItemQuantity(
  itemId: number,
  request: UpdateCartItemQuantityRequest,
): Promise<Cart> {
  return apiRequest<Cart>(`/api/me/cart/items/${itemId}`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(request),
  });
}

export function removeCartItem(itemId: number): Promise<void> {
  return apiRequest<void>(`/api/me/cart/items/${itemId}`, {
    method: "DELETE",
    authenticated: true,
  });
}

export function clearMyCart(): Promise<void> {
  return apiRequest<void>("/api/me/cart", {
    method: "DELETE",
    authenticated: true,
  });
}

export async function generateWhatsAppOrder(): Promise<WhatsAppOrderResponse> {
  const response = await apiRequest<RawWhatsAppOrderResponse>(
    "/api/me/cart/whatsapp-order",
    {
      method: "POST",
      authenticated: true,
    },
  );

  const whatsappUrl = response.whatsappUrl ?? response.whatsappurl;

  if (!whatsappUrl) {
    throw new Error("El backend no devolvió una URL de WhatsApp.");
  }

  return {
    message: response.message,
    whatsappUrl,
    totalItems: response.totalItems,
    total: response.total,
  };
}