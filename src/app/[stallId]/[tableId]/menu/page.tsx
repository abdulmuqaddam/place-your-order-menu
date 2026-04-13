import { fetchMenu, fetchStall } from "@/lib/firestore";
import type { Metadata } from "next";
import MenuClient from "./MenuClient";

interface Props {
  params: { stallId: string; tableId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const stall = await fetchStall(params.stallId);
  const businessName = stall?.businessName || stall?.name || "Our Restaurant";
  return {
    title: `Menu - ${businessName}`,
    description: `Order fresh food from ${businessName}. Fast delivery to your table.`,
  };
}

export default async function MenuPage({ params }: Props) {
  const stall = await fetchStall(params.stallId);
  const resolvedOwnerUid = stall?.ownerUid || params.stallId;
  const menuItems = await fetchMenu(params.stallId, resolvedOwnerUid);

  const businessName = stall?.businessName || stall?.name || "Our Restaurant";
  const businessType = stall?.businessType || "tea_stall";

  return (
    <MenuClient
      stallId={params.stallId}
      ownerUid={resolvedOwnerUid}
      tableId={params.tableId}
      businessName={businessName}
      businessType={businessType}
      initialMenu={menuItems}
    />
  );
}
