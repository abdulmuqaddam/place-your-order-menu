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
  paymentInfo?: {
    bankName?: string;
    accountTitle?: string;
    accountNo?: string;
  };
  paymentAccounts?: Array<{
    id?: string;
    accountTitle: string;
    accountNo: string;
    note?: string;
    active?: boolean;
    createdAt?: string;
  }>;
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

export interface Deal {
  id: string;
  stallId: string;
  name: string;
  itemNames: string;
  price: number;
  openingTime: string;
  closingTime: string;
  endDate: string;
  endAt?: string;
  image?: string | null;
  active?: boolean;
}
