import Link from "next/link";
import { fetchStall, fetchTableQrs } from "@/lib/firestore";

interface Props {
  params: { stallId: string };
}

export default async function StallQrListPage({ params }: Props) {
  const [stall, qrData] = await Promise.all([
    fetchStall(params.stallId),
    fetchTableQrs(params.stallId),
  ]);

  const businessName = stall?.businessName || stall?.name || "Our Restaurant";
  const ownerUid = qrData.ownerUid;
  const rows = qrData.rows;

  return (
    <div className="min-h-screen bg-[#121212] text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">{businessName} - Table QRs</h1>
        <p className="text-sm text-gray-400 mb-8">
          Yehi QRs mobile owner app se generate hue hain. Inhi ko print karke table par use karein.
        </p>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-[#2f2f2f] bg-[#1a1a1a] p-6">
            <p className="text-gray-300">No generated table QR found for this stall.</p>
            <p className="text-xs text-gray-500 mt-2">
              Owner app me Table QR Management khol kar Save & Generate QR chalayein.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((row) => {
              const tableNo = row.tableNo || 0;
              const menuPath = `/${ownerUid}/${tableNo}`;
              const targetUrl = row.qrValue || `${menuPath}`;

              return (
                <div key={row.id} className="rounded-2xl border border-[#2f2f2f] bg-[#1a1a1a] p-4">
                  <h2 className="text-xl font-semibold">Table {tableNo}</h2>
                  <div className="mt-3 rounded-xl bg-white p-3">
                    {row.qrUrl ? (
                      <img src={row.qrUrl} alt={`Table ${tableNo} QR`} className="w-full h-auto" />
                    ) : (
                      <div className="text-black text-xs">QR image unavailable</div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-3 break-all">{targetUrl}</p>
                  <Link
                    href={menuPath}
                    className="mt-3 inline-block rounded-lg bg-[#E4A11B] px-3 py-2 text-black text-sm font-semibold"
                  >
                    Open Menu
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
