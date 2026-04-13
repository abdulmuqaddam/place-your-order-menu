import { fetchStall } from "@/lib/firestore";
import type { Metadata } from "next";
import WelcomePage from "./WelcomePage";
import OrderingClosedMessage from "@/components/OrderingClosedMessage";

interface Props {
  params: { stallId: string; tableId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const stall = await fetchStall(params.stallId);
  const businessName =
    stall?.businessName || stall?.name || "Our Restaurant";

  return {
    title: `Menu - ${businessName}`,
    description: `Browse and order from ${businessName}. Fresh food, fast delivery to your table.`,
    openGraph: {
      title: `Menu - ${businessName}`,
      description: `Order online at ${businessName}`,
    },
  };
}

export default async function Page({ params }: Props) {
  const stall = await fetchStall(params.stallId);
  const businessName = stall?.businessName || stall?.name || "Welcome";
  const businessType = stall?.businessType || "tea_stall";
  const isOrderingOpen = stall?.isOrderingOpen !== false;

  if (!isOrderingOpen) {
    return <OrderingClosedMessage businessName={businessName} />;
  }

  return (
    <WelcomePage
      stallId={params.stallId}
      tableId={params.tableId}
      businessName={businessName}
      businessType={businessType}
    />
  );
}
