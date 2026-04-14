"use client";

import Link from "next/link";
import { ShoppingCartIcon, SparklesIcon, TagIcon } from "@heroicons/react/24/outline";

interface Props {
  stallId: string;
  tableId: string;
  businessName: string;
  cartCount: number;
  onCartOpen: () => void;
  onOffersClick: () => void;
  onSpecialsClick: () => void;
}

export default function Navbar({
  stallId,
  tableId,
  businessName,
  cartCount,
  onCartOpen,
  onOffersClick,
  onSpecialsClick,
}: Props) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Brand - Menu Link */}
        <Link
          href={`/${stallId}/${tableId}/menu`}
          className="text-[#E4A11B] font-bold text-base truncate max-w-[140px] sm:max-w-none hover:text-amber-600 transition-colors"
        >
          {businessName}
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          <button
            onClick={onOffersClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:text-[#E4A11B] hover:bg-blue-50 transition-colors"
          >
            <TagIcon className="w-4 h-4" />
            Today Deal
          </button>
          <button
            onClick={onSpecialsClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:text-[#E4A11B] hover:bg-blue-50 transition-colors"
          >
            <SparklesIcon className="w-4 h-4" />
            Our Specials
          </button>
        </nav>

        {/* Mobile nav */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onOffersClick}
            className="text-xs text-slate-500 hover:text-[#E4A11B] px-2 py-1 rounded transition-colors"
          >
            Deal
          </button>
          <button
            onClick={onSpecialsClick}
            className="text-xs text-slate-500 hover:text-[#E4A11B] px-2 py-1 rounded transition-colors"
          >
            Specials
          </button>
        </div>

        {/* Cart button */}
        <button
          onClick={onCartOpen}
          className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
          aria-label="Open cart"
        >
          <ShoppingCartIcon className="w-5 h-5 text-blue-700" />
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
