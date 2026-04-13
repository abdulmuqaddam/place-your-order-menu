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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] border-t border-[#2a2a2a] rounded-t-3xl max-h-[85vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-[#3a3a3a] rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a2a]">
              <h2 className="text-white font-bold text-lg">
                Your Cart
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})
                </span>
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center hover:bg-[#3a3a3a] transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <span className="text-4xl mb-3">🛒</span>
                  <p className="text-sm">Your cart is empty</p>
                </div>
              ) : (
                cartItems.map(({ item, quantity }) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-[#222] rounded-xl p-3 border border-[#2a2a2a]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <p className="text-[#E4A11B] text-xs mt-0.5">
                        Rs. {item.price} × {quantity} ={" "}
                        <span className="font-semibold">
                          Rs. {item.price * quantity}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQty(item.id, -1)}
                        className="w-7 h-7 rounded-lg bg-[#2a2a2a] flex items-center justify-center active:scale-90 transition-transform"
                      >
                        {quantity === 1 ? (
                          <TrashIcon className="w-3.5 h-3.5 text-red-400" />
                        ) : (
                          <MinusIcon className="w-3.5 h-3.5 text-gray-300" />
                        )}
                      </button>
                      <span className="text-white font-bold text-sm w-5 text-center">
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
              <div className="px-5 pb-8 pt-4 border-t border-[#2a2a2a] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Total</span>
                  <span className="text-white font-bold text-lg">
                    Rs. {total}
                  </span>
                </div>
                <button
                  onClick={onPlaceOrder}
                  disabled={placing}
                  className="w-full py-4 rounded-2xl bg-[#E4A11B] text-black font-bold text-base shadow-[0_4px_20px_rgba(228,161,27,0.3)] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
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
