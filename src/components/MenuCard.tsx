"use client";

import Image from "next/image";
import type { MenuItem } from "@/types";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

interface Props {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  businessType: string;
}

function getPriceLabel(item: MenuItem, businessType: string): string {
  if (businessType === "restaurant" && item.kgPrice) {
    return `Rs. ${item.price} / plate · Rs. ${item.kgPrice} / kg`;
  }
  if (
    (businessType === "tea_stall" || businessType === "pizza_shop") &&
    item.halfPrice
  ) {
    return `Full: Rs. ${item.price} · Half: Rs. ${item.halfPrice}`;
  }
  if (businessType === "veg_fruit_stall" && item.unit) {
    return `Rs. ${item.price} / ${item.unit}`;
  }
  return `Rs. ${item.price}`;
}

export default function MenuCard({
  item,
  quantity,
  onAdd,
  onIncrease,
  onDecrease,
  businessType,
}: Props) {
  return (
    <div className="menu-card bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden flex flex-col shadow-[0_6px_18px_rgba(0,0,0,0.25)]">
      {/* Image */}
      <div className="relative w-full h-28 md:h-36 bg-[#2a2a2a] flex-shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🍽️
          </div>
        )}
        {(item.isOffer || item.isSpecial) && (
          <div className="absolute top-2 left-2 flex gap-1">
            {item.isOffer && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                OFFER
              </span>
            )}
            {item.isSpecial && (
              <span className="bg-[#E4A11B] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                SPECIAL
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 flex flex-col flex-1 gap-1">
        <h3 className="text-white font-semibold text-[13px] leading-tight line-clamp-1">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-gray-500 text-[11px] line-clamp-2">{item.description}</p>
        )}
        <p className="text-[#E4A11B] text-[11px] font-semibold mt-auto pt-1">
          {getPriceLabel(item, businessType)}
        </p>
      </div>

      {/* Add to Cart */}
      <div className="px-2.5 pb-2.5">
        {quantity === 0 ? (
          <button
            onClick={onAdd}
            className="w-full py-2 rounded-lg bg-[#E4A11B] text-black text-xs font-bold active:scale-95 transition-transform hover:bg-[#f5c842]"
          >
            Add to Cart
          </button>
        ) : (
          <div className="flex items-center justify-between bg-[#2a2a2a] rounded-lg px-2.5 py-1.5">
            <button
              onClick={onDecrease}
              className="w-6 h-6 rounded-md bg-[#1e1e1e] flex items-center justify-center active:scale-90 transition-transform"
            >
              <MinusIcon className="w-4 h-4 text-[#E4A11B]" />
            </button>
            <span className="text-white font-bold text-xs min-w-[20px] text-center">
              {quantity}
            </span>
            <button
              onClick={onIncrease}
              className="w-6 h-6 rounded-md bg-[#E4A11B] flex items-center justify-center active:scale-90 transition-transform"
            >
              <PlusIcon className="w-4 h-4 text-black" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
