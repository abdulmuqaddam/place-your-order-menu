export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  halfPrice?: number;
  kgPrice?: number;
  unit?: string;
  category?: string;
  image?: string;
  available?: boolean;
  isOffer?: boolean;
  isSpecial?: boolean;
  stallId: string;
}

export interface StallData {
  businessName?: string;
  name?: string;
  businessType?: string;
  tableCount?: number;
  ownerUid?: string;
  isOrderingOpen?: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  selectedUnit?: string;
}

export interface Cart {
  [itemId: string]: CartItem;
}

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  unit?: string;
}

export interface Order {
  id?: string;
  stallId: string;
  tableId: string;
  tableNo?: number | string;
  source?: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "completed";
  isPaid: boolean;
  createdAt: unknown;
}

export type OrderStatus = Order["status"];
