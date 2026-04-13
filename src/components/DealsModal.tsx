"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { Deal } from "@/types";
import { XMarkIcon, ClockIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

interface Props {
  open: boolean;
  deals: Deal[];
  onClose: () => void;
}

export default function DealsModal({ open, deals, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="deal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            key="deal-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-16 bottom-4 z-50 bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl flex flex-col overflow-hidden max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
              <div>
                <h2 className="text-white font-bold text-lg">Hot Deals</h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  {deals.length} deal{deals.length !== 1 ? "s" : ""} live now
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center hover:bg-[#3a3a3a] transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deals.map((deal) => (
                  <div key={deal.id} className="rounded-2xl border border-[#2f2f2f] bg-[#121212] overflow-hidden">
                    <div className="relative h-40 bg-[#2a2a2a]">
                      {deal.image ? (
                        <Image src={deal.image} alt={deal.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🏷️</div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-white font-bold text-base">{deal.name}</h3>
                      <p className="text-[#E4A11B] font-semibold mt-1">Rs. {deal.price}</p>

                      <p className="text-gray-300 text-xs mt-3 line-clamp-3">{deal.itemNames}</p>

                      <div className="mt-3 space-y-1">
                        <p className="text-gray-400 text-xs flex items-center gap-1.5">
                          <ClockIcon className="w-4 h-4" /> {deal.openingTime} - {deal.closingTime}
                        </p>
                        <p className="text-gray-400 text-xs flex items-center gap-1.5">
                          <CalendarDaysIcon className="w-4 h-4" /> Valid till {deal.endDate}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
