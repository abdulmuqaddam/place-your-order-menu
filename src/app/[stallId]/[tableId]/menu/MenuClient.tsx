"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import type { Cart, MenuItem, Order, OrderStatus } from "@/types";
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
  const [cart, setCart] = useState<Cart>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [offersModal, setOffersModal] = useState<{
    open: boolean;
    type: "offers" | "specials";
  }>({ open: false, type: "offers" });
  const [noDealsAlert, setNoDealsAlert] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(initialMenu.length === 0);
  const [addingTestItems, setAddingTestItems] = useState(false);

  // ── Real-time menu listener ─────────────────────────────────────────────────
  useEffect(() => {
    if (stallIdCandidates.length === 0) {
      setMenu([]);
      return;
    }

    const q = stallIdCandidates.length === 1
      ? query(collection(db, "menu"), where("stallId", "==", stallIdCandidates[0]))
      : query(collection(db, "menu"), where("stallId", "in", stallIdCandidates.slice(0, 10)));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() } as MenuItem))
        .filter((item) => item.available !== false);
      setMenu(items);
    });

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
  const offerItems = useMemo(
    () => menu.filter((i) => i.isOffer === true),
    [menu]
  );
  const specialItems = useMemo(
    () => menu.filter((i) => i.isSpecial === true),
    [menu]
  );

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
      setOrderSuccess(true);
      setCartOpen(false);
      clearCart();
    } catch (err) {
      console.error("Order failed:", err);
    } finally {
      setPlacingOrder(false);
    }
  }, [cart, cartTotal, placingOrder, ownerUid, tableId, clearCart]);

  // ── Live Order Listener ────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, "orders", orderId), (snap) => {
      if (snap.exists()) {
        setOrderStatus(snap.data().status as OrderStatus);
      }
    });
    return unsub;
  }, [orderId]);

  // ── Navbar handler ─────────────────────────────────────────────────────────
  const handleNavAction = (type: "offers" | "specials") => {
    const items = type === "offers" ? offerItems : specialItems;
    if (items.length === 0) {
      const msg =
        type === "offers"
          ? "We are currently not offering any deals today. Stay tuned!"
          : "No special items available right now. Check back soon!";
      setNoDealsAlert(msg);
      return;
    }
    setOffersModal({ open: true, type });
  };

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
    <div className="min-h-screen bg-[#121212] flex flex-col">
      <Navbar
        businessName={businessName}
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        onOffersClick={() => handleNavAction("offers")}
        onSpecialsClick={() => handleNavAction("specials")}
      />

      {/* ── Hero banner ── */}
      <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#121212] pt-20 pb-8 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#E4A11B] opacity-[0.04] blur-[80px] rounded-full" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white relative z-10">
          {businessName}
        </h1>
        <p className="text-[#E4A11B] text-sm mt-1 relative z-10 font-medium">
          Table {tableId} · Scan & Order
        </p>
      </div>

      {/* ── Order success toast ── */}
      {orderSuccess && orderId && (
        <div className="mx-4 mt-4 bg-[#1a2a1a] border border-green-700/50 rounded-xl p-4">
          <p className="text-green-400 font-semibold text-sm mb-1">
            ✅ Order placed successfully!
          </p>
          <p className="text-gray-400 text-xs">
            Thanks for ordering! Please wait while we prepare your meal.
          </p>
        </div>
      )}

      {/* ── Live Order Tracker ── */}
      {orderId && orderStatus && (
        <div className="mx-4 mt-3">
          <OrderTracker status={orderStatus} />
        </div>
      )}

      {/* ── No-deals alert ── */}
      {noDealsAlert && (
        <div className="mx-4 mt-4 bg-[#1e1a10] border border-[#E4A11B]/30 rounded-xl p-4 flex items-start gap-3">
          <span className="text-[#E4A11B] text-xl">⚠️</span>
          <div className="flex-1">
            <p className="text-[#E4A11B] text-sm">{noDealsAlert}</p>
          </div>
          <button
            onClick={() => setNoDealsAlert(null)}
            className="text-gray-500 hover:text-gray-300 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Category Tabs ── */}
      <div className="sticky top-14 z-30 bg-[#121212]/95 backdrop-blur-md border-b border-[#2a2a2a] px-4 py-3 mt-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-[#E4A11B] text-black"
                  : "bg-[#1e1e1e] text-gray-400 hover:bg-[#2a2a2a] hover:text-white border border-[#2a2a2a]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Menu Grid ── */}
      <main className="flex-1 px-4 py-6">
        {menu.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-[#1e1e1e] border border-[#E4A11B]/30 rounded-2xl p-8 w-full max-w-md text-center">
              <span className="text-5xl mb-4 block">📋</span>
              <h2 className="text-[#E4A11B] font-bold text-lg mb-2">Menu Not Available</h2>
              <p className="text-gray-400 text-sm mb-6">
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
                <div className="text-left mt-6 pt-6 border-t border-[#2a2a2a]">
                  <button
                    onClick={() => setShowDebugInfo(!showDebugInfo)}
                    className="text-[#E4A11B] text-xs font-mono mb-3 hover:text-white"
                  >
                    {showDebugInfo ? "Hide" : "Show"} Debug Info
                  </button>
                  {showDebugInfo && (
                    <div className="bg-[#0a0a0a] rounded p-3 text-left text-xs text-gray-400 font-mono">
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
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <span className="text-5xl mb-4">🍽️</span>
            <p className="text-base">No items in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMenu.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                quantity={cart[item.id]?.quantity || 0}
                onAdd={() => addToCart(item)}
                onIncrease={() => updateQty(item.id, 1)}
                onDecrease={() => updateQty(item.id, -1)}
                businessType={businessType}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Sticky Cart Bar ── */}
      {cartCount > 0 && !cartOpen && (
        <div className="sticky bottom-4 px-4 z-40">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full bg-[#E4A11B] text-black font-bold py-4 rounded-2xl flex items-center justify-between px-5 shadow-[0_8px_30px_rgba(228,161,27,0.4)] active:scale-[0.98] transition-transform"
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

      {/* ── Offers / Specials Modal ── */}
      <OffersModal
        open={offersModal.open}
        type={offersModal.type}
        items={offersModal.type === "offers" ? offerItems : specialItems}
        cart={cart}
        onClose={() => setOffersModal((s) => ({ ...s, open: false }))}
        onAdd={addToCart}
        onIncrease={(id) => updateQty(id, 1)}
        onDecrease={(id) => updateQty(id, -1)}
        businessType={businessType}
      />

      <Footer />
    </div>
  );
}
