"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import type { Cart, Deal, MenuItem, Order, OrderStatus } from "@/types";
import Navbar from "@/components/Navbar";
import MenuCard from "@/components/MenuCard";
import CartDrawer from "@/components/CartDrawer";
import OrderTracker from "@/components/OrderTracker";
import Footer from "@/components/Footer";
import OffersModal from "@/components/OffersModal";

interface Props {
  stallId: string;
  ownerUid: string;
  tableId: string;
  businessName: string;
  businessType: string;
  initialMenu: MenuItem[];
}

export default function MenuClient({
  stallId,
  ownerUid,
  tableId,
  businessName,
  businessType,
  initialMenu,
}: Props) {
  const stallIdCandidates = useMemo(
    () => Array.from(new Set([stallId, ownerUid].filter(Boolean))),
    [stallId, ownerUid]
  );

  const [menu, setMenu] = useState<MenuItem[]>(initialMenu);
  const [menuLoading, setMenuLoading] = useState(initialMenu.length === 0);
  const [cart, setCart] = useState<Cart>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orderData, setOrderData] = useState<any>(null);
  const [orderIsPaid, setOrderIsPaid] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{ bankName?: string; accountTitle?: string; accountNo?: string } | null>(null);
  const [paymentAccounts, setPaymentAccounts] = useState<Array<{ accountTitle: string; accountNo: string; note?: string; active?: boolean }>>([]);
  const [onlinePayment, setOnlinePayment] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUploading, setProofUploading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [specialsModalOpen, setSpecialsModalOpen] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [noDealsAlert, setNoDealsAlert] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(initialMenu.length === 0);
  const [addingTestItems, setAddingTestItems] = useState(false);
  const [isOrderingOpen, setIsOrderingOpen] = useState(true);
  const [showOrderPlacedAlert, setShowOrderPlacedAlert] = useState(false);
  const dealsSectionRef = useRef<HTMLDivElement | null>(null);

  const parseDealExpiryDate = useCallback((deal: Deal) => {
    if (deal.endAt) {
      const fromEndAt = new Date(deal.endAt);
      if (!Number.isNaN(fromEndAt.getTime())) return fromEndAt;
    }

    if (!deal.endDate) return null;

    const isoLike = deal.endDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoLike) {
      const d = new Date(`${deal.endDate}T23:59:59`);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    const legacy = deal.endDate.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (legacy) {
      const d = new Date(Number(legacy[3]), Number(legacy[2]) - 1, Number(legacy[1]), 23, 59, 59, 999);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    const fallback = new Date(deal.endDate);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }, []);

  useEffect(() => {
    if (!ownerUid) return;
    const unsub = onSnapshot(doc(db, "stalls", ownerUid), (snap) => {
      if (!snap.exists()) {
        setIsOrderingOpen(true);
        return;
      }
      const data = snap.data();
      setIsOrderingOpen(data.isOrderingOpen !== false);
      setPaymentInfo(data.paymentInfo || null);

      if (Array.isArray(data.paymentAccounts) && data.paymentAccounts.length > 0) {
        setPaymentAccounts(
          data.paymentAccounts.filter((acc: { active?: boolean }) => acc.active !== false)
        );
      } else if (data.paymentInfo?.accountNo || data.paymentInfo?.accountTitle) {
        setPaymentAccounts([
          {
            accountTitle: data.paymentInfo.accountTitle || "Account",
            accountNo: data.paymentInfo.accountNo || "",
            note: data.paymentInfo.bankName || "",
            active: true,
          },
        ]);
      } else {
        setPaymentAccounts([]);
      }
    });
    return unsub;
  }, [ownerUid]);

  // ── Restore order from localStorage on mount ──────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !ownerUid) return;
    const key = `ov_order_${ownerUid}_${tableId}`;
    const stored = localStorage.getItem(key);
    if (stored) setOrderId(stored);
  }, [ownerUid, tableId]);

  // ── Persist orderId in localStorage ───────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !ownerUid) return;
    const key = `ov_order_${ownerUid}_${tableId}`;
    if (orderId) {
      localStorage.setItem(key, orderId);
    }
  }, [orderId, ownerUid, tableId]);

  // ── Real-time menu listener ─────────────────────────────────────────────────
  useEffect(() => {
    if (stallIdCandidates.length === 0) {
      setMenu([]);
      setMenuLoading(false);
      return;
    }

    const q = stallIdCandidates.length === 1
      ? query(collection(db, "menu"), where("stallId", "==", stallIdCandidates[0]))
      : query(collection(db, "menu"), where("stallId", "in", stallIdCandidates.slice(0, 10)));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as MenuItem))
          .filter((item) => item.available !== false);
        setMenu(items);
        setMenuLoading(false);
      },
      () => {
        setMenuLoading(false);
      }
    );

    return unsubscribe;
  }, [stallIdCandidates]);

  // ── Category list ──────────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = new Set<string>();
    menu.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return ["All", ...Array.from(cats)];
  }, [menu]);

  // ── Filtered menu ──────────────────────────────────────────────────────────
  const filteredMenu = useMemo(() => {
    if (activeCategory === "All") return menu;
    return menu.filter((item) => item.category === activeCategory);
  }, [menu, activeCategory]);

  // ── Offer / Specials items ─────────────────────────────────────────────────
  const specialItems = useMemo(
    () => menu.filter((i) => i.isSpecial === true),
    [menu]
  );

  const dealItemNames = useMemo(() => {
    const names = new Set<string>();
    deals.forEach((deal) => {
      (deal.itemNames || "")
        .split(",")
        .map((name) => name.trim().toLowerCase())
        .filter(Boolean)
        .forEach((name) => names.add(name));
    });
    return names;
  }, [deals]);

  // ── Deals visible to customer (filter expired at render time too) ─────────
  const visibleDeals = useMemo(() => {
    const now = new Date();
    return deals.filter((deal) => {
      const end = parseDealExpiryDate(deal);
      if (end && now > end) return false;
      return true;
    });
  }, [deals, parseDealExpiryDate]);

  // ── Cart helpers ───────────────────────────────────────────────────────────
  const cartCount = useMemo(
    () => Object.values(cart).reduce((acc, c) => acc + c.quantity, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      Object.values(cart).reduce(
        (acc, c) => acc + c.item.price * c.quantity,
        0
      ),
    [cart]
  );

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: {
          item,
          quantity: (existing?.quantity || 0) + 1,
        },
      };
    });
  }, []);

  const updateQty = useCallback((itemId: string, delta: number) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        const nextCart = { ...prev };
        delete nextCart[itemId];
        return nextCart;
      }
      return { ...prev, [itemId]: { ...existing, quantity: newQty } };
    });
  }, []);

  const clearCart = useCallback(() => setCart({}), []);

  // ── Place Order ────────────────────────────────────────────────────────────
  const handlePlaceOrder = useCallback(async () => {
    if (placingOrder || Object.keys(cart).length === 0) return;
    if (!isOrderingOpen) {
      setNoDealsAlert("Online ordering is currently closed. Please try again later.");
      return;
    }
    setPlacingOrder(true);

    const orderItems = Object.values(cart).map((c) => ({
      itemId: c.item.id,
      name: c.item.name,
      price: c.item.price,
      quantity: c.quantity,
      unit: c.item.unit || "piece",
    }));

    try {
      const ref = await addDoc(collection(db, "orders"), {
        stallId: ownerUid,
        tableId,
        tableNo: isNaN(Number(tableId)) ? tableId : Number(tableId),
        items: orderItems,
        totalAmount: cartTotal,
        status: "pending" as OrderStatus,
        isPaid: false,
        source: "web",
        createdAt: serverTimestamp(),
      } satisfies Omit<Order, "id">);

      setOrderId(ref.id);
      setOrderStatus("pending");
      setShowOrderPlacedAlert(true);
      setCartOpen(false);
      clearCart();
    } catch (err) {
      console.error("Order failed:", err);
    } finally {
      setPlacingOrder(false);
    }
  }, [cart, cartTotal, placingOrder, ownerUid, tableId, clearCart, isOrderingOpen]);

  // ── Live Order Listener ────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, "orders", orderId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setOrderStatus(data.status as OrderStatus);
        setOrderData({ id: snap.id, ...data });
        const paid = data.isPaid === true;
        setOrderIsPaid(paid);
        if (paid && typeof window !== "undefined") {
          const key = `ov_order_${ownerUid}_${tableId}`;
          localStorage.removeItem(key);
        }
      }
    });
    return unsub;
  }, [orderId, ownerUid, tableId]);

  useEffect(() => {
    if (!ownerUid) return;

    const q = query(collection(db, "deals"), where("stallId", "==", ownerUid));
    const unsub = onSnapshot(q, (snapshot) => {
      const now = new Date();

      const activeDeals = snapshot.docs
        .map((snap) => ({ id: snap.id, ...snap.data() } as Deal))
        .filter((deal) => {
          if (deal.active === false) return false;

          const end = parseDealExpiryDate(deal);
          if (end && now > end) return false;
          return true;
        });

      setDeals(activeDeals);
    });

    return unsub;
  }, [ownerUid, parseDealExpiryDate]);

  // ── Navbar handler ─────────────────────────────────────────────────────────
  const handleNavAction = (type: "offers" | "specials") => {
    if (type === "offers") {
      if (visibleDeals.length === 0) {
        setNoDealsAlert("No live deals right now. Please check again later.");
        return;
      }
      dealsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (specialItems.length === 0) {
      const msg =
        "No special items available right now. Check back soon!";
      setNoDealsAlert(msg);
      return;
    }
    setSpecialsModalOpen(true);
  };

  // ── Submit payment proof ───────────────────────────────────────────────────
  const submitPaymentProof = useCallback(async () => {
    if (!proofFile || !orderId) return;
    setProofUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", proofFile);
      formData.append("upload_preset", "Tea Stall");
      formData.append("folder", "payment_proofs");
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dcds137tp/image/upload",
        { method: "POST", body: formData }
      );
      const cloudData = await res.json();
      if (!cloudData.secure_url) throw new Error("Upload failed");
      await updateDoc(doc(db, "orders", orderId), {
        paymentProofUrl: cloudData.secure_url,
        paymentMethod: "online",
        paymentStatus: "pending_approval",
      });
      setProofFile(null);
    } catch {
      // silently ignore – user can retry
    } finally {
      setProofUploading(false);
    }
  }, [proofFile, orderId]);

  // ── Add test items handler ───────────────────────────────────────────────────
  const handleAddTestItems = async () => {
    setAddingTestItems(true);
    try {
      const testItems = [
        { name: "Chai", category: "Drinks", price: 50, unit: "cup" },
        { name: "Anda Roti", category: "Fast Food", price: 100, unit: "piece" },
        { name: "Samosa", category: "Fast Food", price: 30, unit: "piece" },
        { name: "Biryani", category: "Desi", price: 250, unit: "plate" },
        { name: "Lassi", category: "Drinks", price: 80, unit: "glass" },
      ];

      const menuRef = collection(db, "menu");
      for (const item of testItems) {
        await addDoc(menuRef, {
          ...item,
          stallId,
          available: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      console.log(`✅ Added ${testItems.length} test items for stall ${stallId}`);
      // UI will refresh automatically via initialMenu
    } catch (error) {
      console.error("Error adding test items:", error);
    } finally {
      setAddingTestItems(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFF6FF] flex flex-col">
      <Navbar
        stallId={stallId}
        tableId={tableId}
        businessName={businessName}
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        onOffersClick={() => handleNavAction("offers")}
        onSpecialsClick={() => handleNavAction("specials")}
      />

      {/* ── Hero banner ── */}
      <div className="relative bg-gradient-to-b from-white to-[#EFF6FF] pt-20 pb-6 px-4 text-center overflow-hidden border-b border-blue-100">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#E4A11B] opacity-[0.06] blur-[80px] rounded-full" />
        </div>
        <p className="text-[#E4A11B] text-sm mt-2 relative z-10 font-semibold tracking-wide">
          📍 Table No: {tableId}
        </p>
      </div>

      {/* ── Order success toast ── */}
      {!isOrderingOpen && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 font-semibold text-sm">Online ordering is currently closed.</p>
          <p className="text-red-500 text-xs mt-1">Please check back later when the restaurant opens orders.</p>
        </div>
      )}

      {showOrderPlacedAlert && orderId && (
        <div className="fixed top-16 left-0 right-0 z-[70] px-4 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto bg-white border border-green-200 rounded-2xl shadow-[0_16px_40px_rgba(16,185,129,0.25)] overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
              <p className="text-green-700 font-bold text-sm">Order Confirmed</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-slate-700 text-sm">Your order was placed successfully.</p>
              <p className="text-slate-500 text-xs mt-1">Order ID: {orderId.slice(0, 8)}...</p>
              <button
                onClick={() => {
                  setShowOrderPlacedAlert(false);
                }}
                className="mt-3 w-full py-2.5 rounded-xl bg-[#E4A11B] text-black text-sm font-semibold"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Live Order Tracker ── */}
      {orderId && orderStatus && (
        <div className="mx-4 mt-3">
          <OrderTracker status={orderStatus} />
        </div>
      )}

      {/* ── Persistent Bill Summary ── */}
      {orderId && !orderIsPaid && orderData && (
        <div className="mx-4 mt-3 bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-blue-50 flex items-center justify-between">
            <h3 className="text-slate-800 font-bold text-sm flex items-center gap-1.5">🧾 Your Bill</h3>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              orderStatus === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-[#E4A11B] border border-amber-200'
            }`}>
              {orderStatus === 'completed' ? 'Served — Pending Payment' : orderStatus === 'preparing' ? 'Being Prepared 👨‍🍳' : orderStatus === 'ready' ? 'Ready! 🔔' : 'Order Received ✅'}
            </span>
          </div>
          <div className="px-4 py-3 space-y-2 max-h-40 overflow-y-auto">
            {(orderData.items || []).map((item: { name: string; price: number; quantity: number }, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{item.quantity} × {item.name}</span>
                <span className="text-slate-800 font-medium">Rs. {item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-blue-50 bg-blue-50/50 flex items-center justify-between">
            <span className="text-slate-700 font-semibold text-sm">Total Bill</span>
            <span className="text-[#E4A11B] font-bold text-xl">Rs. {orderData.totalAmount}</span>
          </div>
          {/* Online Payment section */}
          {(paymentAccounts.length > 0 || paymentInfo) && (
            <div className="px-4 py-3 border-t border-blue-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-700 text-sm font-medium">💳 Pay Online</span>
                <button
                  onClick={() => setOnlinePayment((p) => !p)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    onlinePayment ? 'bg-[#E4A11B]' : 'bg-slate-200'
                  }`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    onlinePayment ? 'translate-x-5' : ''
                  }`} />
                </button>
              </div>
              {onlinePayment && (
                <div className="space-y-3">
                  {paymentAccounts.length > 0 ? (
                    paymentAccounts.map((acc, idx) => (
                      <div key={`${acc.accountNo}-${idx}`} className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-1.5">
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Payment Account</p>
                        <p className="text-slate-700 text-sm">👤 {acc.accountTitle}</p>
                        {!!acc.note && <p className="text-slate-600 text-xs">{acc.note}</p>}
                        <div className="flex items-center justify-between bg-white border border-blue-100 rounded-lg px-3 py-2 mt-1">
                          <span className="text-slate-800 font-mono font-bold text-sm">{acc.accountNo}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(acc.accountNo)}
                            className="text-[#E4A11B] text-xs font-bold hover:text-amber-600 ml-2"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-1.5">
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Bank Account Details</p>
                      {paymentInfo?.bankName && <p className="text-slate-700 text-sm">🏦 {paymentInfo.bankName}</p>}
                      {paymentInfo?.accountTitle && <p className="text-slate-700 text-sm">👤 {paymentInfo.accountTitle}</p>}
                      {paymentInfo?.accountNo && (
                        <div className="flex items-center justify-between bg-white border border-blue-100 rounded-lg px-3 py-2 mt-1">
                          <span className="text-slate-800 font-mono font-bold text-sm">{paymentInfo.accountNo}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(paymentInfo.accountNo || "")}
                            className="text-[#E4A11B] text-xs font-bold hover:text-amber-600 ml-2"
                          >
                            Copy
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="text-slate-600 text-xs font-medium block mb-1.5">📷 Upload Payment Screenshot</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                  {proofFile && (
                    <button
                      onClick={submitPaymentProof}
                      disabled={proofUploading}
                      className="w-full py-2.5 rounded-xl bg-[#E4A11B] text-black font-semibold text-sm active:scale-[0.98] transition-transform disabled:opacity-60"
                    >
                      {proofUploading ? 'Submitting...' : '✅ Submit Payment Proof'}
                    </button>
                  )}
                  {orderData.paymentStatus === 'pending_approval' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                      <p className="text-amber-700 text-sm font-semibold">⏳ Payment proof submitted</p>
                      <p className="text-amber-600 text-xs mt-0.5">Waiting for staff approval...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── No-deals alert ── */}
      {noDealsAlert && (
        <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-[#E4A11B] text-xl">⚠️</span>
          <div className="flex-1">
            <p className="text-slate-700 text-sm">{noDealsAlert}</p>
          </div>
          <button
            onClick={() => setNoDealsAlert(null)}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Category Tabs ── */}
      <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-md border-b border-blue-100 px-4 py-3 mt-2 shadow-sm">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-[#E4A11B] text-black shadow-sm"
                  : "bg-blue-50 text-slate-500 hover:bg-blue-100 hover:text-slate-700 border border-blue-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Menu Grid ── */}
      <main className="flex-1 px-4 py-6">
        {menuLoading ? (
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border border-blue-100 bg-white p-6 mb-5 relative overflow-hidden shadow-sm">
              <div className="absolute -top-16 -right-12 w-40 h-40 rounded-full bg-[#E4A11B]/15 blur-2xl" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full border-2 border-[#E4A11B]/30 border-t-[#E4A11B] animate-spin" />
                <div>
                  <p className="text-[#E4A11B] font-bold text-base">Preparing Your Menu</p>
                  <p className="text-slate-400 text-sm">Loading dishes and today highlights...</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 animate-pulse">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={`menu-skeleton-${idx}`} className="rounded-xl border border-blue-100 bg-white overflow-hidden shadow-sm">
                  <div className="h-28 bg-blue-50" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 rounded bg-blue-100" />
                    <div className="h-3 rounded bg-blue-50 w-2/3" />
                    <div className="h-7 rounded bg-blue-100 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
        {/* ── Today Deals Section ── */}
        {visibleDeals.length > 0 && (
          <div ref={dealsSectionRef} className="mb-8 scroll-mt-24">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#E4A11B] text-xl">🏷️</span>
              <h2 className="text-slate-800 font-bold text-lg">Today Deal</h2>
              <span className="text-slate-400 text-xs">({visibleDeals.length})</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pb-6 border-b border-blue-100">
              {visibleDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="bg-white border border-[#22c55e]/30 rounded-xl overflow-hidden flex flex-col shadow-sm"
                >
                  {/* Deal Image */}
                  <div className="relative w-full h-28 md:h-36 bg-blue-50 flex-shrink-0">
                    {deal.image ? (
                      <img
                        src={deal.image}
                        alt={deal.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🏷️
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="bg-[#22c55e] text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        DEAL
                      </span>
                    </div>
                  </div>

                  {/* Deal Info */}
                  <div className="p-2.5 flex flex-col flex-1 gap-1">
                    <h3 className="text-slate-800 font-semibold text-[13px] leading-tight line-clamp-1">
                      {deal.name}
                    </h3>
                    <p className="text-slate-500 text-[11px] line-clamp-2">
                      {deal.itemNames || "Special combo"}
                    </p>
                    <p className="text-[#E4A11B] text-[12px] font-bold mt-auto pt-1">
                      Rs. {deal.price}
                    </p>
                    {(deal.openingTime || deal.closingTime) && (
                      <p className="text-blue-500 text-[10px]">
                        🕐 {deal.openingTime} – {deal.closingTime}
                      </p>
                    )}
                    {deal.endDate && (
                      <p className="text-slate-400 text-[10px]">
                        📅 Valid till {deal.endDate}
                      </p>
                    )}
                  </div>

                  {/* Add to Cart */}
                  <div className="px-2.5 pb-2.5">
                    <button
                      onClick={() => {
                        setCart((prev) => ({
                          ...prev,
                          [deal.id!]: {
                            item: {
                              id: deal.id!,
                              name: deal.name,
                              price: deal.price,
                              description: deal.itemNames,
                              available: true,
                            } as MenuItem,
                            quantity: (prev[deal.id!]?.quantity || 0) + 1,
                          },
                        }));
                      }}
                      className="w-full py-2 rounded-lg bg-[#E4A11B] text-black text-xs font-bold active:scale-95 transition-transform hover:bg-[#f5c842]"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Menu Items Section ── */}
        {menu.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-white border border-amber-200 rounded-2xl p-8 w-full max-w-md text-center shadow-sm">
              <span className="text-5xl mb-4 block">📋</span>
              <h2 className="text-[#E4A11B] font-bold text-lg mb-2">Menu Not Available</h2>
              <p className="text-slate-500 text-sm mb-6">
                The menu for this table has not been set up yet. Please ask the staff to add menu items.
              </p>
              
              {/* Add Test Items Button (for development) */}
              <button
                onClick={handleAddTestItems}
                disabled={addingTestItems}
                className="w-full bg-[#E4A11B] text-black font-semibold py-2 rounded-lg mb-4 disabled:opacity-50 active:scale-95 transition-all"
              >
                {addingTestItems ? "Adding Items..." : "🧪 Add Test Items"}
              </button>

              {/* Debug Info */}
              {showDebugInfo && (
                <div className="text-left mt-6 pt-6 border-t border-blue-100">
                  <button
                    onClick={() => setShowDebugInfo(!showDebugInfo)}
                    className="text-[#E4A11B] text-xs font-mono mb-3 hover:text-amber-600"
                  >
                    {showDebugInfo ? "Hide" : "Show"} Debug Info
                  </button>
                  {showDebugInfo && (
                    <div className="bg-blue-50 rounded p-3 text-left text-xs text-slate-500 font-mono">
                      <p className="mb-1"><span className="text-[#E4A11B]">Stall ID:</span> {stallId}</p>
                      <p className="mb-1"><span className="text-[#E4A11B]">Owner UID:</span> {ownerUid}</p>
                      <p className="mb-1"><span className="text-[#E4A11B]">Lookup IDs:</span> {stallIdCandidates.join(", ")}</p>
                      <p className="mb-1"><span className="text-[#E4A11B]">Table ID:</span> {tableId}</p>
                      <p className="mb-1"><span className="text-[#E4A11B]">Business:</span> {businessName}</p>
                      <p className="text-[#ff6b6b]">⚠️ No items found in Firebase</p>
                      <p className="text-[#87ceeb] mt-2 text-[10px]">Use Add Test Items to populate sample menu data</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : filteredMenu.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <span className="text-5xl mb-4">🍽️</span>
            <p className="text-base">No items in this category</p>
          </div>
        ) : (
          <>
            <h3 className="text-slate-800 font-bold text-lg mb-4">All Menu Items</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredMenu.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  quantity={cart[item.id]?.quantity || 0}
                  onAdd={() => addToCart(item)}
                  onIncrease={() => updateQty(item.id, 1)}
                  onDecrease={() => updateQty(item.id, -1)}
                  businessType={businessType}
                  isDealHighlighted={dealItemNames.has((item.name || "").trim().toLowerCase())}
                />
              ))}
            </div>
          </>
        )}
          </>
        )}
      </main>

      {/* ── Sticky Cart Bar ── */}
      {cartCount > 0 && !cartOpen && (
        <div className="sticky bottom-4 px-4 z-40">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full bg-[#E4A11B] text-black font-bold py-4 rounded-2xl flex items-center justify-between px-5 shadow-[0_8px_30px_rgba(228,161,27,0.35)] active:scale-[0.98] transition-transform"
          >
            <span className="bg-black/20 text-black text-sm px-2.5 py-0.5 rounded-full font-bold">
              {cartCount} item{cartCount > 1 ? "s" : ""}
            </span>
            <span className="text-base">View Cart</span>
            <span className="font-bold text-base">Rs. {cartTotal}</span>
          </button>
        </div>
      )}

      {/* ── Cart Drawer ── */}
      <CartDrawer
        open={cartOpen}
        cart={cart}
        total={cartTotal}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateQty}
        onPlaceOrder={handlePlaceOrder}
        placing={placingOrder}
      />

      {/* ── Specials Modal ── */}
      <OffersModal
        open={specialsModalOpen}
        type="specials"
        items={specialItems}
        cart={cart}
        onClose={() => setSpecialsModalOpen(false)}
        onAdd={addToCart}
        onIncrease={(id) => updateQty(id, 1)}
        onDecrease={(id) => updateQty(id, -1)}
        businessType={businessType}
      />

      <Footer />
    </div>
  );
}
