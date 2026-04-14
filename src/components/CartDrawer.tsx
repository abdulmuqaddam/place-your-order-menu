"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Cart } from "@/types";
import { MinusIcon, PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Props {
  open: boolean;
  cart: Cart;
  total: number;
  onClose: () => void;
  onUpdateQty: (itemId: string, delta: number) => void;
  onPlaceOrder: () => void;
  placing: boolean;
}

export default function CartDrawer({
  open,
  cart,
  total,
  onClose,
  onUpdateQty,
  onPlaceOrder,
  placing,
}: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const cartItems = Object.values(cart);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            ref={backdropRef}
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdrop}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          />

          {/* Right-side Offcanvas Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white border-l border-blue-100 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-blue-100 bg-white">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛒</span>
                <div>
                  <h2 className="text-slate-800 font-bold text-base">Your Cart</h2>
                  <p className="text-slate-400 text-xs">
                    {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#F7FBFF]">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <span className="text-5xl mb-3">🛒</span>
                  <p className="text-sm font-medium">Your cart is empty</p>
                  <p className="text-xs mt-1">Add items from the menu</p>
                </div>
              ) : (
                cartItems.map(({ item, quantity }) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-white rounded-xl p-3 border border-blue-100 shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 text-sm font-semibold truncate">
                        {item.name}
                      </p>
                      <p className="text-[#E4A11B] text-xs mt-0.5 font-medium">
                        Rs. {item.price} × {quantity} ={" "}
                        <span className="font-bold">
                          Rs. {item.price * quantity}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQty(item.id, -1)}
                        className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center active:scale-90 transition-transform"
                      >
                        {quantity === 1 ? (
                          <TrashIcon className="w-3.5 h-3.5 text-red-400" />
                        ) : (
                          <MinusIcon className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </button>
                      <span className="text-slate-800 font-bold text-sm w-5 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-[#E4A11B] flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <PlusIcon className="w-3.5 h-3.5 text-black" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="px-4 pb-8 pt-4 border-t border-blue-100 bg-white space-y-3">
                <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
                  <span className="text-slate-600 text-sm font-medium">Order Total</span>
                  <span className="text-slate-800 font-bold text-xl">
                    Rs. {total}
                  </span>
                </div>
                <button
                  onClick={onPlaceOrder}
                  disabled={placing}
                  className="w-full py-4 rounded-2xl bg-[#E4A11B] text-black font-bold text-base shadow-[0_4px_20px_rgba(228,161,27,0.25)] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {placing ? "Placing Order..." : "Place Order 🍽️"}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
