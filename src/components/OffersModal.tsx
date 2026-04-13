"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Cart, MenuItem } from "@/types";
import MenuCard from "./MenuCard";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Props {
  open: boolean;
  type: "offers" | "specials";
  items: MenuItem[];
  cart: Cart;
  onClose: () => void;
  onAdd: (item: MenuItem) => void;
  onIncrease: (itemId: string) => void;
  onDecrease: (itemId: string) => void;
  businessType: string;
}

export default function OffersModal({
  open,
  type,
  items,
  cart,
  onClose,
  onAdd,
  onIncrease,
  onDecrease,
  businessType,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-16 bottom-4 z-50 bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl flex flex-col overflow-hidden max-w-2xl mx-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
              <div>
                <h2 className="text-white font-bold text-lg">
                  {type === "offers" ? "🏷️ Today's Offers" : "⭐ Our Specials"}
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  {items.length} item{items.length !== 1 ? "s" : ""} available
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center hover:bg-[#3a3a3a] transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    quantity={cart[item.id]?.quantity || 0}
                    onAdd={() => onAdd(item)}
                    onIncrease={() => onIncrease(item.id)}
                    onDecrease={() => onDecrease(item.id)}
                    businessType={businessType}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
