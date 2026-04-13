"use client";

import Link from "next/link";
import { ShoppingCartIcon, SparklesIcon, TagIcon } from "@heroicons/react/24/outline";

interface Props {
  businessName: string;
  cartCount: number;
  onCartOpen: () => void;
  onOffersClick: () => void;
  onSpecialsClick: () => void;
}

export default function Navbar({
  businessName,
  cartCount,
  onCartOpen,
  onOffersClick,
  onSpecialsClick,
}: Props) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0e0e0e]/95 backdrop-blur-md border-b border-[#1e1e1e]">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Brand - Home Link */}
        <Link href="/" className="text-[#E4A11B] font-bold text-base truncate max-w-[140px] sm:max-w-none hover:text-[#f5c842] transition-colors">
          {businessName}
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          <button
            onClick={onOffersClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:text-[#E4A11B] hover:bg-[#1e1e1e] transition-colors"
          >
            <TagIcon className="w-4 h-4" />
            Today Deal
          </button>
          <button
            onClick={onSpecialsClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:text-[#E4A11B] hover:bg-[#1e1e1e] transition-colors"
          >
            <SparklesIcon className="w-4 h-4" />
            Our Specials
          </button>
        </nav>

        {/* Mobile nav */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onOffersClick}
            className="text-xs text-gray-400 hover:text-[#E4A11B] px-2 py-1 rounded transition-colors"
          >
            Offers
          </button>
          <button
            onClick={onSpecialsClick}
            className="text-xs text-gray-400 hover:text-[#E4A11B] px-2 py-1 rounded transition-colors"
          >
            Specials
          </button>
        </div>

        {/* Cart button */}
        <button
          onClick={onCartOpen}
          className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#1e1e1e] hover:bg-[#2a2a2a] transition-colors border border-[#2a2a2a]"
          aria-label="Open cart"
        >
          <ShoppingCartIcon className="w-5 h-5 text-white" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#E4A11B] text-black text-[10px] font-bold rounded-full flex items-center justify-center">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
