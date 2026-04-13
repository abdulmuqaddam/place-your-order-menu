"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  stallId: string;
  tableId: string;
  businessName: string;
  businessType: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getEmoji(businessType: string): string {
  switch (businessType) {
    case "pizza_shop":
      return "🍕";
    case "restaurant":
      return "🍽️";
    case "veg_fruit_stall":
      return "🥦";
    default:
      return "☕";
  }
}

export default function WelcomePage({
  stallId,
  tableId,
  businessName,
  businessType,
}: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const countTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const redirect = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        router.replace(`/${stallId}/${tableId}/menu`);
      }, 600);
    }, 5000);

    return () => {
      clearTimeout(redirect);
      clearInterval(countTimer);
    };
  }, [router, stallId, tableId]);

  const handleSkip = () => {
    setVisible(false);
    setTimeout(() => {
      router.replace(`/${stallId}/${tableId}/menu`);
    }, 400);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#121212] overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#E4A11B] opacity-[0.06] blur-[120px]" />
          </div>

          {/* Logo / Emoji */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-6xl mb-6"
          >
            {getEmoji(businessType)}
          </motion.div>

          {/* Greeting */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#E4A11B] text-xl font-medium tracking-widest uppercase mb-3"
          >
            {getGreeting()}
          </motion.p>

          {/* Business Name */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="text-4xl md:text-5xl font-bold text-white text-center px-6 mb-2"
          >
            {businessName}
          </motion.h1>

          {/* Table badge */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 px-5 py-2 rounded-full border border-[#E4A11B]/40 text-[#E4A11B] text-sm font-medium"
          >
            Table {tableId}
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-6 text-gray-400 text-sm text-center px-8"
          >
            Browse our menu and place your order right from here
          </motion.p>

          {/* Countdown bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-10 w-60 flex flex-col items-center gap-3"
          >
            <div className="w-full bg-[#2a2a2a] rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-[#E4A11B] rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
              />
            </div>
            <p className="text-gray-500 text-xs">
              Redirecting in {countdown}s...
            </p>
          </motion.div>

          {/* Skip button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            onClick={handleSkip}
            className="mt-6 text-[#E4A11B] text-sm underline underline-offset-2 hover:text-[#f5c842] transition-colors"
          >
            View Menu Now →
          </motion.button>

          {/* Bottom brand */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-6 text-gray-600 text-xs"
          >
            Powered by Order Verse · IT Verse Solutions
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
