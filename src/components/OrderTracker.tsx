"use client";

import type { OrderStatus } from "@/types";

interface Props {
  status: OrderStatus;
}

const STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "pending", label: "Order Received", icon: "✅" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { key: "ready", label: "Ready!", icon: "🔔" },
  { key: "delivered", label: "Delivered", icon: "🎉" },
];

const ORDER_INDEX: Record<OrderStatus, number> = {
  pending: 0,
  preparing: 1,
  ready: 2,
  delivered: 3,
  completed: 3,
};

export default function OrderTracker({ status }: Props) {
  const currentIndex = ORDER_INDEX[status] ?? 0;

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
      <p className="text-white font-semibold text-sm mb-4">
        🔄 Tracking Your Order
      </p>

      {/* Steps */}
      <div className="flex items-start justify-between gap-1">
        {STEPS.map((step, index) => {
          const isDone = index <= currentIndex;
          const isActive = index === currentIndex;
          return (
            <div
              key={step.key}
              className="flex-1 flex flex-col items-center gap-1"
            >
              {/* Circle */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-base transition-all ${
                  isDone
                    ? "bg-[#E4A11B] shadow-[0_0_12px_rgba(228,161,27,0.5)]"
                    : "bg-[#2a2a2a] text-gray-600"
                } ${isActive ? "scale-110" : ""}`}
              >
                {isDone ? step.icon : "○"}
              </div>

              {/* Label */}
              <p
                className={`text-[10px] text-center leading-tight ${
                  isDone ? "text-[#E4A11B] font-medium" : "text-gray-600"
                }`}
              >
                {step.label}
              </p>

              {/* Connector (not after last) */}
              {index < STEPS.length - 1 && (
                <div className="absolute" />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-4 bg-[#2a2a2a] rounded-full h-1 overflow-hidden">
        <div
          className="h-full bg-[#E4A11B] rounded-full transition-all duration-700"
          style={{ width: `${((currentIndex) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>

      {/* Status badge */}
      <div className="mt-3 flex justify-center">
        <span className="bg-[#E4A11B]/10 border border-[#E4A11B]/30 text-[#E4A11B] text-xs px-3 py-1 rounded-full font-medium capitalize">
          {status === "pending"
            ? "Order received — please wait"
            : status === "preparing"
            ? "Chef is preparing your food..."
            : status === "ready"
            ? "Your order is ready! 🔔"
            : "Order delivered! Enjoy your meal 🎉"}
        </span>
      </div>
    </div>
  );
}
